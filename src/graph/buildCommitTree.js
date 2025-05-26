export function buildCommitTree(commits) {
    const nodeMap = new Map();
  
    // Build nodes
    for (const commit of commits) {
      nodeMap.set(commit.sha, {
        message: commit.commit.message,
        sha: commit.sha,
        parents: commit.parents.map(p => p.sha),
        children: [],
        data: commit,
      });
    }

  
    // Link children
    for (const node of nodeMap.values()) {
      for (const parentSha of node.parents) {
        const parentNode = nodeMap.get(parentSha);
        if (parentNode) {
          parentNode.children.push(node);
        }
      }
    }
  
    return nodeMap;
  }
  