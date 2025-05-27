import { fetchCommits } from '../client/fetchCommits.js';
import { fetchBranches } from '../client/fetchBranches.js';
import { fetchCommitsHead } from '../client/fetchCommitsHead.js';
import { fetchForks } from '../client/fetchForks.js';
import { fetchRepo } from '../client/fetchRepo.js';
import { buildCommitTree } from "./buildCommitTree.js";
import { renderCommitTree } from "./renderCommitTree.js";
import { commitTab } from './commitTab.js';

export async function renderGraph(container, owner, repo) {
    const commits = await fetchCommits(owner, repo);
    const branches = await fetchBranches(owner, repo);
    const repoInfo = await fetchRepo(owner, repo);
    
    //const commitsHead = await fetchCommitsHead(owner, repo);
    //const forks = await fetchForks(owner, repo);
    if (!container) return;

    container.innerHTML = '';

    // Adjust layout to ensure vertical rendering
    const graphWrapper = document.createElement("div");
    graphWrapper.id = "graphWrapper"
    graphWrapper.style.width = "100%"
    graphWrapper.style.height = "100%"

    const tabWrapper = document.createElement("div");
    tabWrapper.id = "tabWrapper"
    tabWrapper.style.flex = "1"
    tabWrapper.style.boxSizing = "border-box"

    container.appendChild(graphWrapper);
    //container.appendChild(tabWrapper);

    const nodeMap = buildCommitTree(commits);
    renderCommitTree(graphWrapper, [...nodeMap.values()]);
    //commitTab(tabWrapper, commits);
}
