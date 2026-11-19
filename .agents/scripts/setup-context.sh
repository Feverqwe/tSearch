#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo_root=$(CDPATH= cd -- "$script_dir/../.." && pwd)
workspace="$repo_root/.codex"

ensure_directory() {
  if [ -L "$1" ] || { [ -e "$1" ] && [ ! -d "$1" ]; }; then
    printf 'Expected a local directory at %s\n' "$1" >&2
    exit 1
  fi
  mkdir -p "$1"
}

ensure_link() {
  link_path=$1
  link_target=$2

  if [ -L "$link_path" ] && [ "$(readlink "$link_path")" = "$link_target" ]; then
    return
  fi
  if [ -e "$link_path" ] || [ -L "$link_path" ]; then
    printf 'Keeping existing path at %s. Move it aside to create the link.\n' "$link_path" >&2
    exit 1
  fi
  ln -s "$link_target" "$link_path"
}

copy_if_missing() {
  if [ ! -e "$2" ] && [ ! -L "$2" ]; then
    (set -C; cat "$1" > "$2")
  fi
}

ensure_directory "$workspace"
ensure_directory "$workspace/notes"
ensure_directory "$workspace/dialogs"
ensure_directory "$workspace/templates"

ensure_link "$workspace/AGENTS.md" ../AGENTS.md
ensure_link "$workspace/docs" ../docs
copy_if_missing "$repo_root/.agents/templates/Home.md" "$workspace/Home.md"
copy_if_missing "$repo_root/.agents/templates/handoff.md" "$workspace/templates/handoff.md"

printf 'Агентский контекст готов: %s/Home.md\n' "$workspace"
