import {Fragment} from 'react';

import {
  defaultTitlePresentation,
  titleSpans,
  type TitleMatch,
  type TitlePresentation,
} from '../tools/titlePresentation';

export default function ResultTitle({
  title,
  matches = [],
  presentation = defaultTitlePresentation,
}: {
  title: string;
  matches?: readonly TitleMatch[];
  presentation?: TitlePresentation;
}) {
  return titleSpans(title, presentation.highlight ? matches : []).map(
    ({text, bracket, match}, i) => {
      const tone = bracket ? presentation.brackets[bracket] : 'normal';
      const content = match ? <b>{text}</b> : text;
      return tone === 'normal' ? (
        <Fragment key={i}>{content}</Fragment>
      ) : (
        <span className={`title-tone-${tone}`} key={i}>
          {content}
        </span>
      );
    },
  );
}
