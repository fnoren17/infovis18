var m_width = $("#map").width(),
    width = 400, //to fit screen better
    height = 400,
    country,
    state;

var projection = d3.geoMercator()
    .scale(60)
    .translate([width / 2, height / 1.60])
    .precision(.1);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("preserveAspectRatio", "xMidYMid")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("width", m_width)
    .attr("height", m_width * height / width);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", country_clicked);

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .call(d3.zoom()
    .scaleExtent([1,4])
    .translateExtent([[0,0], [m_width, m_width * height / width]])
    .on("zoom", zoomed));

function zoomed() {
    g.attr("transform", d3.event.transform);
}

var g = svg.append("g");

d3.json("countries.topo.json", function(error, us) {
    g.append("g")
        .attr("id", "countries")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.countries).features)
        .enter()
        .append("path")
        .attr("id", function(d) { return d.id; })
        .attr("style", function(d){return d.properties.name == "Brazil" ? "fill: #efa131; stroke: black" : "stroke: black"})
        .attr("d", path)
        .on("click", country_clicked);
});

function country_clicked(d) {
    //console.log("You clicked on " + d.properties.name);
	console.log("clicked " + d.objects.countries.bbox);
    clickFromCountry(d.properties.name);
}

$(window).resize(function() {
var w = $("#map").width();
svg.attr("width", w);
svg.attr("height", w * height / width);
});