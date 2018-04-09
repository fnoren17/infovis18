var m_width = $("#map").width(),
width = 290, //to fit screen better
height = 290,
country,
state;

var projection = d3.geoMercator()
.scale(45)
.translate([width / 2, height / 1.60])
.precision(0.1);

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
.attr("id", "zoom")
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

var g = svg.append("g")
.attr("id", "zoom");

// Tooltip för mouseover
var div = d3.select(".vis-wrapper").append("div")
.attr("class", "tooltip")
.styles({"opacity": 0,"height": "auto"});

// Här är datan om utsläppen
function drawmap(dummyData, mapdata) {

totCountries = 0; // Totala antalet länder
totEmission = 0; // Det totala utsälppet för alla exporter
for (i=0;i<dummyData.children.length;i++) { // Kontinenter
for (j=0;j<dummyData.children[i].children.length;j++) { // Länder
  totCountries = totCountries + 1;
for (k=0;k<dummyData.children[i].children[j].children.length;k++) { // Produkter
  totEmission = totEmission + dummyData.children[i].children[j].children[k].size;
}
}
}

g.append("g")
.attr("id", "countries")
.selectAll("path")
.data(topojson.feature(mapdata, mapdata.objects.countries).features)
.enter()
.append("path")
.attr("id", function(d) { return d.id; })
.styles({"fill": function(d){
  var tempNum = 0;
  var countryMapColor;
for (i=0;i<dummyData.children.length;i++) { // Kontinenter
for (j=0;j<dummyData.children[i].children.length;j++) { // Länder
  if (dummyData.children[i].children[j].name == d.properties.name) {
// If country has color attribute
if (dummyData.children[i].children[j].color) {
  // countryMapColor = dummyData.children[i].children[j].color;
  countryMapColor = dummyData.children[i].color;
  //console.log("Country: " +dummyData.children[i].children[j].name +". Color: " +dummyData.children[i].children[j].color);
  return "rgb("+countryMapColor.colorR+","+countryMapColor.colorG+","+countryMapColor.colorB+")";
} else {
// Else, return some dark color
  //console.log("Country has no color attribute. Returning some color.");
  return "rgb(255,255,255)";
}


}
}
}
if (d.properties.name == "Brazil"){
  return "#808080";
}

}, "stroke": "black"})

.attr("d", path)
.on("click", country_clicked)
.on("mouseover", function(d) { // Tanken är att när man hovrar över ett land så kan man få snabbinfo
//console.log(d)
div.transition()
.duration(200)
.style("opacity", 0.9);

div.html(d.properties.name) //+ "<br>" + top2[0].name + ": " + top2[0].size + "<br>" + top2[1].name + ": " + top2[1].size)
//console.log(d)
.style("left", (d3.event.pageX + 10) + "px")
.style("top", (d3.event.pageY - 28) + "px");
})
// Tooltip för mouseover
.on("mousemove", function(d){
  yoff = $('.vis-wrapper').offset().top;
  xoff = $('#sidebar').width();
  div.styles({"left": (d3.event.pageX - 20 - xoff) + "px", "top": (d3.event.pageY - yoff - 20) + "px"});
})
.on("mouseout", function(d) {
  div.transition()
  .duration(500)
  .style("opacity", 0);
});
}


function zoom(xyz) {
  g.transition()
  .duration(750)
  .attr("transform", "translate(" + projection.translate() + ")scale(" + xyz[2] + ")translate(-" + xyz[0] + ",-" + xyz[1] + ")")
  .selectAll(["#countries", "#states", "#cities"])
  .selectAll(".city")
  .attr("d", path.pointRadius(20.0 / xyz[2]));
}

function get_xyz(d) {
  var bounds = path.bounds(d);
  var w_scale = (bounds[1][0] - bounds[0][0]) / width;
  var h_scale = (bounds[1][1] - bounds[0][1]) / height;
  var z = 0.432 / Math.max(w_scale, h_scale);
  if (z > 3) {
    z = 3;
  }
  var x = (bounds[1][0] + bounds[0][0]) / 2;
  var y = (bounds[1][1] + bounds[0][1]) / 2 + (height / z / 6);
  return [x, y, z];
}

function country_clicked(d) {
// console.log(d)
// console.log("You clicked on " + d.properties.name);
//b._groups[0][0].style.strokeWidth = 10
  g.selectAll(["#states", "#cities"]).remove();
  state = null;

  if (country) {
    g.selectAll("#" + country.id).style('display', null);
  }

  if (d && country !== d) {
    var xyz = get_xyz(d);
    country = d;
    zoom(xyz);
    d3.select("rect#zoom").style("display", "none");
  }
  clickFromCountry(d);
}

$(window).resize(function() {
  var w = $("#map").width();
  svg.attr("width", w);
  svg.attr("height", w * height / width);
});
