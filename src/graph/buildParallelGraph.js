import * as util from './utilFunctionGraph';

function isGivenShaAfterCompareSha(givenSha, compareSha, loopMap, commits) {
  for (const [mergeSha, loopData] of loopMap.entries()) {
    if (loopData.forkPath.includes(givenSha)) {
      const mSha = loopData.mergeSha;
      const commitKeys = [...commits.keys()];
      const givenIndex = commitKeys.indexOf(mSha);
      const compareIndex = commitKeys.indexOf(compareSha);

      if (givenIndex === -1 || compareIndex === -1) {
        return null;
      }

      return givenIndex > compareIndex;
    }
  }

  return true;
}

/**
 * Recursively builds loop data for each merge commit and stores them in a Map.
 * @param {*} startCommit - The latest commit to start from.
 * @param {Map<string, object>} commits - Map of all commits by SHA.
 * @param {Array<object>} sortedCommits - List of all commits sorted topologically.
 * @param {Array<string>} mainLine - Array of SHA strings representing the main branch.
 * @returns {Map<string, object>} A map of loops, keyed by merge commit SHA.
 */
export function buildLoopsDependency(
  startCommit,
  commits,
  sortedCommits,
  mainLine,
  baseLevel = 0
) {
  const loopMap = new Map();

  function recurse(co, baseLevel = 0) {
    if (!co || util.endOfMainLign(co, commits)) return;

    if (!util.isMerge(co)) {
      return recurse(commits.get(co.parents[0]), baseLevel);
    }

    const mergeSha = co.sha;
    const forkPath = [];
    const mainPath = [];
    const annotatedPath = [];

    // --- Fork path ---
    let coForkParent = commits.get(co.parents[1]);
    let forkSha = '';
    if (coForkParent) {
      forkPath.push(coForkParent.sha);
      while (coForkParent && !mainLine.includes(coForkParent.sha)) {
        coForkParent = commits.get(coForkParent.parents[0]);
        if (coForkParent && !mainLine.includes(coForkParent.sha)) {
          forkPath.push(coForkParent.sha);
        }
      }
      if (coForkParent) forkSha = coForkParent.sha;
    }

    // --- Main path ---
    let coMainParent = commits.get(co.parents[0]);
    while (coMainParent && coMainParent.sha !== forkSha) {
      mainPath.push(coMainParent.sha);
      coMainParent = commits.get(coMainParent.parents[0]);
    }

    const forkSet = new Set(forkPath);
    const mainSet = new Set(mainPath);

    // --- Annotated path ---
    const color = util.getRandomHexColor();

    // Pushing the merge node first
    annotatedPath.push({
      sha: mergeSha,
      isFork: false,
      isPartOfLoop: true,
      color: color,
      fCommit: commits.get(mergeSha),
      level: 0,
    });

    let forkLevel = 1;
    let beginLoop = sortedCommits.findIndex((c) => c.sha === mergeSha) - 1;
    let previousIncrease = false;

    for (let i = beginLoop; i >= 0; i--) {
      const commit = sortedCommits[i];
      const sha = commit.sha;
      if (sha === forkSha) break;

      let isFork = false;
      let isPartOfLoop = false;

      if (previousIncrease) {
        forkLevel++;
        previousIncrease = false;
      }

      // If main is a fork, reduce level by 1
      if (forkLevel > 1 && util.isMain(sha, mainLine) && util.isFork(commit)) {
        for (let i = 1; i < commit.children.length; i++) {
          if (
            isGivenShaAfterCompareSha(
              commit.children[i].sha,
              mergeSha,
              loopMap,
              commits
            )
          ) {
            forkLevel--;
          }
        }
        if (forkLevel < 1) {
          forkLevel = 1;
        }
        // If main is a merge, add level by 1 at the next iteration
      }

      if (util.isMain(sha, mainLine) && util.isMerge(commit)) {
        previousIncrease = true;
      }

      // If node is not part of the path, foreign
      if (forkSet.has(sha)) {
        isFork = true;
      }

      if (isFork || mainSet.has(sha)) {
        isPartOfLoop = true;
      }

      annotatedPath.push({
        sha,
        isFork,
        isPartOfLoop,
        level: forkLevel,
        fCommit: commit,
        color: color,
      });
    }

    // Push last node the fork sha
    annotatedPath.push({
      sha: forkSha,
      isFork: false,
      color: color,
      isPartOfLoop: true,
      level: 0,
    });

    // 🔍 Optional log
    // console.log(`\n📌 Loop from merge ${mergeSha}`);
    // annotatedPath.forEach(({ sha, isFork, isPartOfLoop, level }, index) => {
    //   const indent = '\t'.repeat(level);
    //   const label = isFork
    //     ? '🌿 Fork'
    //     : isPartOfLoop
    //       ? '🔷 Main'
    //       : '❌ Not Part';
    //   console.log(
    //     `${indent}${index}. ${label} | Level: ${level} | SHA: ${sha.slice(0, 5)}`
    //   );
    // });

    // 🗂 Store in Map
    loopMap.set(mergeSha, {
      mergeSha,
      forkSha,
      mainPath,
      forkPath,
      color,
      annotatedPath,
    });

    return recurse(commits.get(co.parents[0]));
  }

  recurse(startCommit);
  return loopMap;
}
