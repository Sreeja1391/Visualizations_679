let bar_ages = [];
const generator = d3.randomUniform(0, 500);
let id = 0;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", 1000)
    .attr("height", 400)
    
function createInitialChart() {
    svg.selectAll("rect")
        .data(bar_ages, (d) => d.id)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 40)
        .attr("y", (d) => 200 - d.height)
        .attr("width", 80)
        .attr("height", (d) => d.height)
        .attr("fill", "black");
}

function updateChart() {
    bar_ages = bar_ages.map((d) => ({ id: d.id, age: d.age + 1, height: d.height }));
    bar_ages = bar_ages.filter((d) => d.age < 5);

    bar_ages.unshift({ age: 0, height: generator(), id: id });
    id += 1;

    const barWidth = 80;
    const barSpacing = 100;

    const bars = svg.selectAll("rect")
        .data(bar_ages, (d) => d.id);

    bars.transition()
        .duration(500)
        .attr("x", (d, i) => i * barSpacing)

    bars.enter()
        .append("rect")
        .attr("x", (d, i) => i * barSpacing)
        .attr("y", 200)
        .attr("width", barWidth)
        .attr("height", 0)
        .attr("fill", "black")
        .merge(bars)
        .transition()
        .duration(500)
        .attr("x", (d, i) => i * barSpacing)
        .attr("y", (d) => 200 - d.height)
        .attr("width", barWidth)
        .attr("height", (d) => d.height);

        bars.exit()
        .transition()
        .duration(500)
        .attr("x", (d, i) => i * barSpacing)
        .attr("y", 200)
        .attr("height", 0)
        .style("fill-opacity", 0) 
        .remove();
    
}


document.getElementById("updateButton").addEventListener("click", updateChart);
createInitialChart();

