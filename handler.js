    var m_width = $("#map").width(),
        width = 938 *1.3, //to fit screen better
        height = 500 *1.3,
        country,
        state;

    var projection = d3.geoMercator()
        .scale(150)
        .translate([width / 2, height / 1.5]);

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

    var g = svg.append("g");

    // Tooltip för mouseover
    var div = d3.select("#map").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    d3.queue()
      .defer(d3.json, "dummyData.json")
      .await(analyze);

  // Här är datan om utsläppen
  function analyze(error, dummyData) {
    if(error) { console.log(error); }

    //console.log(dummyData.children.length);
    //console.log(dummyData.children[0].children.length);
    //return dummyData;

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


    d3.json("countries.topo.json", function(error, us) {
      g.append("g")
        .attr("id", "countries")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.countries).features)
        .enter()
        .append("path")
        .attr("id", function(d) { return d.id; })
        .styles({"fill": function(d){
            var tempNum = 0;
            for (i=0;i<dummyData.children.length;i++) { // Kontinenter
              for (j=0;j<dummyData.children[i].children.length;j++) { // Länder
                if (dummyData.children[i].children[j].name == d.properties.name) {
                  for (k=0;k<dummyData.children[i].children[j].children.length;k++) { // Produkter
                    tempNum = tempNum + dummyData.children[i].children[j].children[k].size
                  }
                }
              }
            }
            if (d.properties.name == "Brazil"){
                return "#808080"
            }
            if ((tempNum / totEmission) > (1 / totCountries)) {
              return "#d8965d"
            } else if ((tempNum / totEmission) > (0.75 / totCountries)) {
              return "#D2B48C"
            } else if ((tempNum / totEmission) > (0.5 / totCountries)) {
              return "#F5DEB3"
            } else {
              return "#FAEBD7"
            }
        }})
        .attr("d", path)
        .on("click", country_clicked)
        .on("mouseover", function(d) { // Tanken är att när man hovrar över ett land så kan man få snabbinfo
              div.transition()
                  .duration(200)
                  .style("opacity", .9);
                  top2 = [{"name": "No Import", "size": 0}, {"name": "No Import", "size": 0}]; // De två produkterna med mest emission
                  for (i=0;i<dummyData.children.length;i++) { // Kontinenter
                    for (j=0;j<dummyData.children[i].children.length;j++) { // Länder
                        if (dummyData.children[i].children[j].name == d.properties.name) {
                          country = dummyData.children[i].children[j].children // Produkter
                          for (k=0;k<country.length;k++) {
                            if (top2.length < 2) {
                                top2.push(country[k])
                            } else {
                              if (top2[0].size < country[k].size) {
                                top2.shift();
                                top2.push(country[k]);
                              } else if (top2[1].size < country[k].size) {
                                  top2.pop();
                                  top2.push(country[k]);
                              }
                            }
                          }
                          if (top2[0] < top2[1]) {
                            top2.reverse();
                          }
                        }
                    }
                  }
              div	.html(d.properties.name + "<br>" + top2[0].name + ": " + top2[0].size + "<br>" + top2[1].name + ": " + top2[1].size)
                  //console.log(d)
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - 28) + "px");
              })
          .on("mouseout", function(d) {
              div.transition()
                  .duration(500)
                  .style("opacity", 0);
          });
    });
  }

        function zoomed(d){
            console.log(d.properties.name);
            d3.selectAll("path")
            .style("visibility", function(a){
                if(a.properties.name == d.properties.name){
                    return "visible";
                } else {
                    return "hidden";
                }
            });
            // vm i fulhax
            setTimeout(function(){ window.location.href = 'sunburstIndex.html';},1000)

        }

    function zoom(xyz, d) {
      g.transition()
        .duration(750)
        .attr("transform", "translate(" + projection.translate() + ")scale(" + xyz[2] + ")translate(-" + xyz[0] + ",-" + xyz[1] + ")")
        .selectAll(["#countries", "#states", "#cities"])
        //.style("stroke-width", 1.0 / xyz[2] + "px")
        .selectAll(".city")
        .attr("d", path.pointRadius(20.0 / xyz[2]));
        if(d){
            zoomed(d);
        }
    }

    function get_xyz(d) {
      var bounds = path.bounds(d);
      var w_scale = (bounds[1][0] - bounds[0][0]) / width;
      var h_scale = (bounds[1][1] - bounds[0][1]) / height;
      var z = .32 /Math.max(w_scale, h_scale);
      var x = (bounds[1][0] + bounds[0][0]) / 2;
      var y = (bounds[1][1] + bounds[0][1]) / 2 + (height / z / 6);
      return [x, y, z];
    }

    function country_clicked(d) {
      g.selectAll(["#states", "#cities"]).remove();
      state = null;

      if (country) {
        g.selectAll("#" + country.id).style('display', null);
      }

      if (d && country !== d) {
        var xyz = get_xyz(d);
        country = d;
        zoom(xyz, d);

      } else {
        var xyz = [width / 2, height / 1.5, 1];
        country = null;
        d3.selectAll("path")
          .style("visibility", "visible");
        zoom(xyz);
      }
    }

    $(window).resize(function() {
      var w = $("#map").width();
      svg.attr("width", w);
      svg.attr("height", w * height / width);
    });
