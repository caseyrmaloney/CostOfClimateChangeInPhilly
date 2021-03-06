(function(){

	Promise.all([
		d3.csv("./data/temps/emissions_formatted.csv"),
		d3.csv("./data/temps/avg_annual_temps.csv")
	]).then((data) => {
		//emissions of CO2 from 1990-2018, data collected and reformatted from https://www.climatewatchdata.org/ghg-emissions?end_year=2018&regions=USA.PA&source=US&start_year=1990
		var ems = data[0];
		//avg annual temps, data collected and reformatted from https://www.weather.gov/wrh/climate?wfo=phi
		var temps = data[1];

		//array of [index,{year, co2}] in chronological order
		var ems_array = Object.entries(ems)

		//array of [index,{year, co2}] in emissions order
		var ems_sorted = ems_array.sort((a,b) => b[1]['CO2 in Mt']-a[1]['CO2 in Mt'])
		ems_sorted.pop();

		var temps_sorted =  Object.entries(temps).sort((a,b) => b[1]['Avg Temp'] - a[1]['Avg Temp'])
		temps_sorted.pop();

	var margin = {top: 20, right: 10, bottom: 40, left: 90},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

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

	//add X for temps
var r_x = d3.scaleLinear()
		.domain([0,60])
		.range([0,width]);


  // Add X  for emissions
  var x = d3.scaleLinear()
    .domain([300, 0])
    .range([ 0, width]);


	// Y axis for both chrono
	var y = d3.scaleBand()
	  .range([ 0, height ])
	  .domain(ems.map(function(d) { return d.Year; }))
	  .padding(.1);
	
	//Y axis for both emissions
	var emis_y = d3.scaleBand()
	  .range([ 0, height ])
	  .domain(ems_sorted.map(function(d) { return d[1].Year; }))
	  .padding(.1);

	//Y axis for both temps
	var temps_y = d3.scaleBand()
		.range([ 0, height ])
		.domain(temps_sorted.map(function(d) { return d[1].Year; }))
		.padding(.1);
  

	// x axis labels for emissions
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
	  .style("font", "14px times");

	  //x axis title for emissions
  svg.append("text")
	.attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width/2)
    .attr("y", height + margin.top + margin.bottom - 15)
	.style("font", "22px times")
	  .text("Mt of CO2 Emitted");

	// x axis labels for temps
  rsvg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(r_x))
  .selectAll("text")
	.attr("transform", "translate(-10,0)rotate(-45)")
	.style("text-anchor", "end")
	.style("font", "14px times");

	//x axis title for temps
rsvg.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .attr("x", width-40)
  .attr("y", height + margin.top + margin.bottom - 15)
  	.style("font", "22px times")
	.text("Average annual temperature in degrees Fahrenheit");


	//y axis label for both graphs chrono ordering
  let yAxis = svg.append("g")
	.attr("class", "yaxis")
	.style("font", "18px times")
    .call(d3.axisLeft(y))


  //Bars for emissions
  svg.selectAll("rect")
    .data(ems)
    .join("rect")
    .attr("x", function(d) {return x(d['CO2 in Mt']); } )
    .attr("y", function(d) {return y(d.Year); })
    .attr("width", function(d) { return (x(0)-x(d['CO2 in Mt'])); })
    .attr("height", y.bandwidth() )
    .attr("fill", "#999999")
	.attr("stroke", "#949494")
	.attr("stroke-width","1.5")

	//left graph mouseover info
	svg.selectAll("rect")
	.append("title")
	.data(ems)
	.text(function(d) {return d.Year + ": " + d['CO2 in Mt'];})

//bars for temp
rsvg.selectAll("rect")
	.data(temps)
	.join("rect")
	.attr("x", function(d) {return r_x(0)})
	.attr("y", function(d) { return y(d.Year); })
	.attr("width",function(d) {return r_x(d['Avg Temp']);})
	.attr("height", y.bandwidth() )
    .attr("fill", "#ff564a")
	.attr("stroke", "#bd4040")
	.attr("stroke-width","1.5")

	//right graph mouseover info
rsvg.selectAll("rect")
	.append("title")
	.data(temps)
	.text(function(d) {return d.Year + ": " + d['Avg Temp'];})


	//transformation function for sorting by emissions from highest to lowest
	d3.select("#byEmis").on("click", function() {
		//left graph
		svg.selectAll("rect")
		.data(ems_sorted)
		.join("rect")
			.transition()
			.duration(500)
			.attr("x", function(d) { return x(d[1]['CO2 in Mt']); } )
			.attr("y", function(d) {return emis_y(d[1].Year); })
			.attr("width", function(d) {return (x(0)-x(d[1]['CO2 in Mt'])); })
			.attr("height", emis_y.bandwidth() )
		.select("title")
		   .text(function(d) {return d[1].Year + ": " + d[1]['CO2 in Mt'];})
	

		svg.select(".yaxis")
			.transition()
			.duration(500)
			.call(d3.axisLeft(emis_y));

		//right graph
		rsvg.selectAll("rect")
			.data(temps)
			.join("rect")
			.transition()
			.duration(500)
			.attr("x", function(d) {return r_x(0)})
			.attr("y", function(d) { return emis_y(d.Year); })
			.attr("width",function(d) {return r_x(d['Avg Temp']);})
			.attr("height", y.bandwidth() )
			.select("title")
			.text(function(d) {return d.Year + ": " + d['Avg Temp'];})

		})

		
	//transformation function for going back to chrono sort
	d3.select("#byChronological").on("click", function() {
		//left graph
		svg.selectAll("rect")
			.data(ems)
			.join("rect")
			  .transition()
			  .duration(500)
			  .attr("x", function(d) {return x(d['CO2 in Mt']); } )
			  .attr("y", function(d) {return y(d.Year);})
			  .attr("width", function(d) {return (x(0)-x(d['CO2 in Mt'])); })
			.attr("height", y.bandwidth() )
			.select("title")
			.text(function(d) {return d.Year + ": " + d['CO2 in Mt'];})
		
			svg.select(".yaxis")
			.transition()
			.duration(500)
			.call(d3.axisLeft(y));

		  //right graph
		  rsvg.selectAll("rect")
			.data(temps)
			.join("rect")
			.transition()
			.duration(500)
			.attr("x", function(d) {return r_x(0)})
			.attr("y", function(d) { return y(d.Year); })
			.attr("width",function(d) {return r_x(d['Avg Temp']);})
			.attr("height", y.bandwidth() )
			.select("title")
			.text(function(d) {return d.Year + ": " + d['Avg Temp'];})
		})

		//transformation function for temperature sort
		d3.select("#byTemp").on("click", function() {
			//left graph
			svg.selectAll("rect")
				.data(ems)
				.join("rect")
				  .transition()
				  .duration(500)
				  .attr("x", function(d) {return x(d['CO2 in Mt']); } )
				  .attr("y", function(d) {return temps_y(d.Year);})
				  .attr("width", function(d) {return (x(0)-x(d['CO2 in Mt'])); })
				.attr("height", y.bandwidth() )
				.select("title")
				.text(function(d) {return d.Year + ": " + d['CO2 in Mt'];})

				svg.select(".yaxis")
				.transition()
				.duration(500)
				.call(d3.axisLeft(temps_y));

			
			  //right graph
			  rsvg.selectAll("rect")
				.data(temps_sorted)
				.join("rect")
				.transition()
				.duration(500)
				.attr("x", function(d) {return r_x(0)})
				.attr("y", function(d) { return temps_y(d[1].Year); })
				.attr("width",function(d) {return r_x(d[1]['Avg Temp']);})
				.attr("height", y.bandwidth() )
				.select("title")
			.text(function(d) {return d[1].Year + ": " + d[1]['Avg Temp'];})
			})
})
})();


