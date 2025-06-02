import * as d3 from 'd3';

/**
 * Draws a curved SVG path from a single annotated path directly to a provided SVG element.
 *
 * @param {Object} svg - D3 selection of an SVG container (e.g., d3.select('svg'))
 * @param {Array} annotatedPath - Array of commit nodes with { level, ... }
 * @param {string} branchColor - Stroke color for the path
 * @param {number} baseX - Starting X for main branch (default 100)
 * @param {number} spacing - X spacing per fork level (default 80)
 * @param {number} rowHeight - Y spacing per commit (default 40)
 * @param {number} yOffset - Vertical offset to shift the whole path down (default 0)
 */
export function drawForkLigns(
  svg,
  annotatedPath,
  branchColor,
  baseX = 100,
  spacing = 80,
  rowHeight = 40,
  yOffset = 0,
  xOffset = 0
) {
  if (!svg || !annotatedPath || annotatedPath.length < 2) return;

  // Compute all points first
  const points = annotatedPath.map((node, index) => ({
    x: baseX + node.level * spacing,
    y: index * rowHeight + rowHeight / 2,
  }));

  // Apply yOffset only once to the entire path
  let path = `M${points[0].x},${points[0].y + yOffset}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const controlY = (prev.y + curr.y) / 2;

    path += ` C${prev.x},${controlY + yOffset} ${curr.x},${controlY + yOffset} ${curr.x},${curr.y + yOffset}`;
  }

  svg
    .append('path')
    .attr('d', path)
    .attr('stroke', branchColor)
    .attr('fill', 'none')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', function () {
      return this.getTotalLength();
    })
    .attr('stroke-dashoffset', function () {
      return this.getTotalLength();
    })
    .on('mouseover', function () {
      d3.select(this)
        .transition()
        .duration(150)
        .attr('stroke-width', 5)
        .attr('stroke', 'orange'); // Optional: make it more "flashy"
    })
    .on('mouseout', function () {
      d3.select(this)
        .transition()
        .duration(100)
        .attr('stroke-width', 2)
        .attr('stroke', branchColor);
    })
    .transition()
    .duration(1200)
    .attr('stroke-dashoffset', 0);
}

/**
 * Draws a straight SVG line between two coordinate points.
 *
 * @param {Object} svg - D3 selection of an SVG container (e.g., d3.select('svg'))
 * @param {number} x1 - Starting x coordinate
 * @param {number} y1 - Starting y coordinate
 * @param {number} x2 - Ending x coordinate
 * @param {number} y2 - Ending y coordinate
 * @param {string} strokeColor - Stroke color of the line
 * @param {number} strokeWidth - Width of the line (default 2)
 */
export function drawMainLine(
  svg,
  x1,
  y1,
  x2,
  y2,
  strokeColor,
  strokeWidth = 1
) {
  if (!svg) {
    console.warn('SVG container is required.');
    return;
  }

  const line = svg
    .append('line')
    .attr('x1', x1)
    .attr('y1', y1)
    .attr('x2', x2)
    .attr('y2', y2)
    .attr('stroke', strokeColor)
    .attr('stroke-width', strokeWidth);
  line
    .transition()
    .duration(2000)
    .ease(d3.easeCubicInOut)
    .attr('x2', x2)
    .attr('y2', y2);
}
