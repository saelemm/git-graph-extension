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

export function getRandomHexColor() {
  const hex = Math.floor(Math.random() * 0x1000) // 0x000 to 0xfff
    .toString(16)
    .padStart(3, '0');
  return `#${hex}`;
}
