export const profilesPath = '/options/profiles';

export function profileRoute(id?: string, search = '') {
  return `${profilesPath}${id ? `/${encodeURIComponent(id)}` : ''}${search}`;
}
