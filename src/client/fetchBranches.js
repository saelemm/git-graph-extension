import { Octokit } from '@octokit/rest';

export async function fetchBranches(owner, repo) {
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  if (!token) {
    console.error('❌ GitHub token is missing!');
    return [];
  }

  const octokit = new Octokit({
    auth: token,
  });

  try {
    const response = await octokit.rest.repos.listBranches({
      owner,
      repo,
      per_page: 100,
    });

    //console.log(`✅ Fetched ${response.data.length} branches`);
    // console.log(response.data);
    return response.data;
  } catch (err) {
    console.error(`❌ GitHub API error:`, err);
    return [];
  }
}
