import { buildCommitTree } from './buildCommitTree.js';
import { renderCommitTree } from './renderCommitTree.js';
import { loadingSkeleton } from '../html/loadingAnimation.js';

export async function renderGraph(
  container,
  commits = [],
  branches = [],
  actions = [],
  artifacts = []
) {
  if (!container) return;
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
