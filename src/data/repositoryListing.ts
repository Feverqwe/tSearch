export interface RepositoryFile {
  name: string;
  html_url: string;
  download_url: string;
}

export function catalogFromListings(
  sources: readonly string[],
  listings: readonly PromiseSettledResult<readonly RepositoryFile[]>[],
) {
  const files = new Map<string, RepositoryFile>();
  const failures: string[] = [];
  let succeeded = 0;
  listings.forEach((result, index) => {
    if (result.status === 'rejected') failures.push(sources[index]);
    else {
      succeeded++;
      for (const file of result.value)
        if (!files.has(file.download_url)) files.set(file.download_url, file);
    }
  });
  return {files: [...files.values()], failures, succeeded};
}
