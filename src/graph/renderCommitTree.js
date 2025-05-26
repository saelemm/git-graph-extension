import * as d3 from "d3";

// Step 1: Build commit tree
export async function renderCommitTree(parentDiv, commits) {
  // Normalize the commits
//   const commits = githubCommits.map(c => ({
//     sha: c.sha,
//     message: c.commit.message,
//     parents: c.parents.map(p => p.sha)
//   }));

  // Build SHA -> node lookup
  const shaToNode = new Map();
  commits.forEach(commit => {
    shaToNode.set(commit.sha, { ...commit, children: [] });
  });

  // Link children
  commits.forEach(commit => {
    commit.parents.forEach(parentSha => {
      const parent = shaToNode.get(parentSha);
      if (parent) {
        parent.children.push(commit.sha);
      }
    });
  });

  // Sort commits in logical bottom-to-top order
  const sortedCommits = [];
  const visited = new Set();
  function visit(sha) {
    if (visited.has(sha)) return;
    visited.add(sha);
    const commit = shaToNode.get(sha);
    commit?.parents.forEach(parentSha => visit(parentSha));
    sortedCommits.push(commit);
  }
  commits.forEach(c => visit(c.sha));

  // Remove existing SVG if any
  parentDiv.innerHTML = "";

  // Setup SVG
  const width = 400;
  const rowHeight = 60;
  const height = sortedCommits.length * rowHeight;

  const svg = d3.select(parentDiv)
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("display", "block")           // removes inline behavior
  .style("margin-left", "auto")        // push to the right
  .style("margin-right", "20px");  

  const branchX = {
    main: width / 2,
    fork: width / 2 + 30
  };

  const shaIndex = Object.fromEntries(sortedCommits.map((c, i) => [c.sha, i]));

  // Determine x position for each commit
  const commitX = {};
  sortedCommits.forEach(commit => {
    let x = branchX.main;

if (commit.parents.length === 1) {
  var parentSha = commit.parents[0];
  var parent = shaToNode.get(parentSha);
  if (parent && parent.children && parent.children.length > 1) {
    // This is a fork (parent has more than one child)
    x = branchX.fork;
  } else if (commitX[parentSha] !== undefined) {
    // Inherit the parent's branch position (main or fork)
    x = commitX[parentSha];
  }
}

if (commit.parents.length > 1) {
  // This is a merge commit; always go back to main
  x = branchX.main;
}

commitX[commit.sha] = x;

  });

  // Draw links
  sortedCommits.forEach((commit, i) => {
    const y = height - i * rowHeight - rowHeight / 2;
    const cx = commitX[commit.sha];

    commit.parents.forEach(parentSha => {
      const parentIndex = shaIndex[parentSha];
      if (parentIndex === undefined) return;

      const py = height - parentIndex * rowHeight - rowHeight / 2;
      const px = commitX[parentSha];

      svg.append("path")
        .attr("d", `M${cx},${y} C${cx},${(y + py) / 2} ${px},${(y + py) / 2} ${px},${py}`)
        .attr("stroke", "#fff")
        .attr("fill", "none")
        .attr("stroke-width", 2);
    });
  });

  // Draw nodes and labels
  sortedCommits.forEach((commit, i) => {
    const y = height - i * rowHeight - rowHeight / 2;
    const x = commitX[commit.sha];

    svg.append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 6)
      .attr("fill", "#f97316");

    svg.append("text")
      .attr("x", x + 12)
      .attr("y", y + 4)
      .text(commit.message)
      .attr("fill", "#fff")
      .attr("font-size", "12px");
  });
}
