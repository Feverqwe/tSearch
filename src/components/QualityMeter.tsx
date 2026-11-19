export default function QualityMeter({value}: {value?: number}) {
  const score = value !== undefined && Number.isFinite(value) ? value : undefined;
  const fill = Math.max(0, Math.min(100, ((score ?? 0) / 500) * 100));
  const level =
    score === undefined ? 'none' : score < 275 ? 'low' : score >= 400 ? 'high' : 'medium';
  return (
    <span className="quality_box" data-level={level} title={score?.toString()}>
      <span aria-hidden="true" className="quality_progress" style={{width: fill + '%'}} />
      <span className="quality_value">{score ?? '—'}</span>
    </span>
  );
}
