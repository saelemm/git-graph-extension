import { Octokit } from '@octokit/rest';

export async function fetchArtifacts(owner, repo) {
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
      'GET /repos/{owner}/{repo}/actions/artifacts',
      {
        owner: owner,
        repo: repo,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    //console.log(`✅ Fetched ${response.data.length} artifacts`);
    // console.log(response.data);
    return response.data;
  } catch (err) {
    console.error(`❌ GitHub API error:`, err);
    return [];
  }
}
