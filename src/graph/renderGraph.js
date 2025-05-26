import { fetchCommits } from './fetchCommits.js';
import { buildCommitTree } from "./buildCommitTree.js";
import { renderCommitTree } from "./renderCommitTree.js";
import { commitTab } from './commitTab.js';

export async function renderGraph(container, owner, repo) {
    const commits = await fetchCommits(owner, repo);
    if (!container) return;

    container.innerHTML = '';

    // Adjust layout to ensure vertical rendering
    // graphWrapper.id = "graphWrapper";
    // graphWrapper.style.width = "auto"; 
    // graphWrapper.style.height = "100%";
    // graphWrapper.style.display = "flex";
    // graphWrapper.style.flexDirection = "column"; // Ensure vertical rendering
    const graphWrapper = document.createElement("div");
    const tabWrapper = document.createElement("div");

    container.appendChild(graphWrapper);
    container.appendChild(tabWrapper);

    const nodeMap = buildCommitTree(commits);
    renderCommitTree(graphWrapper, nodeMap);
    commitTab(tabWrapper, commits);
}
