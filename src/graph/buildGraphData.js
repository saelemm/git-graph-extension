export function buildGraphData(commits) {
    const nodes = [];
    const edges = [];
  
    commits.forEach(commit => {
      const sha = commit.sha;
      // Add node for this commit with label as first 7 chars of SHA
      nodes.push({ data: { id: sha, label: sha.slice(0, 7) } });
  
      // For each parent commit, add an edge from this commit to its parent
      commit.parents.forEach(parent => {
        edges.push({ data: { source: sha, target: parent.sha } });
      });
    });
  
    return { nodes, edges };
  }
  