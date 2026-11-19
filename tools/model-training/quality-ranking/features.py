"""Interpretable title and metadata features shared by training and JSON export."""

from __future__ import annotations

import re
from dataclasses import dataclass

TOKEN_START = r"(?<![^\W_])"
TOKEN_END = r"(?![^\W_])"
VIDEO = {0, 3, 4, 7, 8, 9, 11}
MIB = 1024**2
GIB = 1024 * MIB


@dataclass
class Feature:
    name: str
    criterion: str
    pattern: str = ""
    min_bytes: int | None = None
    max_bytes: int | None = None
    max_age_days: int | None = None
    min_age_days: int | None = None

    def __post_init__(self):
        self.regex = re.compile(self.pattern, re.I) if self.pattern else None

    def rule(self):
        pattern = self.pattern.replace(r"[^\W_]", r"[\p{L}\p{N}]")
        pattern = (
            pattern.replace(r"\w", r"[\p{L}\p{N}_]").replace(r"\d", r"\p{Nd}") or "^"
        )
        rule = {
            "title": self.name,
            "patterns": [{"text": pattern, "regex": True}],
            "weights": [],
        }
        for key, value in {
            "minBytes": self.min_bytes,
            "maxBytes": self.max_bytes,
            "minAgeDays": self.min_age_days,
            "maxAgeDays": self.max_age_days,
        }.items():
            if value is not None:
                rule[key] = value
        return rule

    def matches(self, row, title, size=True, date=True):
        if self.min_bytes is not None or self.max_bytes is not None:
            value = row.get("sizeBytes") if size else None
            if not value or not interval(value, self.min_bytes, self.max_bytes):
                return False
        if self.min_age_days is not None or self.max_age_days is not None:
            age = row.get("age") if date else None
            if age is None or not interval(age, self.min_age_days, self.max_age_days):
                return False
        return self.regex is None or bool(self.regex.search(title))


def interval(value, minimum, maximum):
    return (minimum is None or value >= minimum) and (
        maximum is None or value < maximum
    )


def word(name, criterion, alternatives=None):
    return Feature(
        name,
        criterion,
        TOKEN_START + "(?:" + (alternatives or re.escape(name)) + ")" + TOKEN_END,
    )


