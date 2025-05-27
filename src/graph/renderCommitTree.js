import * as d3 from "d3";

// Step 1: Build commit tree
export async function renderCommitTree(parentDiv, commits) {

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
  .attr("width", "100%")
  .attr("height", height)
  .style("display", "block");        // removes inline behavior
  // .style("margin-left", "-160px");        // push to the left

  const marginLeft = 170;

  const branchX = {
    main: width / 2 - marginLeft,
    fork: width / 2 + 30 - marginLeft
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

  sortedCommits.forEach((commit, i) => {
    const y = height - i * rowHeight - rowHeight / 2;
    
    // const x = commitX[commit.sha];
    const x = 600;

    const message = commit.data.commit.message
    const avatar = commit.data.author.avatar_url
    const commitUrl = commit.data.html_url
    const author = commit.data.author.login
    const authorLink = commit.data.commit.author.html_url
    const date = commit.data.commit.author.date
    const sha = commit.data.sha.slice(0, 7)


      svg.append("foreignObject")
  .attr("x", x + 10 - 200)
  .attr("y", y - 30)
  .attr("width", "100%")
  .attr("height", 50)
  .append("xhtml:div")
  .style("display", "flex")
  .style("justify-content", "space-between")
  .style("align-items", "center")
  // .style("background", "#1f2937")
  .style("padding", "0.75rem 1rem")
  .style("border-radius", "0.5rem")
  .style("font-family", "sans-serif")
  .style("color", "white")
  .style("font-size", "0.75rem")
  .html(`
    <div id="commit" style="display:flex; align-items:center; gap:0.75rem; flex:1;">
      <div id="avatar" style="width:24px; height:24px; border-radius:50%; overflow:hidden;">
        <img src="${avatar}" width="24" height="24" style="object-fit:cover;" />
      </div>
      <div id="commitInfo" style="flex:1; min-width:0; ; width:100%">
        <a href="${commitUrl}" target="_blank" style="font-weight:500; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${message}</a>
        <div style="color:#9ca3af; font-size:0.7rem; margin-top:0.25rem;">
          <a href="${authorLink}" target="_blank" style="color:#9ca3af;">${author}</a> • ${new Date(date).toLocaleDateString()}
        </div>
      </div>
      <div id="sha" style="display:flex; align-items:center; gap:0.5rem; margin-left:1rem;">
        <div style="background:#FFFFF; padding:0.25rem 0.5rem; border-radius:0.375rem; font-family:monospace; color:#3b82f6;">${sha.slice(0, 7)}</div>
        <button style="background:transparent; border:none; color:#9ca3af; font-size:0.75rem; cursor:pointer;">Copy</button>
      </div>
    </div>
  `);

  });
}
