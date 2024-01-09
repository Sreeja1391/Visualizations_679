const svg = d3.select("svg");

function generateRandomData() {
  return d3.range(10).map(d3.randomUniform());
}

function updateCircles() {
  const newData = generateRandomData();

  svg
    .selectAll("circle")
    .data(newData)
    .transition()
    .duration(1000)
    .attr("cx", (d, i) => i * 40 + 40)
    .attr("cy", 100)
    .attr("r", (d) => d * 10) 
    .attr("fill", (d) => d3.interpolateRainbow(d));
}

const circles = svg
  .selectAll("circle")
  .data(generateRandomData())
  .enter()
  .append("circle")
  .attr("cx", (d, i) => i * 40 + 40)
  .attr("cy", 100)
  .attr("r", 10)
  .attr("fill", "black"); 

setInterval(updateCircles, 2000); 
