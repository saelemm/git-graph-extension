import { Octokit } from '@octokit/rest';

export async function fetchActions(owner, repo) {
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  if (!token) {
    console.error('❌ GitHub token is missing!');
    return [];
  }

  const octokit = new Octokit({
    auth: token,
  });

  try {
    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/actions/runs',
      {
        owner: owner,
        repo: repo,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    console.log(`✅ Fetched ${response.data.length} actions`);
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error(`❌ GitHub API error:`, err);
    return [];
  }
}
