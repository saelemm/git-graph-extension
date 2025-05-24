export function addGraphPage() {
  if (!/\/graphs\/git-graph$/.test(location.pathname)) return;

  console.log('Rendering Git Graph page');

  const header = document.querySelector("body > div.logged-in.env-production.page-responsive > div.position-relative.header-wrapper.js-header-wrapper");
  const main = document.querySelector('main');
  const nav = document.querySelector('nav.js-repo-nav');

  if (!main || !header || !nav) {
    console.warn('Required page elements missing.');
    return;
  }

  // Clear main content but keep nav visible
  main.innerHTML = '';
  main.appendChild(nav); // re-append the nav so it stays visible

  // Create and append your graph container
  const graphPage = document.createElement('div');
  graphPage.innerHTML = '<h2>Git Graph</h2><div id="git-graph-container"></div>';
  main.appendChild(graphPage);

  document.title = 'Git Graph · GitHub';

  // Extract repo info and render graph
  const { owner, repo } = getRepoInfo();
  renderGraph(owner, repo);
}
