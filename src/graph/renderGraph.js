import { fetchCommits } from '../client/fetchCommits.js';
import { fetchBranches } from '../client/fetchBranches.js';
import { fetchActions } from '../client/fetchActions.js';
import { fetchArtifacts } from '../client/fetchArtifacts.js';
import { buildCommitTree } from './buildCommitTree.js';
import { renderCommitTree } from './renderCommitTree.js';
import { loadingSkeleton } from '../html/loadingSkeleton.js';

export async function renderGraph(container, owner, repo) {
  if (!container) return;

  container.innerHTML = '';
  container.appendChild(loadingSkeleton());

  const [commits, branches, actions, artifacts] = await Promise.all([
    fetchCommits(owner, repo),
    fetchBranches(owner, repo),
    fetchActions(owner, repo),
    fetchArtifacts(owner, repo),
  ]);

  container.innerHTML = '';

  // Adjust layout to ensure vertical rendering
  const graphWrapper = document.createElement('div');
  graphWrapper.id = 'graphWrapper';
  graphWrapper.style.width = '100%';
  graphWrapper.style.height = '100%';

  const tabWrapper = document.createElement('div');
  tabWrapper.id = 'tabWrapper';
  tabWrapper.style.flex = '1';
  tabWrapper.style.boxSizing = 'border-box';

  container.appendChild(graphWrapper);
  const nodeMap = buildCommitTree(commits);
  renderCommitTree(graphWrapper, nodeMap, branches, actions, artifacts);
}
