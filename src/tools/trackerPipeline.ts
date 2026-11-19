import exKitPipelineMethods from './exKitPipelineMethods.ts';
import type {PipelineStep} from '../components/selectorTypes.ts';

type Pipeline = (value: unknown) => unknown;

export async function compilePipeline(
  steps: readonly {name: string; args?: unknown[]}[],
): Promise<Pipeline> {
  const methods = await Promise.all(
    steps.map(async ({name, args = []}, index) => {
      try {
        if (!Object.hasOwn(exKitPipelineMethods, name)) throw new Error('Unknown method');
        return await exKitPipelineMethods[name].getMethod(...args);
      } catch (error) {
        throw new PipelineError(index, name, error);
      }
    }),
  );
  return (input) =>
    methods.reduce((value, method, index) => {
      try {
        return method(value);
      } catch (error) {
        throw new PipelineError(index, steps[index].name, error);
      }
    }, input);
}

export class PipelineError extends Error {
  readonly step: number;

  constructor(step: number, name: string, cause: unknown) {
    super(`${step + 1}. ${name}: ${cause instanceof Error ? cause.message : String(cause)}`, {
      cause,
    });
    this.step = step;
  }
}

export async function checkPipelineStep(step: PipelineStep): Promise<string | undefined> {
  if (!Object.hasOwn(exKitPipelineMethods, step.name)) return step.name;
  const method = exKitPipelineMethods[step.name];
  const args = step.args ?? [];
  for (const [index, argument] of (method.args ?? []).entries()) {
    const value = args[index];
    if (
      argument.type === 'number' &&
      (String(value ?? '').trim() === '' || !Number.isFinite(Number(value)))
    ) {
      return argument.name;
    }
    if (
      argument.type === 'select' &&
      !argument.values?.some(({key}) => String(key) === String(value))
    ) {
      return argument.name;
    }
    if (
      argument.type === 'string' &&
      (value === undefined || (index !== 1 && !String(value).trim()))
    ) {
      return argument.name;
    }
  }
  try {
    await method.getMethod(...args);
  } catch {
    return method.args?.[0]?.name ?? step.name;
  }
}
