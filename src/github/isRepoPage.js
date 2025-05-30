export function isRepoPage() {
  return /^https:\/\/github\.com\/[^\/]+\/[^\/]+(\/)?/.test(location.href);
}
