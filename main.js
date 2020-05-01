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

const width = 960;
const height = 570;
const marginBottom = 210;
const fader = (color) => d3.interpolateRgb(color, '#fff')(0.2);
const color = d3
  .scaleOrdinal()
  .range(
    [
      '#1f77b4',
      '#aec7e8',
      '#ff7f0e',
      '#ffbb78',
      '#2ca02c',
      '#98df8a',
      '#d62728',
      '#9467bd',
      '#8c564b',
      '#e377c2',
      '#7f7f7f',
      '#bcbd22',
      '#17becf',
    ].map(fader)
  );
const format = d3.format(',d');

const svg = d3
  .select('.tree-map')
  .append('svg')
  .attr('width', width)
  .attr('height', height + marginBottom);

// Tree map
const treemap = (data) =>
  d3
    .treemap()
    .tile(d3.treemapResquarify)
    .size([width, height])
    .round(true)
    .paddingInner(1)(
    d3
      .hierarchy(data)
      .eachBefore(
        (d) =>
          (d.data.id = (d.parent ? `${d.parent.data.id}.` : '') + d.data.name)
      )
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value)
  );

// tooltip
const tip = d3
  .tip()
  .attr('id', 'tooltip')
  .offset([0, 10])
  .html((d) => d);
svg.call(tip);

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
  const t = svg.transition().duration(200);

  const leaf = svg
    .selectAll('g')
    .data(root.leaves())
    .join('g')
    .attr('transform', (d) => `translate(${d.x0}, ${d.y0})`);

  // Remove the existing children from leaf
  leaf.selectAll('*').transition().duration(300).style('opacity', 0).remove();

  leaf
    .append('rect')
    .attr('id', (d) => d.data.id)
    .attr('class', 'tile')
    .attr('data-name', (d) => d.data.name)
    .attr('data-category', (d) => d.data.category)
    .attr('data-value', (d) => d.data.value)
    .attr('fill', (d) => color(d.data.category))
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0);
}