TITLE_FEATURES = [
    word("2160p", "resolution", r"2160[pi]|4k|uhd"),
    word("1080p", "resolution", r"1080p|full[ ._-]?hd"),
    word("1080i", "resolution"),
    word("720p", "resolution"),
    word("SD", "resolution", r"[345]?[24678]0[pi]|576[pi]|sd"),
    word(
        "Blu-ray / Remux", "video", r"blu[ ._-]?ray|(?:uhd[ ._-]?)?bd[ ._-]?remux|remux"
    ),
    word("BDRip", "video", r"bd[ ._-]?rip(?:[ ._-]?avc)?|brrip"),
    word("WEB-DL", "video", r"web[ ._-]?dl(?![ ._-]?rip)"),
    word("WEBRip", "video", r"web[ ._-]?(?:dl[ ._-]?)?rip"),
    word("HDTV", "video", r"hdtv(?:[ ._-]?rip)?|sathd"),
    word("HDRip", "video", r"hd[ ._-]?rip(?:[ ._-]?avc)?"),
    word("DVD", "video", r"dvd[59]|dvd[ ._-]?video|dvd[ ._-]?rip(?:[ ._-]?avc)?"),
    word(
        "CAM / TS",
        "video",
        r"cam[ ._-]?rip(?:[ ._-]?avc)?|hd[ ._-]?ts|telesync|telecine",
    ),
    word("HEVC", "video", r"[hx][ ._-]?265|hevc"),
    word("AVC", "video", r"[hx][ ._-]?264|avc"),
    word("AV1", "video"),
    word("HDR / Dolby Vision", "video", r"hdr(?:10\+?)?|dolby[ ._-]?vision|dv"),
    word("50/60 fps", "video", r"[56]0[ ._-]*fps"),
    word("10 bit", "video", r"10[ ._-]?bit|hi10p"),
    word("IPTV / DVB", "video", r"iptv(?:rip)?|dvb(?:rip)?|satrip"),
    word("FLAC / ALAC / APE", "audio", r"flac|alac|ape|wavpack|lossless"),
    word("DSD / Hi-Res", "audio", r"dsf|dsd(?:64|128|256|512)?|sacd|hi[ ._-]?res"),
    word("MP3 / AAC", "audio", r"mp3|m4a|aac|ogg|opus|lossy"),
    word("320 kbps", "audio", r"320(?:[ ._-]*k(?:bps)?)"),
    word("≤ 192 kbps", "audio", r"(?:64|96|112|128|160|192)[ ._-]*k(?:bps)?"),
    word("Atmos / TrueHD / DTS-HD", "audio", r"atmos|truehd|dts[ ._-]?hd"),
    word("Студийная озвучка", "audio", r"dub|дубляж|itunes"),
    word("Steam / GOG", "game", r"steam|gog"),
    word("RePack", "game", r"re[ ._-]?pack|репак"),
    word("DLC", "game"),
    word("Portable", "game"),
    word(
        "Игровые платформы",
        "game",
        r"ps[2345]|psp|xbox(?:[ ._-]?(?:one|360))?|switch|nintendo",
    ),
    word(
        "Сезон / серия", "category", r"сезон(?:ы|а|ов)?|сери(?:я|и|й)|season|episodes?"
    ),
    word("S01E02", "category", r"s\d{1,3}(?:[ ._-]?e\d{1,4})?|\d{1,2}x\d{2}"),
    word("Аниме", "category", r"anime|аниме|ova|ona|jap|jpn|japanese|raws"),
    word(
        "Мультфильм",
        "category",
        r"мульт(?:фильм|сериал)(?:ы|ов)?|мультик|animation|cartoon",
    ),
    word(
        "Жанр мультфильма", "category", r"детский|мультфэнтези|анимация|мультипликация"
    ),
    word(
        "Документальный",
        "category",
        r"документальн\w*|documentary|national[ ._-]geographic|научно[ ._-]+популярн\w*",
    ),
    word(
        "Спорт",
        "category",
        r"гран[ ._-]?при|формула[ ._-]?1|formula[ ._-]?1|f1tv|кхл|нхл|nba|uefa|финал|турнир|матч|хоккей|футбол",
    ),
    word(
        "ТВ-шоу",
        "category",
        r"ток[ ._-]?шоу|тв[ ._-]?шоу|реалити|развлекательн\w*|юмор\w*",
    ),
    word("18+", "category", r"18\+|xxx|nsfw|porn|hentai|18[ ._-]+plus"),
    word("Электронная книга", "category", r"epub|fb2|mobi|azw3|djvu|cbz|cbr|pdf"),
    word("Аудиокнига", "category", r"аудиокниг\w*|m4b|audiobook"),
    word(
        "Музыкальный альбом",
        "category",
        r"tracks|lossless|remaster(?:ed)?|discography|саундтрек|дискография|альбом|cue|ost",
    ),
    word(
        "Софт",
        "category",
        r"msdn|adobe|activator|portable|build|windows|macos|x64|x86|arm64|multilingual",
    ),
    word("Сборка / версия", "category", r"v?\d+\.\d+\.\d+(?:\.\d+)?"),
    word("ISO", "category"),
    word(
        "Кино",
        "category",
        r"триллер|мелодрама|криминал|боевик|фэнтези|фантастика|комедия|драма|thriller",
    ),
    word(
        "Игровой жанр",
        "category",
        r"rpg|action|simulation|shooter|adventure|strategy|platformer|roguelike",
    ),
    word("Метки озвучки", "category", r"mvo|dvo|avo|pvo|sub|дубляж"),
]
SIZE_FEATURES = [
    Feature("Размер до 16 МиБ", "size", min_bytes=1, max_bytes=16 * MIB),
    Feature("Размер 16–128 МиБ", "size", min_bytes=16 * MIB, max_bytes=128 * MIB),
    Feature("Размер 128–512 МиБ", "size", min_bytes=128 * MIB, max_bytes=512 * MIB),
    Feature("Размер 512 МиБ – 2 ГиБ", "size", min_bytes=512 * MIB, max_bytes=2 * GIB),
    Feature("Размер 2–8 ГиБ", "size", min_bytes=2 * GIB, max_bytes=8 * GIB),
    Feature("Размер 8–32 ГиБ", "size", min_bytes=8 * GIB, max_bytes=32 * GIB),
    Feature("Размер от 32 ГиБ", "size", min_bytes=32 * GIB),
]
DATE_FEATURES = [
    Feature("Опубликовано менее 7 дней назад", "date", min_age_days=0, max_age_days=7),
    Feature("Опубликовано 7–30 дней назад", "date", min_age_days=7, max_age_days=30),
    Feature("Опубликовано более 30 дней назад", "date", min_age_days=30),
]
