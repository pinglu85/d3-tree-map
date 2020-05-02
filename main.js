const DATASETS = {
  videoGames: {
    title: 'Video Game Sales',
    description: 'Top 100 Most Sold Video Games Grouped by Platform',
    url:
      'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json',
  },
  movies: {
    title: 'Movie Sales',
    description: 'Top 100 Highest Grossing Movies Grouped By Genre',
    url:
      'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json',
  },
  kickstarter: {
    title: 'Kickstarter Pledges',
    description:
      'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
    url:
      'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json',
  },
};
const DEFAULT_DATASET = 'videoGames';

const title = document.getElementById('title');
const description = document.getElementById('description');

title.innerText = DATASETS[DEFAULT_DATASET].title;
description.innerText = DATASETS[DEFAULT_DATASET].description;

const svgTreemapWidth = 960;
const svgTreemapHeight = 570;
const svgLegendWidth = 600;
const fader = (color) => d3.interpolateRgb(color, '#fff')(0.4);
const color = d3.scaleOrdinal().range(
  [
    //d3.schemeCategory20
    '#1f77b4',
    '#aec7e8',
    '#ff7f0e',
    '#ffbb78',
    '#2ca02c',
    '#98df8a',
    '#d62728',
    '#ff9896',
    '#9467bd',
    '#c5b0d5',
    '#8c564b',
    '#c49c94',
    '#e377c2',
    '#f7b6d2',
    '#7f7f7f',
    '#c7c7c7',
    '#bcbd22',
    '#dbdb8d',
    '#17becf',
    '#9edae5',
  ].map(fader)
);
const format = d3.format(',d');

const svgTreemap = d3
  .select('.tree-map')
  .append('svg')
  .attr('id', 'tree-map')
  .attr('width', svgTreemapWidth)
  .attr('height', svgTreemapHeight);

const svgLegend = d3
  .select('.tree-map')
  .append('svg')
  .attr('id', 'legend')
  .attr('width', svgLegendWidth);

// Tree map
const treemap = (data) =>
  d3.treemap().size([svgTreemapWidth, svgTreemapHeight]).padding(1)(
    d3
      .hierarchy(data)
      .eachBefore((d) => {
        const id = (d.parent ? `${d.parent.data.id}.` : '') + d.data.name;
        return (d.data.id = id.toLowerCase().replace(/[\s|\W]/g, (match) => {
          return match === ' ' ? '.' : '';
        }));
      })
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value)
  );

// tooltip
const tip = d3
  .tip()
  .attr('id', 'tooltip')
  .direction('e')
  .offset([0, -10])
  .html((d) => d);
svgTreemap.call(tip);

// Change dataset on click
[].forEach.call(document.querySelectorAll('a[data-name]'), (node) => {
  node.addEventListener('click', (e) => {
    e.preventDefault();
    let datasetName = e.target.dataset.name;
    title.innerText = DATASETS[datasetName].title;
    description.innerText = DATASETS[datasetName].description;
    d3.json(DATASETS[datasetName].url)
      .then((data) => {
        ready(data);
      })
      .catch((err) => console.log(err));
  });
});

d3.json(DATASETS[DEFAULT_DATASET].url)
  .then((data) => ready(data))
  .catch((err) => console.log(err));

function ready(data) {
  const root = treemap(data);
  const t = svgTreemap.transition().duration(200);

  // Leaf
  const leaf = svgTreemap
    .selectAll('g')
    .data(root.leaves())
    .join('g')
    .attr('transform', (d) => `translate(${d.x0}, ${d.y0})`);

  // Remove existing children from leaf
  leaf.selectAll('*').transition().duration(200).style('opacity', 0).remove();
  // Remove existing children from legend
  svgLegend
    .selectAll('*')
    .transition()
    .duration(200)
    .style('opacity', 0)
    .remove();

  // Tile
  leaf
    .append('rect')
    .attr('id', (d) => d.data.id)
    .attr('class', 'tile')
    .attr('data-name', (d) => d.data.name)
    .attr('data-category', (d) => d.data.category)
    .attr('data-value', (d) => d.data.value)
    .attr('fill', (d) => color(d.data.category))
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0)
    .on('mouseover', (d, i, n) => {
      const html = `Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`;
      tip.attr('data-value', d.data.value);
      tip.show(html, n[i]);
    })
    .on('mouseout', tip.hide);

  // clip-path for leaf description
  leaf
    .append('clipPath')
    .attr('id', (d) => `clip-${d.data.id}`)
    .append('use')
    .attr('xlink:href', (d) => `#${d.data.id}`);

  // Leaf description
  leaf
    .append('text')
    .attr('clip-path', (d) => `url(#clip-${d.data.id})`)
    .selectAll('tspan')
    // 'Wii Sports' => ['Wii', 'Sports']
    .data((d) =>
      d.data.name
        .trim()
        .split(/(?=[A-Z][a-z])|\s+/g)
        .concat(format(d.value))
    )
    .join('tspan')
    .attr('x', 4)
    .attr(
      'y',
      (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`
    )
    .text((d) => d)
    .attr('font-size', 11)
    .attr('fill-opacity', (d, i, nodes) =>
      i === nodes.length - 1 ? 0.65 : null
    );

  // Legend Dataset
  const categories = root.leaves().map((node) => node.data.category);
  const filteredCategories = categories.filter(
    (category, i, arr) => arr.indexOf(category) === i
  );

  // Legend
  const legendContainerXOffset = 60;
  const legendContainerYOffset = 20;
  const legendRectSize = 15;
  const legendHSpacing = 200;
  const legendVSpacing = 10;
  const legendPerRow = Math.floor(svgLegendWidth / legendHSpacing);
  const legendTextXOffset = 3;
  const legendTextYOffset = -2;

  svgLegend.attr(
    'height',
    (filteredCategories.length / legendPerRow) *
      (legendRectSize + legendVSpacing) +
      legendContainerYOffset
  );
  const legendContainer = svgLegend
    .append('g')
    .attr(
      'transform',
      `translate(${legendContainerXOffset}, ${legendContainerYOffset})`
    );

  const legend = legendContainer
    .selectAll('g')
    .data(filteredCategories)
    .join('g')
    .attr(
      'transform',
      (d, i) =>
        `translate(${(i % legendPerRow) * legendHSpacing}, ${
          Math.floor(i / legendPerRow) * legendRectSize +
          legendVSpacing * Math.floor(i / legendPerRow)
        })`
    );

  legend
    .append('rect')
    .attr('class', 'legend-item')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .attr('fill', (d) => color(d));

  legend
    .append('text')
    .attr('x', legendRectSize + legendTextXOffset)
    .attr('y', legendRectSize + legendTextYOffset)
    .text((d) => d);
}
