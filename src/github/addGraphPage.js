import { renderGraph } from '../graph/renderGraph.js';
import { getRepoInfo } from './getRepoInfo.js';
import { loadNext } from '../html/loadNext.js';
import { fetchCommits } from '../client/fetchCommits.js';
import { fetchBranches } from '../client/fetchBranches.js';
import { fetchActions } from '../client/fetchActions.js';
import { fetchArtifacts } from '../client/fetchArtifacts.js';
import { loadingAnimation } from '../html/loadingAnimation.js';

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

  // Empty document and loading animation
  const graphContainer = document.getElementById('git-graph-container');
  graphContainer.innerHTML = '';
  graphContainer.appendChild(loadingAnimation());

  // Get repo infos and fetching datas
  const { owner, repo } = getRepoInfo();
  const [commits, branches, actions, artifacts] = await Promise.all([
    fetchCommits(owner, repo, 1),
    fetchBranches(owner, repo),
    fetchActions(owner, repo),
    fetchArtifacts(owner, repo),
  ]);

  // First graph render
  if (graphContainer) {
    renderGraph(graphContainer, commits, branches, actions, artifacts);
  } else {
    console.error('Could not find graph container');
  }

  // Add next button
  if (commits.length % 100 === 0) {
    main.appendChild(
      loadNext(owner, repo, (newCommits) => {
        newCommits.forEach((element) => {
          commits.push(element);
        });

        const graphContainer = document.getElementById('git-graph-container');
        if (graphContainer && newCommits.length > 0) {
          renderGraph(graphContainer, commits, branches, actions, artifacts);
          const tempLoading = document.getElementById('loaderWrapper');
          const buttonWrapper = document.getElementById('nextButtonWrapper');
          buttonWrapper.removeChild(tempLoading);

          // If no more commits remove next button
          if (commits.length % 100 != 0) {
            const nextButton = document.getElementById('nextButtonWrapper');
            main.removeChild(nextButton);
          }
        }
      })
    );
  }
}
