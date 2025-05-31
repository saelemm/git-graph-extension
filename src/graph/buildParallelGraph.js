import * as util from './utilFunctionGraph';

const loops = {};

/**
 *
 * @param {*} co
 * @returns
 */
export function buildLoopsDependency(co, commits, sortedCommits, mainLine) {
  // If end of graph return
  if (util.endOfMainLign(co, commits)) {
    return loops;
  }

  // If no merge, no loop
  if (!util.isMerge(co)) {
    return buildLoopsDependency(
      commits.get(co.parents[0]),
      commits,
      sortedCommits,
      mainLine
    );
  } else {
    const mergeSha = co?.sha;
    // Building fork path
    let coForkParent = commits.get(co.parents[1]);
    let forkSha = '';
    let forkPath = [];
    forkPath.push(coForkParent?.sha);
    while (!mainLine.includes(coForkParent?.sha)) {
      coForkParent = commits.get(coForkParent?.parents[0]);
      if (!mainLine.includes(coForkParent?.sha))
        forkPath.push(coForkParent?.sha);
    }
    forkSha = coForkParent?.sha;

    // console.log(`Fork path`);
    // console.log(`${mergeSha.slice(0, 7)}  \\`);
    // forkPath.forEach((p) =>
    //   console.log(`       ${p.slice(0, 7)}\n        |`)
    // );
    // console.log(`   /\n${forkSha.slice(0, 7)}`);

    // Building main path
    let mainPath = [];
    let coMainParent = commits.get(co.parents[0]);
    while (coMainParent.sha != forkSha) {
      mainPath.push(coMainParent.sha);
      coMainParent = commits.get(coMainParent.parents[0]);
    }

    // console.log(`Main path`);
    // console.log(`${mergeSha.slice(0, 7)}\n|`);
    // mainPath.forEach((p) => console.log(`${p.slice(0, 7)}\n|`));
    // console.log(`${forkSha.slice(0, 7)}`);

    // Building full path
    const annotatedPath = [];
    let forkLevel = 1;

    const forkSet = new Set(forkPath.map((c) => c));
    const mainSet = new Set(mainPath.map((c) => c));

    annotatedPath.push({
      sha: mergeSha,
      isFork: false,
      isPartOfLoop: true,
      level: 0,
    });

    // Calculate loop begining
    let beginLoop = 0;
    for (let i = sortedCommits.length - 1; i >= 0; i--) {
      if (sortedCommits[i].sha == mergeSha) {
        beginLoop = i - 1;
        break;
      }
    }

    // Building actual full path
    for (let i = beginLoop; i >= 0; i--) {
      const commit = sortedCommits[i];
      const sha = commit.sha;
      let fork = false;
      let partOfLoop = false;

      if (sha == forkSha) break;
      if (!forkSet.has(sha) && !mainSet.has(sha)) {
        console.log(`Not contained sha ${sha}`);
        forkLevel++;
        annotatedPath.push({
          sha,
          isFork: fork,
          isPartOfLoop: partOfLoop,
          level: forkLevel,
        });
        continue;
      }

      partOfLoop = true;
      if (forkSet.has(sha)) {
        fork = true;
      } else if (mainSet.has(sha)) {
        if (util.isFork(commit)) {
          forkLevel++;
        }
        if (util.isMerge(commit) && forkLevel > 1) {
          forkLevel--;
        }
      }
      annotatedPath.push({
        sha,
        isFork: fork,
        isPartOfLoop: partOfLoop,
        level: forkLevel,
      });
    }

    // End with forkSha
    annotatedPath.push({
      sha: forkSha,
      isFork: false,
      isPartOfLoop: true,
      level: 0,
    });

    // 🔍 Log with visual indentation
    console.log('\n📌 Annotated Fork Path:');
    annotatedPath.forEach(({ sha, isFork, isPartOfLoop, level }, index) => {
      const indent = '\t'.repeat(level);
      let label = isFork ? '🌿 Fork' : '🔷 Main';
      if (!isPartOfLoop) label = '❌ Not Part';
      console.log(
        `${indent}${index}. ${label} | Level: ${level} | SHA: ${sha}`
      );
    });

    loops[co.sha] = {
      mainPath,
      forkPath,
      annotatedPath,
    };

    return buildLoopsDependency(
      commits.get(co.parents[0]),
      commits,
      sortedCommits,
      mainLine
    );
  }
}
