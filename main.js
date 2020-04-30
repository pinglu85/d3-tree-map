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

const title = document.getElementById('title');
const description = document.getElementById('description');

title.innerText = DATASETS.videoGames.title;
description.innerText = DATASETS.videoGames.description;

const width = 960;
const height = 570;
const marginBottom = 210;

const svg = d3
  .select('.tree-map')
  .append('svg')
  .attr('width', width)
  .attr('height', height + marginBottom);

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
        svg.selectAll('*').remove();
        ready(data);
      })
      .catch((err) => console.log(err));
  });
});

d3.json(DATASETS.videoGames.url)
  .then((data) => ready(data))
  .catch((err) => console.log(err));

function ready(data) {
  console.log(data);
}
