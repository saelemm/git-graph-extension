import { fetchCommits } from './fetchCommits.js';
import { createGitgraph } from "@gitgraph/js";

export async function renderGraph(container, owner, repo) {
  const commits = await fetchCommits(owner, repo);

  if (!container) return;

  container.innerHTML = '';

  //const graphContainer = document.getElementById("gitGraph");
  const gitgraph = createGitgraph(container);

  const main = gitgraph.branch("main");

  commits.forEach((commit) => {
    const message = commit.commit.message.split("\n")[0];
    main.commit({
      subject: message,
      author: commit.commit.author.name,
    });
  });
}