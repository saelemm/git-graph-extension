import { fetchCommits } from './fetchCommits.js';
import { buildCommitTree } from "./buildCommitTree.js";
import { renderCommitTree } from "./renderCommitTree.js";
import { commitTab } from './commitTab.js';

export async function renderGraph(container, owner, repo) {
    const commits = await fetchCommits(owner, repo);
    if (!container) return;

    container.innerHTML = '';

    // Adjust layout to ensure vertical rendering
    const graphWrapper = document.createElement("div");
    graphWrapper.id = "graphWrapper"
    graphWrapper.style.maxWidth = "300px"
    graphWrapper.style.width = "100%"

    const tabWrapper = document.createElement("div");
    tabWrapper.id = "tabWrapper"
    tabWrapper.style.flex = "1"
    tabWrapper.style.boxSizing = "border-box"

    container.appendChild(graphWrapper);
    container.appendChild(tabWrapper);

    const nodeMap = buildCommitTree(commits);
    renderCommitTree(graphWrapper, [...nodeMap.values()]);
    commitTab(tabWrapper, commits);
}
