(function(){
	var width=800, height = 780;
	//doing it this way seems slow how could we improve performance?
	Promise.all([
		d3.csv("./data/temps/emissions_formatted.csv"),
		d3.csv("./data/temps/avg_annual_temps.csv")
	]).then((data) => {
		//emissions of CO2 from 1990-2018, data collected and reformatted from https://www.climatewatchdata.org/ghg-emissions?end_year=2018&regions=USA.PA&source=US&start_year=1990
		const ems = data[0];
		//avg annual temps, data collected and reformatted from https://www.weather.gov/wrh/climate?wfo=phi
		const temps = data[1];
	

	var margin = {top: 20, right: 10, bottom: 40, left: 90},
    width = 800 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// append the svg object to the body of the page, svg is for emissions graph
var svg = d3.select("#leftgraph")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 10)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//rsvg is for temperature graph
var rsvg = d3.select("#rightgraph")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 10)
	.append("g")
	.attr("transform", "translate(" + -100 + "," + margin.top + ")");

	//add X axis for temps
var r_x = d3.scaleLinear()
		.domain([0,60])
		.range([0,width]);


  // Add X axis for emissions
  var x = d3.scaleLinear()
    .domain([300, 0])
    .range([ 0, width]);


	// x axis labels for emissions
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

	  //x axis title for emissions
  svg.append("text")
	.attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width/2)
    .attr("y", height + margin.top + margin.bottom - 15)
	  .text("Mt of CO2 Emitted");

	  	// x axis labels for temps
  rsvg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(r_x))
  .selectAll("text")
	.attr("transform", "translate(-10,0)rotate(-45)")
	.style("text-anchor", "end");

	//x axis title for temps
rsvg.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .attr("x", width-40)
  .attr("y", height + margin.top + margin.bottom - 15)
	.text("Average annual temperature in degrees Fahrenheit");

  // Y axis for both
  var y = d3.scaleBand()
    .range([ 0, height ])
    .domain(ems.map(function(d) { return d.Year; }))
    .padding(.1);

	//y axis label for both
  svg.append("g")
    .call(d3.axisLeft(y))

  //Bars for temp
  svg.selectAll("rect")
    .data(ems)
    .join("rect")
    .attr("x", function(d) {return x(d['CO2 in Mt']); } )
    .attr("y", function(d) { return y(d.Year); })
    .attr("width", function(d) { 
		return (x(0)-x(d['CO2 in Mt'])); })
    .attr("height", y.bandwidth() )
    .attr("fill", "#B6A67D")


rsvg.selectAll("rect")
	.data(temps)
	.join("rect")
	.attr("x", function(d) {return r_x(0)})
	.attr("y", function(d) { return y(d.Year); })
	.attr("width",function(d) {return r_x(d['Avg Temp']);})
	.attr("height", y.bandwidth() )
    .attr("fill", "#D43F1E")
})
})();


