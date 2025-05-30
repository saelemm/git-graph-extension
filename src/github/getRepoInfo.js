export function getRepoInfo() {
  const parts = location.pathname.split('/');
  if (parts.length < 3) return null;
  const owner = parts[1];
  const repo = parts[2];
  console.log('Detected owner:', owner, 'repo:', repo);
  return { owner, repo };
}
