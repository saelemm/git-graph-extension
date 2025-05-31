/**
 * Draws a curved SVG path from a single annotated path directly to a provided SVG element.
 *
 * @param {Object} svg - D3 selection of an SVG container (e.g., d3.select('svg'))
 * @param {Array} annotatedPath - Array of commit nodes with { level, ... }
 * @param {string} branchColor - Stroke color for the path
 * @param {number} baseX - Starting X for main branch (default 100)
 * @param {number} spacing - X spacing per fork level (default 80)
 * @param {number} rowHeight - Y spacing per commit (default 40)
 */
export function drawForkLigns(
  svg,
  annotatedPath,
  branchColor,
  baseX = 100,
  spacing = 80,
  rowHeight = 40
) {
  if (!svg || !annotatedPath || annotatedPath.length < 2) return;

  const points = annotatedPath.map((node, index) => ({
    x: baseX + node.level * spacing,
    y: index * rowHeight + rowHeight / 2, // center vertically
  }));

  let path = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const controlY = (prev.y + curr.y) / 2;

    path += ` C${prev.x},${controlY} ${curr.x},${controlY} ${curr.x},${curr.y}`;
  }

  svg
    .append('path')
    .attr('d', path)
    .attr('stroke', branchColor)
    .attr('fill', 'none')
    .attr('stroke-width', 2);
}
