import ModuleWorker from './moduleWorker';
import {ErrorWithCode} from './errors';

interface ExplorerResult {
  success: boolean;
  items?: PackagedExplorerItem[];
}

export default class ExplorerModuleWorker extends ModuleWorker {
  async getItems(params: Record<string, unknown>) {
    await this.init();
    return this.apply('events.getItems', [params]);
  }

  async sendCommand(command: string, params: Record<string, unknown>) {
    await this.init();
    return this.apply('events.command', [command, params]);
  }

  private async apply(action: string, args: unknown[]) {
    const result = await this.callFn<ExplorerResult | undefined>(action, args);
    if (!result) throw new ErrorWithCode('Result is empty', 'EMPTY_RESULT');
    if (!result.success) throw new ErrorWithCode('Result is not success', 'NOT_SUCCESS');
    return result;
  }
}
