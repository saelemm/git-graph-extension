export function isRepoPage() {
  return /^https:\/\/github\.com\/[^\/]+\/[^\/]+(\/)?/.test(location.href);
  // test fork of fork of fork of fork
}
