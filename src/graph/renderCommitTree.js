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
  // let sortedCommits = [];
  const mainLine = [];
  const dates = new Set();
  const sortedCommits = Array.from(commits.values()).reverse();

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
  let maxX = branchBaseX;
  let commitIndex = 0;

  // Alternative build nodes and lign from loops
  const loops = buildLoopsDependency(
    sortedCommits[sortedCommits.length - 1],
    commits,
    sortedCommits,
    mainLine
  );

  // console.log(loops);

  // Drawing graph
  let y = height - (commits.size - commitIndex) * rowHeight + rowHeight / 2;

  //Drawing main line
  drawMainLine(svg, branchBaseX, y, branchBaseX, height - 25, '#ffffff');

  // Drawing graph impl
  let lastMainCommit;
  let forkPathDrawn = [];
  const yCoordonate = new Map();

  Array.from(commits.values()).forEach((commit, i) => {
    let y = height - (commits.size - i) * rowHeight + rowHeight / 2;
    const x = branchBaseX;
    //const y = height - i * rowHeight - rowHeight / 2;
    let level = 1;
    let color = '#f97316';

    if (util.isMain(commit.sha, mainLine)) {
      lastMainCommit = commit;
    } else {
      const loop = [...loops.entries()].find(([key, value]) => {
        if (value.annotatedPath) {
          return value.annotatedPath.find((el) => {
            return el.sha == commit.sha && el.isFork && el.isPartOfLoop;
          });
        }
      });
      if (loop) {
        const [mergeSha, loopData] = loop;
        if (mergeSha && loopData) {
          pathNode = loopData.annotatedPath.find((el) => el.sha === commit.sha);
          color = pathNode.color;
          level = pathNode.level + 1;

          if (!forkPathDrawn.find((el) => el === mergeSha)) {
            const yForkLign = yCoordonate.get(mergeSha);
            drawForkLigns(
              svg,
              loopData.annotatedPath,
              loopData.color ? loopData.color : '#fff',
              branchBaseX,
              branchBaseX,
              rowHeight,
              yForkLign - branchSpacing,
              x - 40
            );
          }
        }
        forkPathDrawn.push(mergeSha);
      }
    }

    drawCircle(
      svg,
      branches,
      dates,
      branchBaseX,
      commit,
      branchBaseX * level,
      y,
      color
    );
    yCoordonate.set(commit.sha, y);
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
      .attr('style', 'border-bottom: 1px solid rgba(255, 255, 255, 0.1);')
      .append('xhtml:div')
      .style('display', 'flex')
      .on('click', function () {
        window.open(commitUrl, '_blank');
      })
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r', 8)
          .style('cursor', 'pointer')
          .style('background', '#4e48480d')
          .attr('fill', 'white');
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r', 6)
          .style('cursor', 'default')
          .style('background', 'none');
      })
      .style('align-item', 'center').html(`
    <style>
      .commit-tab{
        display: flex;
        align-items: center;
        flex: 1;
        font-family: sans-serif;
        color: white;
        font-size: 0.75rem;
        transition: background 0.2s ease-in-out;
        height:100%;
        width:100%;
      }
      #main_button {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    </style>
    <div class="commit-tab">
      <div id="avatar" style="width:24px; height:24px; border-radius:50%; overflow:hidden;">
        <img src="${avatar}" width="24" height="24" style="object-fit:cover;" />
      </div>
      <div id="commitInfo" style="flex:1; min-width:0; width:80%">
        <a id="text_button" href="${commitUrl}" target="_blank" style="margin-left: 35px; font-weight:500; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${message.slice(0, 100)}
        </a>
        <div style="color:#9ca3af; font-size:0.7rem; margin-top:0.5rem;margin-left:35px;">
          <a id="author_button" href="${authorLink}" target="_blank" style="color:#9ca3af;">${author}</a> • ${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}
          </a>
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
