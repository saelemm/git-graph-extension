export function endOfMainLign(co, commits) {
  return (
    !co || !co.parents || co.parents.length == 0 || !commits.get(co.parents[0])
  );
}

export function isMerge(co) {
  return co.parents.length > 1;
}

export function isFork(co) {
  return co.children.length > 1;
}

export function isMain(sha, mainLine) {
  return mainLine.includes(sha);
}
