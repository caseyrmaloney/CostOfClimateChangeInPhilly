(function() {
    var width = 1200, height = 800;
    var barWidth = 550, barHeight=350;
    Promise.all([
        d3.json("./data/floodplains/philadelphia.geojson"),
        d3.json("./data/floodplains/FEMA_100_Flood_Plain2.geojson"),
        d3.json("./data/floodplains/FEMA_500_Flood_Plain2.geojson"),
        d3.csv("./data/floodplains/floodcounts.csv"),
        d3.csv("./data/floodplains/yearly_floodcounts.csv")
    ]).then((data) => {
        const philadelphia = data[0];
        const floodplains100 = data[1];
        const floodplains500 = data[2];
        const floods = data[3]
        const yearlyFloods = data[4]
        let mapProjection = d3.geoMercator()
        .fitExtent([[0, 0], [width, height]], philadelphia);
        
        let floodProjection = d3.geoMercator()
        .fitExtent([[0, 0], [width, height]], floodplains100);

        let mapPath = d3.geoPath()
        .projection(mapProjection);

        let floodPath = d3.geoPath()
        .projection(mapProjection);

        const floodDict = new Map();
        floods.forEach((location) => {
            floodDict.set(location.location, +location.flood_count)
        })

        var yearlyFloodData = new Map();
        yearlyFloods.forEach((location) => {
            yearlyFloodData.set(location.location, new Map([
                ["2006", location[2006]],
                ["2007", location[2007]],
                ["2008", location[2008]],
                ["2009", location[2009]],
                ["2010", location[2010]],
                ["2011", location[2011]],
                ["2012", location[2012]],
                ["2013", location[2013]],
                ["2014", location[2014]],
                ["2015", location[2015]],
                ["2016", location[2016]],
                ["2017", location[2017]],
                ["2018", location[2018]],
            ]
            ))
        });
       const distinctValues = Array.from(yearlyFloodData.get("Airport").keys());
       console.log(distinctValues);
        var x = d3.scaleBand()
        .domain(distinctValues)
        .range([20, barWidth])
        .padding(0.1);

        var y = d3.scaleLinear()
        .domain([0, 4])
        .range([barHeight, 50]);

        var blues = d3.scaleSequential()
        .domain(d3.extent(floodDict.values()))
        .range(['#deebf7', '#3182bd'])

        var scaleCircles = d3.scaleLinear()
        .domain(d3.extent(floodDict.values()))
        .range([5, 15]);
        
        d3.select('body').append('div').attr('id', 'tooltip')
        .attr('style', 'position: absolute; opacity: 0;');

        const svg = d3.select("#floodplains").append('g')
        .attr('transform', 'translate(50,50)')
        const bar1 = d3.select("#bar1").append("g").attr('transform', 'translate(50,0)');
        const bar2 = d3.select("#bar2").append("g").attr('transform', 'translate(50,0)');
        var bar1Set = false;

        let map = svg.append('g')
        .selectAll("path")
        .data(philadelphia.features)
        .join("path")
        .attr("d", mapPath)
        .attr("fill", (d) => {
            if (floodDict.has(d.properties.name)) {
                return blues(floodDict.get(d.properties.name))
            }
            else {
                return "#d1d1d1"
            }
        })
        .attr("stroke", "black")
        .attr("stroke-width", "1px")
        .on('mouseover', function(e, d) {
            d3.select(this)
            .attr("stroke-width", "3px")
            d3.select('#tooltip').transition()
            .duration(100).style('opacity', 1)
            .text(d.properties.name)
        })
        .on('mouseout', function(e, d) {
            d3.select(this)
            .attr("stroke-width", "1px");
            d3.select('#tooltip').style('opacity', 0)
        })
        .on('mousemove', function(e, d) {
            d3.select('#tooltip')
            .style('left', (e.pageX+10) + 'px')
            .style('top', (e.pageY+10) + 'px')
        })

        let mapCircles = svg.append('g')
        .selectAll("circle")
        .data(philadelphia.features)
        .join("circle")
        .attr("cx", (d) => {
            return mapPath.centroid(d)[0];
        })
        .attr("cy", (d) => {
            return mapPath.centroid(d)[1];
        })
        .attr("r", (d) => {
            if (floodDict.has(d.properties.name)) {
                return scaleCircles(floodDict.get(d.properties.name))
            }
            else return 0;
        })
        .attr("fill", "#0c407c")
        .on('click', (event, d) => {
            console.log(d)
           drawBars(d.properties.name);
        })
        .on('mouseover', function(e,d) {
            d3.select(this)
            .attr("r", () => {
                return parseInt(this.getAttribute("r")) + 3
            })
            .attr("stroke-width", "2px")
            .attr("stroke", "white");

            d3.select('#tooltip').transition()
            .duration(100).style('opacity', 1)
            .text(d.properties.name)
        })
        .on('mouseout', function(e, d) {
            d3.select(this)
            .attr("r", () => {
                return scaleCircles(floodDict.get(d.properties.name))

            })
            .attr("stroke-width", "0px")
            .attr("stroke", "none");
            d3.select('#tooltip').style('opacity', 0)
         })
         .on('mousemove', function(e, d) {
            d3.select('#tooltip')
            .style('left', (e.pageX+10) + 'px')
            .style('top', (e.pageY+10) + 'px')
        })

        let map2 = svg.append('g')
        .selectAll("path")
        .data(floodplains100.features)
        .join("path")
        .attr("d", floodPath)
        .attr("fill", (d) => {
            return "none";
        })
        .attr("stroke", "#4f8fbc")
        .attr("stroke-width", "4px")
        .attr("fill", "#4f8fbc")
        .attr("opacity", "0.5");

        let map3 = svg.append('g')
        .selectAll("path")
        .data(floodplains500.features)
        .join("path")
        .attr("d", floodPath)
        .attr("fill", (d) => {
            return "none";
        })
        .attr("stroke", "4f8fbc")
        .attr("stroke-width", "0px")
        
       drawLegend();
        function drawBars(location) {
            data = yearlyFloodData.get(location);
            var data = Array.from(data, ([year, value]) => ({ year, value }));
            console.log(data);
           // if (!bar1Set) {
                bar1.selectAll('rect').remove();
                var bg = bar1.append('rect')
                .attr("x", -35)
                .attr("y", 5)
                .attr("width", 600)
                .attr("height", 385)
                .attr("fill", "#dddddd")
                .attr("stoke-width", "1px")
                .attr('stroke', "black");

                bars = bar1.append('g')
                .selectAll('rect')
                .data(data)
                .join('rect')
                .attr("x", (d) => {
                    return x(d.year);
                })
                .attr("y", (d) => {
                    return y(d.value);
                })
                .attr("width", "35px")
                .attr("height", function(d) { 
                    return barHeight - y(+d.value); })
                .attr("fill", "#0c407c");
                
                bar1.append('text') 
                .attr("y", 27)
                .attr("x", barWidth/2 - 40)
                .text(location)
                .attr("font-size", "20px");

                bar1.append('text')
                .attr('class', 'axis-title') 
                .attr("x", barWidth/2)
                .attr("y", barHeight + 30)

                .text('Year');

                bar1.append('text')
                .attr('class', 'axis-title') 
                .attr("y", -15)
                .attr("x", -((barHeight/2)+25))
                .style("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .text('Floods');

                bar1.append("g")
                .attr("transform", "translate(0," + (barHeight) + ")")
                .call(
                    d3.axisBottom(x)
                );
                bar1.append("g")
                .attr("transform", "translate(15, 0)")
                .call(
                    d3.axisLeft(y).ticks(4)
                );
           // }
/*             else {
                bar2.selectAll('rect').remove()
                bars = bar2.append('g')
                .selectAll('rect')
                .data(data)
                .join('rect')
                .attr("x", (d) => {
                    return x(d.year);
                })
                .attr("y", (d) => {
                    //console.log(y(d.value))
                    return y(d.value);
                })
                .attr("width", "35px")
                .attr("height", function(d) { 
                // console.log(y(+d.value))
                    return barHeight - y(+d.value); })
                .attr("fill", "#0c407c");
            } */
        }

        function drawLegend() {

            svg.append('text')
            .attr("x", 10)
            .attr("y", 5)
            .text("Legend")

            let leg = svg.append('g')
            .selectAll('rect')
            .data([5])
            .join('rect')
            .attr("x", 10)
            .attr("y", 10)
            .attr("fill", "#f7f7f7")
            .attr("height", "200px")
            .attr("width", "180px")
            .attr("stroke", "black")
            .attr("stroke-width", "1px")

            mapLegend = ['#d2e4f3', '#c5dcef', '#6fa8d2', '#3182bd']
            size = 30;
            let scale = svg.append('g')
            .selectAll('rect')
            .data(mapLegend)
            .enter()
            .append('rect')
            .attr('x', function(d,i) {
                return 40 + i*(size)
            })
            .attr("y", 40)
            .attr("height", size)
            .attr("width", size)
            .attr('fill', function(d) {
                return d;
            })
            svg.append('text')
            .attr("x", 40)
            .attr("y", 120)
            .text("Floods")

            let scale2 = svg.append('g')
            .selectAll('circle')
            .data([8,10,13,14])
            .enter()
            .append('circle')
            .attr('cy', 90)
            .attr('cx', function(d, i) {
                return 44 + d*2.5*i
            })
            .attr("r", function(d, i ) {
                return d
            })
            .attr("fill", "#0c407c")

            scale3 = svg.append('g')
            .selectAll('rect')
            .data([5])
            .enter()
            .append('rect')
            .attr("x", 40)
            .attr("y", 150)
            .attr("width", 120)
            .attr("height", 15)
            .attr("fill", "#4f8fbc")

            svg.append('text')
            .attr("x", 40)
            .attr("y", 185)
            .text("Floodplains")

        }
        function updateFloodplain(year) {
           if (year == 100) {
               map2
               .attr("stroke", "#4f8fbc")
                .attr("stroke-width", "4px")
                .attr("fill", "#4f8fbc")
                .attr("opacity", "0.5")

               map3
               .attr("stroke-width", "0px")
               .attr("fill", "none");
           }
           else {
               map2
               .attr("stroke-width", "0px")
               .attr("fill", "none"); 

               map3
               .attr("stroke", "#4f8fbc")
                .attr("stroke-width", "4px")
                .attr("fill", "#4f8fbc")
                .attr("opacity", "0.5");
           }
        }
        const select = document.getElementById('toggle');

        select.addEventListener('click', ({ target }) => {
            if (target.getAttribute('name') == 'floodplainToggle') {
                console.log(target.value);
                updateFloodplain(target.value);
            }
        })
    })


})()