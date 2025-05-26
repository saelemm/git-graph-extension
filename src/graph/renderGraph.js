import { fetchCommits } from './fetchCommits.js';
import { createGitgraph } from "@gitgraph/js";
import { commitTab } from "./commitTab.js";

export async function renderGraph(container, owner, repo) {
  const commits = await fetchCommits(owner, repo);

  if (!container) return;
  container.innerHTML = '';
  container.style.display = "flex";
  const tabWrapper = document.createElement("div");
  const graphWrapper = document.createElement("div");

  container.appendChild(graphWrapper);
  container.appendChild(tabWrapper);


  
  const options = {
    "orientation" : "vertical-reverse",
    "mode" : "compact"
    
  }
  const gitgraph = createGitgraph(graphWrapper, options);
  const main = gitgraph.branch("main");

  commits.forEach((commit) => {
    const message = commit.commit.message.split("\n")[0];
    main.commit({
      subject: message,
      author: commit.commit.author.name,
    });
  });

  commitTab(tabWrapper, commits);

}