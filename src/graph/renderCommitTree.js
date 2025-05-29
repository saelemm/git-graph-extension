import * as d3 from "d3";

// Step 1: Build commit tree
export async function renderCommitTree(parentDiv, commits, branches = [], actions = [], artifacts = []) {
  // Build SHA -> node lookup

  // test main
  

  // Sort commits
  const sortedCommits = [];
  const visited = new Set();

  function visit(sha) {
    if (visited.has(sha)) return;
    visited.add(sha);
    const commit = commits.get(sha);
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
    .style("margin-left", "10px")
    ;

  const marginLeft = 360;
  const branchBaseX = width / 2 - marginLeft;
  const branchSpacing = 30;

  const shaIndex = Object.fromEntries(sortedCommits.map((c, i) => [c.sha, i]));
  const commitX = {};
  const branchMap = new Map();
  let maxX = branchBaseX;

  sortedCommits.forEach(commit => {
    let x = branchBaseX;
    let forkLevel = 0;

    if (commit.parents.length === 1) {
      const parentSha = commit.parents[0];
      const parent = commits.get(parentSha);
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

    if (x > maxX) {
      maxX = x;
    }

    commitX[commit.sha] = x;
  });

  function getRandomHexColor() {
  const hex = Math.floor(Math.random() * 0x1000) // 0x000 to 0xfff
    .toString(16)
    .padStart(3, '0');
  return `#${hex}`;
}

//test5

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

        branchColor = isFork ? getRandomHexColor() : "#fff";
      svg.append("path")
        .attr("d", path)
        .attr("stroke", branchColor)
        .attr("fill", "none")
        .attr("stroke-width", 2);
    });
  });

  const dates = new Set();

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

      const matchingBranch = branches.find(b => b.commit.sha === commit.sha);
      const date = new Date(commit.data.commit.author.date);
      const dateString = date.toLocaleDateString();
      const monthStr = date.getMonth() + 1
      const dayStr = date.getDate();
      let headString = ""
      const branchName = matchingBranch ? `[${matchingBranch.name}]` : "";
      const HEAD = matchingBranch ? `[HEAD]` : "";
      if (HEAD) {
        headString = `${HEAD}  ${branchName}`
        if (headString.length > 22) {
          headString = headString.slice(0, 22) + "..."
        }
      }
      const message = HEAD? headString : commit.sha.slice(0, 7);


if (!dates.has(dateString)) {
  svg.append("text")
      .attr("x", branchBaseX - 35)
      .attr("y", y + 4)
      .text(`${dayStr}/${monthStr}`)
      .attr("fill", "#fff")
      .attr("font-size", "10px");
      dates.add(dateString)
}

svg.append("text")
      .attr("x", x + 12)
      .attr("y", y + 4)
      .text(`${message}`)
      .attr("fill", "#fff")
      .attr("font-size", "12px");
  });

  // Metadata cards
  sortedCommits.forEach((commit, i) => {
    const y = height - i * rowHeight - rowHeight / 2;
    const x = 600;
    
    const message = commit.data.commit.message;
    const avatar = commit?.data?.author?.avatar_url ? commit.data.author.avatar_url : "";
    const commitUrl = commit.data.html_url;
    const author = commit?.data?.author?.login ? commit.data.author.login : commit.data.commit.author.name;
    const authorLink = commit?.data?.author?.html_url || "#";
    const date = commit.data.commit.author.date;
    const sha = commit.sha.slice(0, 7);
    const action = actions?.workflow_runs?.find(ac => ac?.head_sha === commit.sha);
    const artefact = artifacts?.artifacts?.find(ar => ar?.workflow_run?.head_sha == commit.sha) 

    const actionIcon = {
      success: "✅",
      failure: "❌",
      cancelled: "🚫",
      in_progress: "⏳",
      queued: "📦",
      completed: "📄",
    };

  const icon = action ? actionIcon[action.conclusion || action.status] || "📄" : "";


    svg.append("foreignObject")
  .attr("x", maxX + 150)
  .attr("y", y - 20)
  .attr("width", "90%")
  .attr("height", 50)
  .append("xhtml:div")
  .style("display", "flex")
  .style("align-item", "center")
  .html(`
    <style>
      .commit-tab {
        display: flex;
        align-items: center;
        flex: 1;
        font-family: sans-serif;
        color: white;
        font-size: 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        transition: background 0.2s ease-in-out;
      }

      .commit-tab:hover {
        background: rgba(255, 255, 255, 0.05);
      }
    </style>

    <div class="commit-tab">
      <div id="avatar" style="margin-right:10px; width:24px; height:24px; border-radius:50%; overflow:hidden;">
        <img src="${avatar}" width="24" height="24" style="object-fit:cover;" />
      </div>
      <div id="commitInfo" style="flex:1; min-width:0; width:80%">
        <a href="${commitUrl}" target="_blank" style="font-weight:500; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${message.slice(0, 100)}
        </a>
        <div style="color:#9ca3af; font-size:0.7rem; margin-top:0.25rem;">
          <a href="${authorLink}" target="_blank" style="color:#9ca3af;">${author}</a> • ${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}
        </div>
      </div>

      ${artefact ? `
      <a href="${artefact.url}" target="_blank" id="artefacts" style="display:flex; flex-direction:column; align-items:center; justify-content: center;">
        <div title="Workflow" style="text-decoration:none;">
          <span style="font-size:1rem;">📖</span>
        </div>
        <div>${artefact.id}</div>
      </a>` : ""}

      <div id="actions" style="display:flex; align-items:center; justify-content: center; gap:0.5rem; min-width:100px">
        ${action ? `
        <a href="${action.html_url}" target="_blank" title="Workflow" style="text-decoration:none;">
          <span style="font-size:1rem;">${icon}</span>
        </a>` : ""}
      </div>

      <div id="sha" style="display:flex; align-items:center; gap:0.5rem; width:20%; min-width:100px">
        <div style="background:#FFFFF; padding:0.25rem 0.5rem; border-radius:0.375rem; font-family:monospace; color:#3b82f6;">
          ${sha}
        </div>
        <button style="background:transparent; border:none; color:#9ca3af; font-size:0.75rem; cursor:pointer;">📝</button>
      </div>
    </div>
  `);
  });
}
