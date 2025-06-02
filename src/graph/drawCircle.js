import * as d3 from 'd3';

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
    .attr('fill', color)
    .on('mouseover', function () {
      d3.select(this)
        .transition()
        .duration(150)
        .attr('r', 8)
        .style('cursor', 'pointer')
        .attr('fill', 'white');
    })
    .on('mouseout', function () {
      d3.select(this)
        .transition()
        .duration(100)
        .attr('r', 6)
        .style('cursor', 'default')
        .attr('fill', color);
    })
    .on('click', function () {
      window.open(commit?.data?.html_url, '_blank');
    });

  const matchingBranch = branches.find((b) => b.commit.sha === commit.sha);
  const date = new Date(commit.data.commit.author.date);
  const dateString = date.toLocaleDateString();
  const monthStr = date.getMonth() + 1;
  const dayStr = date.getDate();
  let headString = '';
  const branchName = matchingBranch ? `[${matchingBranch.name}]` : '';
  if (matchingBranch) {
    headString = `${commit.sha.slice(0, 2)} ${branchName}`;
    if (headString.length > 15) {
      headString = headString.slice(0, 20) + '...';
    }
  }
  const message = matchingBranch ? headString : commit.sha.slice(0, 2);
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
