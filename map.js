var container = $('.vis-wrapper');

var cwidth = container.width(),
cheight = container.height(),
radius = (Math.min(cwidth, cheight) / 2);


var m_width = $("#map").width(),
    width = radius, //to fit screen better
    height = radius,
    country,
    state;


var scaling = radius/10 + 20;

var projection = d3.geoMercator()
    .scale(scaling)
    .translate([width / 2, height / 1.60])
    .precision(0.1);

var path = d3.geoPath()
.projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("preserveAspectRatio", "xMidYMid")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("width", radius)
    .attr("height", radius);

svg.append("rect")
.attr("class", "background")
.attr("width", width)
.attr("height", height)
.on("click", country_clicked);


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
                  countryMapColor = dummyData.children[i].color;
                  return "rgb("+countryMapColor.colorR+","+countryMapColor.colorG+","+countryMapColor.colorB+")";
                } else {
                // Else, return some dark color
                  return "rgb(255,255,255)";
                }

                /*
                // Heat map code
                for (k=0;k<dummyData.children[i].children[j].children.length;k++) { // Produkter
                  tempNum = tempNum + dummyData.children[i].children[j].children[k].size
                }
                // End of Heat map code
                */
              }
            }
          }
          if (d.properties.name == "Brazil"){
              return "#808080";
          }

          /*
          // Heat map code
          if ((tempNum / totEmission) > (64 / totCountries)) {
            return "#996633"
          } else if ((tempNum / totEmission) > (32 / totCountries)) {
            return "#ac7339"
          } else if ((tempNum / totEmission) > (16 / totCountries)) {
            return "#bf8040"
          } else if ((tempNum / totEmission) > (8 / totCountries)) {
            return "#c68c53"
          } else if ((tempNum / totEmission) > (4 / totCountries)) {
            return "#cc9966"
          } else if ((tempNum / totEmission) > (2 / totCountries)) {
            return "#d2a679"
          } else if ((tempNum / totEmission) > (1 / totCountries)) {
            return "#d9b38c"
          } else if ((tempNum / totEmission) > (0.5 / totCountries)) {
            return "#dfbf9f"
          } else if ((tempNum / totEmission) > (0.25 / totCountries)) {
            return "#e6ccb3	"
          } else if ((tempNum / totEmission) > (0.12 / totCountries)) {
            return "#ecd9c6"
          } else if ((tempNum / totEmission) > (0.06 / totCountries)) {
            return "#f2e6d9"
          } else if ((tempNum / totEmission) > (0 / totCountries)) {
            return "#f9f2ec"
          } else {
            return "#ffffff"
          }
          // Heat map code
          */
        }, "stroke": "black"})

        .attr("d", path)
        .on("click", country_clicked)
        .on("mouseover", function(d) { // Tanken är att när man hovrar över ett land så kan man få snabbinfo
            div.transition()
                .duration(200)
                .style("opacity", 0.9);
                // top2 = [{"name": "No Import", "size": 0}, {"name": "No Import", "size": 0}]; // De två produkterna med mest emission
                // for (i=0;i<dummyData.children.length;i++) { // Kontinenter
                //   for (j=0;j<dummyData.children[i].children.length;j++) { // Länder
                //       if (dummyData.children[i].children[j].name == d.properties.name) {
                //         country = dummyData.children[i].children[j].children // Produkter
                //         for (k=0;k<country.length;k++) {
                //           if (top2.length < 2) {
                //               top2.push(country[k])
                //           } else {
                //             if (top2[0].size < country[k].size) {
                //               top2.shift();
                //               top2.push(country[k]);
                //             } else if (top2[1].size < country[k].size) {
                //                 top2.pop();
                //                 top2.push(country[k]);
                //             }
                //           }
                //         }
                //         if (top2[0] < top2[1]) {
                //           top2.reverse();
                //         }
                //       }
                //   }
                // }
            div.html(d.properties.name) //+ "<br>" + top2[0].name + ": " + top2[0].size + "<br>" + top2[1].name + ": " + top2[1].size)
                //console.log(d)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        // Tooltip för mouseover
        .on("mousemove", function(d){
            yoff = $('.vis-wrapper').offset().top;
            xoff = $('#sidebar').width();

            div.styles({"left": (d3.event.pageX - 70 - xoff) + "px", "top": (d3.event.pageY - yoff - 20) + "px"})

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

// $(window).resize(function() {
// var w = $("#map").width();
// svg.attr("width", w);
// svg.attr("height", w * height / width);
// });
