(function(){
	var width=800, height = 780;
	//doing it this way seems slow how could we improve performance?
	Promise.all([
		d3.csv("./temps/emissions_formatted.csv"),
		d3.csv("./temps/avg_annual_temps.csv")
	]).then((data) => {
		//emissions of CO2 from 1990-2018, data collected and reformatted from https://www.climatewatchdata.org/ghg-emissions?end_year=2018&regions=USA.PA&source=US&start_year=1990
		const ems = data[0];
		//avg annual temps, data collected and reformatted from https://www.weather.gov/wrh/climate?wfo=phi
		const temps = data[1];
	
	// console.log(ems);
	// console.log(temps);
	
	// ems.forEach((x,i) => 
	// console.log(x.Year + " " + x['CO2 in Mt']))

	// const distinctYears = [...new Set(ems.map((d) => d.Year))]

	// var svg =d3.select('leftgraph')
	// 	.apprend("svg")
	// 	.attr("width",width)
	// 	.attr("height",height)
	// 	.append("g")
	// 	.attr("transform" , "translate(50, 50)");

	// var x = d3.scaleLinear()
	// 	.domain([0,300])
	// 	.range([0,width]);

	// var y = d3.scaleBand()
	// 	.domain(distinctYears)
	// 	.range([0,height])
	// 	.padding(0.1);

	// svg.selectAll("rect")
	// 	.data(ems)
	// 	.join('rect')
	// 	.attr("x",100)
	// 	.attr("y", function(d){return d.Year})
	// 	.attr("width", function(d){return d['CO2 in Mt']})
	// 	.attr("height", y.bandwidth() )
    // 	.attr("fill", "#69b3a2")

	var margin = {top: 20, right: 30, bottom: 40, left: 90},
    width = 800 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#leftgraph")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 10)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data


  // Add X axis
  var x = d3.scaleLinear()
    .domain([300, 0])
    .range([ 0, width]);


	// x axis label
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

	  //x axis label
  svg.append("text")
	.attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.top + margin.bottom - 12)
	  .text("Mt of CO2");

  // Y axis
  var y = d3.scaleBand()
    .range([ 0, height ])
    .domain(ems.map(function(d) { return d.Year; }))
    .padding(.1);

	//y axis label
  svg.append("g")
    .call(d3.axisLeft(y))

  //Bars
  svg.selectAll("rect")
    .data(ems)
    .join("rect")
    .attr("x", function(d) {return x(d['CO2 in Mt']); } )
    .attr("y", function(d) { return y(d.Year); })
    .attr("width", function(d) { 
		return (x(0)-x(d['CO2 in Mt'])); })
    .attr("height", y.bandwidth() )
    .attr("fill", "#B6A67D")


    // .attr("x", function(d) { return x(d.Country); })
    // .attr("y", function(d) { return y(d.Value); })
    // .attr("width", x.bandwidth())
    // .attr("height", function(d) { return height - y(d.Value); })
    // .attr("fill", "#69b3a2")


})
})();


