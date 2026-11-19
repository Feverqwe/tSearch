import type {PipelineStep} from './selectorTypes';

export default function PipelineChain({steps}: {steps: readonly PipelineStep[]}) {
  if (!steps.length) return null;
  return (
    <ol className="ts-pipeline-chain">
      {steps.map(({name, args}, index) => (
        <li key={index}>
          {index > 0 && <span aria-hidden="true">→ </span>}
          <code>{name}</code>(
          {args?.map((arg, position) => {
            const value = JSON.stringify(arg);
            return (
              <span key={position}>
                {position > 0 && ', '}
                {value.length > 24 ? (
                  <span title={value} aria-label={value}>
                    …
                  </span>
                ) : (
                  value
                )}
              </span>
            );
          })}
          )
        </li>
      ))}
    </ol>
  );
}
