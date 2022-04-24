(function() {
    var width = 1200, height = 800

    Promise.all([
        d3.json("./data/floodplains/philadelphia.geojson"),
        d3.json("./data/floodplains/FEMA_100_Flood_Plain2.geojson"),
        d3.json("./data/floodplains/FEMA_500_Flood_Plain2.geojson"),
        d3.csv("./data/floodplains/floodcounts.csv")
    ]).then((data) => {
        const philadelphia = data[0];
        const floodplains100 = data[1];
        const floodplains500 = data[2];
        const floods = data[3]
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

        var blues = d3.scaleSequential()
        .domain(d3.extent(floodDict.values()))
        .range(['#deebf7', '#3182bd'])
       //console.log(floodplains.features)

        var scaleCircles = d3.scaleLinear()
        .domain(d3.extent(floodDict.values()))
        .range([5, 15]);

        const svg = d3.select("#floodplains").append('g').attr('transform', 'translate(50,50)');

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
        .attr("stroke-width", "1px");

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
                console.log(d)
                return scaleCircles(floodDict.get(d.properties.name))
            }
            else return 0;
        })
        .attr("fill", "#0c407c");

        let map2 = svg.append('g')
        .selectAll("path")
        .data(floodplains100.features)
        .join("path")
        .attr("d", floodPath)
        .attr("fill", (d) => {
           // console.log(d)
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
            //console.log(d)
            return "none";
        })
        .attr("stroke", "4f8fbc")
        .attr("stroke-width", "0px");
        
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