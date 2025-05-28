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

  // Sort commits
  const sortedCommits = [];
  const visited = new Set();
  function visit(sha) {
    if (visited.has(sha)) return;
    visited.add(sha);
    const commit = shaToNode.get(sha);
    if (!commit) return;
    commit.parents.forEach(parentSha => visit(parentSha));
    sortedCommits.push(commit);
  }
  commits.forEach(c => visit(c.sha));

  parentDiv.innerHTML = "";

  const width = 800;
  const rowHeight = 60;
  const height = sortedCommits.length * rowHeight;
  const svg = d3.select(parentDiv).append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .style("display", "block")
    ;

  const marginLeft = 360;
  const branchBaseX = width / 2 - marginLeft;
  const branchSpacing = 30;

  const shaIndex = Object.fromEntries(sortedCommits.map((c, i) => [c.sha, i]));
  const commitX = {};
  const branchMap = new Map();

  sortedCommits.forEach(commit => {
    let x = branchBaseX;
    let forkLevel = 0;

    if (commit.parents.length === 1) {
      const parentSha = commit.parents[0];
      const parent = shaToNode.get(parentSha);
      if (parent && parent.children.length > 1) {
        if (!branchMap.has(parentSha)) {
          branchMap.set(parentSha, new Map());
        }
        const branchChildren = branchMap.get(parentSha);
        if (!branchChildren.has(commit.sha)) {
          forkLevel = branchChildren.size;
          branchChildren.set(commit.sha, forkLevel);
        } else {
          forkLevel = branchChildren.get(commit.sha);
        }
        x = branchBaseX + (forkLevel + 1) * branchSpacing;
      } else {
        x = commitX[parentSha] ?? branchBaseX;
      }
    } else if (commit.parents.length > 1) {
      x = branchBaseX;
    }

    commitX[commit.sha] = x;
  });

  // Draw links
  sortedCommits.forEach((commit, i) => {
    const y = height - i * rowHeight - rowHeight / 2;
    const cx = commitX[commit.sha];
    if (!Number.isFinite(cx) || !Number.isFinite(y)) return;

    commit.parents.forEach(parentSha => {
      const parentIndex = shaIndex[parentSha];
      const px = commitX[parentSha];
      if (!Number.isFinite(parentIndex) || !Number.isFinite(px)) return;
      const py = height - parentIndex * rowHeight - rowHeight / 2;

      const isFork = Math.abs(cx - px) > 0;
      const path = isFork
        ? `M${cx},${y} C${cx},${(y + py) / 2} ${px},${(y + py) / 2} ${px},${py}`
        : `M${cx},${y} L${px},${py}`;

      svg.append("path")
        .attr("d", path)
        .attr("stroke", "#fff")
        .attr("fill", "none")
        .attr("stroke-width", 2);
    });
  });

  // Draw nodes and labels
  sortedCommits.forEach((commit, i) => {
    const y = height - i * rowHeight - rowHeight / 2;
    const x = commitX[commit.sha];
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    svg.append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 6)
      .attr("fill", "#f97316");

    svg.append("text")
      .attr("x", x + 12)
      .attr("y", y + 4)
      .text(commit.sha.slice(0, 7))
      .attr("fill", "#fff")
      .attr("font-size", "12px");
  });

  // Metadata cards
  sortedCommits.forEach((commit, i) => {
    const y = height - i * rowHeight - rowHeight / 2;
    const x = 600;

    if (!commit.data || !commit.data.commit || !commit.data.author) return;

    const message = commit.data.commit.message;
    const avatar = commit.data.author.avatar_url;
    const commitUrl = commit.data.html_url;
    const author = commit.data.author.login;
    const authorLink = commit.data.author.html_url || "#";
    const date = commit.data.commit.author.date;
    const sha = commit.sha.slice(0, 7);

    svg.append("foreignObject")
      .attr("x", x - 450)
      .attr("y", y - 30)
      .attr("width", "90%")
      .attr("height", 50)
      .append("xhtml:div")
      .style("display", "flex")
      .style("justify-content", "space-between")
      .style("align-items", "center")
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
          <div id="commitInfo" style="flex:1; min-width:0; width:80%">
            <a href="${commitUrl}" target="_blank" style="font-weight:500; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${message.slice(0, 100)}
            </a>
            <div style="color:#9ca3af; font-size:0.7rem; margin-top:0.25rem;">
              <a href="${authorLink}" target="_blank" style="color:#9ca3af;">${author}</a> • ${new Date(date).toLocaleDateString()}
            </div>
          </div>
          <div id="sha" style="display:flex; align-items:center; gap:0.5rem; width:20%; min-width:100px">
            <div style="background:#FFFFF; padding:0.25rem 0.5rem; border-radius:0.375rem; font-family:monospace; color:#3b82f6;">
              ${sha}
            </div>
            <button style="background:transparent; border:none; color:#9ca3af; font-size:0.75rem; cursor:pointer;">Copy</button>
          </div>
        </div>
      `);
  });
}
