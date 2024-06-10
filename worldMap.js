var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var projection = d3.geoNaturalEarth1()
    .scale(width / 1.3 / Math.PI)
    .translate([width / 2, height / 2]);

var path = d3.geoPath().projection(projection);

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function getColor(value) {
    if (value > 35) return "#d62728";
    else if (value > 25) return "#ff7f0e";
    else if (value > 15) return "#9467bd";
    else if (value > 10) return "#2ca02c";
    else return "#1f77b4";
}

// Load PM2.5 data from a CSV file
d3.csv("pm25_data.csv").then(function(data) {
    // Load and parse geojson data
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(geoData) {
        svg.append("g")
            .selectAll("path")
            .data(geoData.features)
            .enter().append("path")
                .attr("fill", function(d) {
                    const countryData = data.find(c => c.code === d.id);
                    return countryData ? getColor(countryData.value) : "#ccc";
                })
                .attr("d", path)
                .style("stroke", "#fff")
                .on("mouseover", function(event, d) {
                    const countryData = data.find(c => c.code === d.id);
                    if (countryData) {
                        tooltip.transition().duration(200).style("opacity", .9);
                        tooltip.html(`<strong>${countryData.country}</strong><br>PM2.5: ${countryData.value}`)
                            .style("left", (event.pageX) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    }
                })
                .on("mouseout", function(d) {
                    tooltip.transition().duration(500).style("opacity", 0);
                })
                .on("click", function(event, d) {
                    const countryData = data.find(c => c.code === d.id);
                    if (countryData) {
                        window.open(`barGraph.html?code=${countryData.code}`, '_blank');
                    }
                });
    });
});
