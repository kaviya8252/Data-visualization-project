function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', function() {
    const selectedCountryCode = getQueryParam('country');
    if (selectedCountryCode) {
        d3.select('#countrySelect').node().value = selectedCountryCode;
        updateData(selectedCountryCode);
    }
});

const svg = d3.select("svg"),
    margin = { top: 20, right: 30, bottom: 40, left: 60 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

const xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height})`);

const yAxis = g.append("g")
    .attr("class", "y axis");

// Legend Data
const legendData = [
    { label: "> 35 µg/m³", color: "#d62728" },
    { label: "25 - 35 µg/m³", color: "#ff7f0e" },
    { label: "15 - 25 µg/m³", color: "#9467bd" },
    { label: "10 - 15 µg/m³", color: "#2ca02c" },
    { label: "< 10 µg/m³", color: "#1f77b4" }
];

function barColor(value) {
    if (value > 35) return legendData[0].color;
    else if (value > 25) return legendData[1].color;
    else if (value > 15) return legendData[2].color;
    else if (value > 10) return legendData[3].color;
    else return legendData[4].color;
}

// Load data from CSV and populate dropdown
d3.csv("data.csv").then(data => {
    const countries = Array.from(new Set(data.map(d => d.Country)));
    const select = d3.select("#countrySelect");
    select.selectAll("option")
        .data(countries)
        .enter().append("option")
        .text(d => d)
        .attr("value", d => d);

    // Trigger update when selection changes
    select.on("change", function() {
        updateData(this.value, data);
    });

    // Initial update
    updateData(countries[0], data);
});

function updateData(selectedCountry, fullData) {
    const data = fullData.filter(d => d.Country === selectedCountry);

    x.domain(data.map(d => d.Year));
    y.domain([0, d3.max(data, d => +d.Value)]);

    xAxis.call(d3.axisBottom(x).tickFormat(d3.format("d")));
    yAxis.call(d3.axisLeft(y));

    const bars = g.selectAll(".bar").data(data);

    bars.exit().remove();

    bars.enter().append("rect")
        .attr("class", "bar")
        .merge(bars)
        .transition().duration(750)
        .attr("x", d => x(d.Year))
        .attr("y", d => y(+d.Value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(+d.Value))
        .attr("fill", d => barColor(+d.Value));

    // Update legend
    const legend = d3.select(".legend").selectAll(".legend-item")
        .data(legendData, d => d.label);

    const legendEnter = legend.enter().append("div")
        .attr("class", "legend-item");

    legendEnter.append("div")
        .attr("class", "legend-rect")
        .style("background-color", d => d.color);

    legendEnter.append("text")
        .text(d => d.label);

    legend.exit().remove();
}
