import { fetchCommits } from './fetchCommits.js';

export async function renderGraph(graphContainer, owner, repo) {
  const commits = await fetchCommits(owner, repo);
  console.log(`Fetched commits : `+ commits.json());
  const container = document.getElementById('git-graph-container');
  if (!container) return;

  container.innerHTML = ''; // Clear container
  const elements = [];

  commits.forEach(commit => {
    const id = commit.sha.slice(0, 7);
    elements.push({ data: { id, label: id } });

    commit.parents.forEach(parent => {
      const parentId = parent.sha.slice(0, 7);
      elements.push({
        data: { id: `${id}->${parentId}`, source: id, target: parentId }
      });
    });
  });

  cytoscape({
    container,
    elements,
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#0074D9',
          'label': 'data(label)',
          'width': 8,
          'height': 8,
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': 6,
          'color': '#666'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 1,
          'line-color': '#ccc',
          'target-arrow-shape': 'none'
        }
      }
    ],
    layout: {
      name: 'breadthfirst',
      directed: true,
      padding: 10,
      spacingFactor: 1.3
    }
  });
}