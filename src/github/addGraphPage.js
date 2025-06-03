import { renderGraph } from '../graph/renderGraph.js';
import { getRepoInfo } from './getRepoInfo.js';
import { loadNext } from '../html/loadNext.js';
import { fetchCommits } from '../client/fetchCommits.js';
import { loadingSkeleton } from '../html/loadingSkeleton.js';

export async function addGraphPage() {
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
  graphPage.id = 'git graph';
  graphPage.innerHTML = `
    <h2 style="display:flex; align-item: center; margin: 1rem;">Git Graph</h2>
    <div id="git-graph-container" style="height: 100%; display:flex;"></div>
  `;
  main.appendChild(graphPage);

  document.title = 'Git Graph · GitHub';

  const { owner, repo } = getRepoInfo();
  const graphContainer = document.getElementById('git-graph-container');
  graphContainer.innerHTML = '';
  graphContainer.appendChild(loadingSkeleton());
  const page = 1;
  let commits = await fetchCommits(owner, repo, page);

  if (graphContainer) {
    renderGraph(graphContainer, owner, repo, commits);
  } else {
    console.error('Could not find graph container');
  }

  // Add next page
  if (commits.length % 100 === 0) {
    main.appendChild(
      loadNext(owner, repo, (newCommits) => {
        //console.log('Fetched new commits:', newCommits);

        newCommits.forEach((element) => {
          commits.push(element);
        });

        const graphContainer = document.getElementById('git-graph-container');
        if (graphContainer && newCommits.length > 0) {
          renderGraph(graphContainer, owner, repo, commits);
          if (commits.length % 100 != 0) {
            const nextButton = document.getElementById('nextButtonWrapper');
            main.removeChild(nextButton);
          }
        }
      })
    );
  }
}
