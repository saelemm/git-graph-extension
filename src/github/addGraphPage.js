import { getRepoInfo } from './getRepoInfo.js';
import { renderGraph } from '../graph/renderGraph.js';

export function addGraphPage() {
  if (!/\/graphs\/git-graph$/.test(location.pathname)) return;
  var header = document.querySelector("body > div.logged-in.env-production.page-responsive > div.position-relative.header-wrapper.js-header-wrapper");
  const main = document.querySelector('main');
  if (!main || !header) return;

  const graphPage = document.createElement('div');
  graphPage.innerHTML = '<h2>Git Graph</h2><div id="git-graph-container"></div>';

  main.innerHTML = '';
  main.appendChild(graphPage);

  document.title = 'Git Graph · GitHub';

  const { owner, repo } = getRepoInfo();
  renderGraph(owner, repo);
}
