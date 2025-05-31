export function drawCircle(
  svg,
  branches,
  dates,
  branchBaseX,
  commit,
  x,
  y,
  color
) {
  svg
    .append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', 6)
    .attr('fill', color);

  const matchingBranch = branches.find((b) => b.commit.sha === commit.sha);
  const date = new Date(commit.data.commit.author.date);
  const dateString = date.toLocaleDateString();
  const monthStr = date.getMonth() + 1;
  const dayStr = date.getDate();
  let headString = '';
  const branchName = matchingBranch ? `[${matchingBranch.name}]` : '';
  const HEAD = matchingBranch ? `[HEAD]` : '';
  if (HEAD) {
    headString = `${commit.sha.slice(0, 2)} ${HEAD}  ${branchName}`;
    if (headString.length > 22) {
      headString = headString.slice(0, 22) + '...';
    }
  }
  const message = HEAD ? headString : commit.sha.slice(0, 2);
  if (!dates.has(dateString)) {
    svg
      .append('text')
      .attr('x', branchBaseX - 35)
      .attr('y', y + 4)
      .text(`${dayStr}/${monthStr}`)
      .attr('fill', '#fff')
      .attr('font-size', '10px');
    dates.add(dateString);
  }

  svg
    .append('text')
    .attr('x', x + 12)
    .attr('y', y + 4)
    .text(`${message}`)
    .attr('fill', '#fff')
    .attr('font-size', '12px');
}
