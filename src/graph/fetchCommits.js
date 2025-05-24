const GITHUB_TOKEN = ''; // Ideally retrieved from extension storage

export async function fetchCommits(owner, repo) {
  const token = GITHUB_TOKEN;
  let commits = [];
  let page = 1;
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  while (page <= 2) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&page=${page}`, {
      headers
    });
    if (!res.ok) {
      console.error('GitHub API error:', res.status, await res.text());
      break;
    }
    const data = await res.json();
    if (!data.length) break;
    commits.push(...data);
    page++;
  }
  return commits;
}
