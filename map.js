var m_width = $("#map").width(),
    width = 290, //to fit screen better
    height = 290,
    country,
    state;

var projection = d3.geoMercator()
    .scale(45)
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

// Tooltip för mouseover
  var div = d3.select(".vis-wrapper").append("div")
    .attr("class", "tooltip")
    .styles({"opacity": 0,"height": "auto"});

d3.queue()
    .defer(d3.json, "data.json")
    .await(analyze);

// Här är datan om utsläppen
function drawmap(dummyData, mapdata) {

  totCountries = 0; // Totala antalet länder
  totEmission = 0; // Det totala utsälppet för alla exporter
  for (i=0;i<dummyData.children.length;i++) { // Kontinenter
    for (j=0;j<dummyData.children[i].children.length;j++) { // Länder
      totCountries = totCountries + 1
      for (k=0;k<dummyData.children[i].children[j].children.length;k++) { // Produkter
        totEmission = totEmission + dummyData.children[i].children[j].children[k].size
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
              return "#808080"
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
            //console.log(d)
            div.transition()
                .duration(200)
                .style("opacity", .9);
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
            yoff = $('.vis-wrapper').offset().top
            xoff = $('#sidebar').width();
            div.styles({"left": (d3.event.pageX - 20 - xoff) + "px", "top": (d3.event.pageY - yoff - 20) + "px"})
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
}


function country_clicked(d) {
    console.log(d)
    console.log("You clicked on " + d.properties.name);
    //b._groups[0][0].style.strokeWidth = 10
    clickFromCountry(d);
}

$(window).resize(function() {
var w = $("#map").width();
svg.attr("width", w);
svg.attr("height", w * height / width);
});
