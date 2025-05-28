import { renderGraph } from '../graph/renderGraph.js';
import { getRepoInfo } from './getRepoInfo.js';

export function addGraphPage() {
  if (!/\/graphs\/git-graph$/.test(location.pathname)) return;

  console.log('Rendering Git Graph page');

  const main = document.querySelector('main');
  if (!main) {
    console.warn('Main element not found.');
    return;
  }

  // Clear main content
  main.innerHTML = '';

  // Create container for the graph
  const graphPage = document.createElement('div');
  graphPage.id = "git graph"
  graphPage.innerHTML = `
    <h2 style="display:flex; align-item: center; margin-bottom: 1rem;">Git Graph</h2>
    <div id="git-graph-container"  style="height: 100%; display:flex;"></div>
  `;
  main.appendChild(graphPage);

  document.title = 'Git Graph · GitHub';

  const { owner, repo } = getRepoInfo();
  const graphContainer = document.getElementById('git-graph-container');

  if (graphContainer) {
    renderGraph(graphContainer, owner, repo);
  } else {
    console.error('Could not find graph container');
  }
}
