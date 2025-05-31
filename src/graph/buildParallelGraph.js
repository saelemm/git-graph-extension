import * as util from './utilFunctionGraph';

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
  mainLine
) {
  const loopMap = new Map();

  function recurse(co) {
    if (!co || util.endOfMainLign(co, commits)) return;

    if (!util.isMerge(co)) {
      return recurse(commits.get(co.parents[0]));
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

    // Pushing the merge node first
    annotatedPath.push({
      sha: mergeSha,
      isFork: false,
      isPartOfLoop: true,
      fCommit: commits.get(mergeSha),
      level: 0,
    });

    let forkLevel = 1;
    let beginLoop = sortedCommits.findIndex((c) => c.sha === mergeSha) - 1;
    const color = util.getRandomHexColor();

    for (let i = beginLoop; i >= 0; i--) {
      const commit = sortedCommits[i];
      const sha = commit.sha;
      if (sha === forkSha) break;

      let isFork = false;
      let isPartOfLoop = false;

      if (!forkSet.has(sha) && !mainSet.has(sha)) {
        annotatedPath.push({
          sha,
          isFork,
          isPartOfLoop,
          level: ++forkLevel,
          fCommit: commit,
          color: color,
        });
        continue;
      }

      isPartOfLoop = true;
      if (forkSet.has(sha)) {
        isFork = true;
      } else if (mainSet.has(sha)) {
        if (util.isFork(commit)) forkLevel++;
        if (util.isMerge(commit) && forkLevel > 1) forkLevel--;
      }

      annotatedPath.push({
        sha,
        isFork,
        isPartOfLoop,
        fCommit: commits.get(sha),
        color: color,
        level: forkLevel,
      });
    }

    annotatedPath.push({
      sha: forkSha,
      isFork: false,
      isPartOfLoop: true,
      level: 0,
    });

    // 🔍 Optional log
    console.log(`\n📌 Loop from merge ${mergeSha}`);
    annotatedPath.forEach(({ sha, isFork, isPartOfLoop, level }, index) => {
      const indent = '\t'.repeat(level);
      const label = isFork
        ? '🌿 Fork'
        : isPartOfLoop
          ? '🔷 Main'
          : '❌ Not Part';
      console.log(
        `${indent}${index}. ${label} | Level: ${level} | SHA: ${sha.slice(0, 5)}`
      );
    });

    // 🗂 Store in Map
    loopMap.set(mergeSha, {
      mergeSha,
      forkSha,
      mainPath,
      forkPath,
      annotatedPath,
    });

    return recurse(commits.get(co.parents[0]));
  }

  recurse(startCommit);
  return loopMap;
}
