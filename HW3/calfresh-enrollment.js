const transitionDuration = 300;
const chartWidth = 600;
const chartHeight = 400;
const mapTranslation = 700;

let yExtent, yScale, county_data;
function make_scales(data, margin) {
  yExtent = d3.extent(data.map(d => d.calfresh));
  yScale = (yExtent[1] - yExtent[0]) / 100;

  return {
    x: d3.scaleTime()
      .domain(d3.extent(data.map(d => d.date)))
      .range([margin.left, chartWidth - margin.right]),
    y: d3.scaleLinear()
      .domain([yExtent[0] - yScale, yExtent[1] + yScale])
      .range([chartHeight - margin.bottom, margin.top]),
    fill: d3.scaleSequential(d3.interpolateBlues)
      .domain(d3.extent(data.map(d => d.calfresh)))
  };
}

function draw_axes(scales, margin) {
  let x_axis = d3.axisBottom(scales.x);
  d3.select("#x_axis")
    .attr("transform", `translate(0, ${chartHeight - margin.bottom})`)
    .call(x_axis);

  let y_axis = d3.axisLeft(scales.y);
  d3.select("#y_axis")
    .transition(transitionDuration)
    .ease(d3.easeLinear)
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(y_axis);
}
function draw_lines(county_data, scales) {
  let path_generator = d3.line()
    .x(d => scales.x(d.date))
    .y(d => scales.y(d.calfresh))

  d3.select("#lines")
    .selectAll("path")
    .data([county_data]).enter()
    .append("path")
    .transition(300)
    .ease(d3.easeLinear)
    .attrs({
      d: path_generator,
      id: cd => cd.county,
      stroke: "#a8a8a8",
      "stroke-width": 3, 
      fill: 'none', 
      opacity: 0.9
    })
}

function generate_ts(data) {
  let margin = {top: 100, right: 10, bottom: 20, left: 50}

  let scales = make_scales(data, margin)
  draw_axes(scales, margin)
  draw_lines(data, scales)
}

function update_ts(map_data, calfresh_data) {
  county_data = calfresh_data.filter(d => d.county == map_data.properties.county)
  d3.select("#lines")
    .selectAll("path")
    .remove()
  generate_ts(county_data)

  d3.select("#map")
    .selectAll("path")
    .attr("stroke-width", d => d.properties.county == map_data.properties.county ? 4 : 0)
}

function generate_map(map_data, calfresh_data) {
  let width = chartWidth;
  let height = chartHeight;
  let proj = d3.geoMercator().fitSize([width, height], map_data)
  let path = d3.geoPath().projection(proj)

  let calfresh_county_means = calfresh_data.reduce((result, cd) => {
    if (!result[cd.county]) {
      result[cd.county] = { sum: 0, count: 0 };
    }
    result[cd.county].sum += cd.calfresh;
    result[cd.county].count += 1;
    return result;
  }, {})

  Object.values(calfresh_county_means).forEach((d) => d.mean = d.sum/d.count)

  let fillScale = d3.scaleSequential(d3.interpolateReds)
                    .domain(d3.extent(Object.values(calfresh_county_means).map(d => d.mean)))
                    
  d3.select("#map")
    .selectAll("path")
    .data(map_data.features).enter()
    .append("path")
    .attrs({
      d: path,
      fill: d => fillScale(calfresh_county_means[d.properties.county].mean),
      "stroke-width": 0,
      stroke: "#000",
      transform: `translate(${mapTranslation}, 0)`
    })
    .on("mouseover", (_, map_data) => update_ts(map_data, calfresh_data));
                
  }

function visualize([calfresh_data, map_data]) {
  let parseDate = d3.timeParse('%Y %b')
  calfresh_data.forEach((d) => {d.date = parseDate(d.date)})
  generate_ts(calfresh_data)
  generate_map(map_data, calfresh_data)
}


Promise.all([
  d3.csv("calfresh-small_filtered.csv", d3.autoType), 
  d3.json("ca-counties.geojson")
]).then(visualize)