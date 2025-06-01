import * as d3 from 'd3';
import * as util from './utilFunctionGraph';
import { buildLoopsDependency } from './buildParallelGraph';
import { drawCircle } from './drawCircle';
import { drawForkLigns } from './drawLigns';
import { drawMainLine } from './drawLigns';

// Step 1: Build commit tree
export async function renderCommitTree(
  parentDiv,
  commits,
  branches = [],
  actions = [],
  artifacts = []
) {
  // Sort commits
  const sortedCommits = [];
  let visited = new Set();
  const mainLine = [];
  const dates = new Set();

  function visit(sha) {
    if (visited.has(sha)) return;
    visited.add(sha);
    const commit = commits.get(sha);
    if (!commit) return;
    commit.parents.forEach((parentSha) => visit(parentSha));
    sortedCommits.push(commit);
  }

  commits.forEach((c) => visit(c.sha));

  function constructMainLine(co) {
    if (util.endOfMainLign(co, commits)) {
      mainLine.push(co.sha);
      return;
    }
    mainLine.push(co.sha);
    return constructMainLine(commits.get(co.parents[0]));
  }

  // construct main line from HEAD main branch
  constructMainLine(sortedCommits[sortedCommits.length - 1]);

  parentDiv.innerHTML = '';

  const width = 800;
  const rowHeight = 60;
  const height = sortedCommits.length * rowHeight;
  const svg = d3
    .select(parentDiv)
    .append('svg')
    .attr('width', '100%')
    .attr('height', height)
    .style('display', 'block')
    .style('margin-left', '10px');
  const marginLeft = 360;
  const branchBaseX = width / 2 - marginLeft;
  const branchSpacing = 30;

  const shaIndex = Object.fromEntries(sortedCommits.map((c, i) => [c.sha, i]));
  const commitX = {};
  const branchMap = new Map();
  let maxX = branchBaseX;

  // Alternative build nodes and lign from loops
  const loops = buildLoopsDependency(
    sortedCommits[sortedCommits.length - 1],
    commits,
    sortedCommits,
    mainLine
  );

  console.log(loops); // 👈 All loops now available as an array

  // Drawing graph
  const entries = Array.from(commits.entries());
  let commitIndex = 0;
  let y = height - (commits.size - commitIndex) * rowHeight + rowHeight / 2;

  //Drawing main line
  drawMainLine(svg, branchBaseX, y, branchBaseX, height - 25, '#ffffff');

  mainLine.forEach((shaMain, i) => {
    // Init drawing variables
    const commit = commits.get(shaMain);
    const sha = commit.sha;
    y = height - (commits.size - commitIndex) * rowHeight + rowHeight / 2;
    commitIndex++;
    let x = branchBaseX;

    drawCircle(svg, branches, dates, branchBaseX, commit, x, y, '#f97316');
    // Handling case of fork branches
    if (util.isMerge(commit)) {
      const loop = loops.get(commit.sha);
      const annotatedPath = loop?.annotatedPath;
      const color = '#f97316';

      if (annotatedPath) {
        for (let i = 1; i < annotatedPath.length - 1; i++) {
          localNode = annotatedPath[i];
          if (localNode.isPartOfLoop && localNode.isFork) {
            commitIndex++;
            y =
              height -
              (commits.size - commitIndex + 1) * rowHeight +
              rowHeight / 2;
            color = localNode.color;
            drawCircle(
              svg,
              branches,
              dates,
              branchBaseX,
              localNode.fCommit,
              x + branchBaseX * localNode.level,
              y,
              localNode.color
            );
          }
        }
        drawForkLigns(
          svg,
          annotatedPath,
          loop.color ? loop.color : '#fff',
          branchBaseX,
          branchBaseX,
          rowHeight,
          y - 90,
          x - 40
        );
      }
    }
  });

  // Metadata cards
  sortedCommits.forEach((commit, i) => {
    const y = height - i * rowHeight - rowHeight / 2;
    const x = 600;

    const message = commit.data.commit.message;
    const avatar = commit?.data?.author?.avatar_url
      ? commit.data.author.avatar_url
      : '';
    const commitUrl = commit.data.html_url;
    const author = commit?.data?.author?.login
      ? commit.data.author.login
      : commit.data.commit.author.name;
    const authorLink = commit?.data?.author?.html_url || '#';
    const date = commit.data.commit.author.date;
    const sha = commit.sha.slice(0, 7);
    const action = actions?.workflow_runs?.find(
      (ac) => ac?.head_sha === commit.sha
    );
    const artefact = artifacts?.artifacts?.find(
      (ar) => ar?.workflow_run?.head_sha == commit.sha
    );

    const actionIcon = {
      success: '✅',
      failure: '❌',
      cancelled: '🚫',
      in_progress: '⏳',
      queued: '📦',
      completed: '📄',
    };

    const icon = action
      ? actionIcon[action.conclusion || action.status] || '📄'
      : '';

    svg
      .append('foreignObject')
      .attr('x', maxX + 150)
      .attr('y', y - 20)
      .attr('width', '90%')
      .attr('height', 50)
      .append('xhtml:div')
      .style('display', 'flex')
      .style('align-item', 'center').html(`
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
          ${message.slice(0, 100)}  ${sha}
        </a>
        <div style="color:#9ca3af; font-size:0.7rem; margin-top:0.25rem;">
          <a href="${authorLink}" target="_blank" style="color:#9ca3af;">${author}</a> • ${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}
        </div>
      </div>

      ${
        artefact
          ? `
      <a href="${artefact.url}" target="_blank" id="artefacts" style="display:flex; flex-direction:column; align-items:center; justify-content: center;">
        <div title="Workflow" style="text-decoration:none;">
          <span style="font-size:1rem;">📖</span>
        </div>
        <div>${artefact.id}</div>
      </a>`
          : ''
      }

      <div id="actions" style="display:flex; align-items:center; justify-content: center; gap:0.5rem; min-width:100px">
        ${
          action
            ? `
        <a href="${action.html_url}" target="_blank" title="Workflow" style="text-decoration:none;">
          <span style="font-size:1rem;">${icon}</span>
        </a>`
            : ''
        }
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
