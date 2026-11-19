import type getExploreModuleCodeMeta from './getExploreModuleCodeMeta';
import getLogger from './getLogger';
import loadLocalExplorerModule from './loadLocalExplorerModule';
import storageGet from './storageGet';
import builtInModules from '../explorers.json';

export interface ExplorerModule {
  id: string;
  code: string;
  meta: ReturnType<typeof getExploreModuleCodeMeta>;
}
const logger = getLogger('explorer modules');

export default async function getExplorerModules(): Promise<Record<string, ExplorerModule>> {
  const {explorerModules} = await storageGet({
    explorerModules: {} as Record<string, ExplorerModule>,
  });
  const packaged = await Promise.all(
    Object.keys(builtInModules).map(async (id) => {
      try {
        const module = await loadLocalExplorerModule(id);
        return [id, module] as const;
      } catch (error) {
        logger.error('Could not load packaged module', id, error);
        return undefined;
      }
    }),
  );
  return {
    ...explorerModules,
    ...Object.fromEntries(packaged.filter((module) => module !== undefined)),
  };
}
