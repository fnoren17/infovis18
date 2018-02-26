    var m_width = $("#map").width(),
        width = 400, //to fit screen better
        height = 400,
        country,
        state;

    var projection = d3.geoMercator()
        .scale(50)
        .translate([width / 2, height / 1.60]);

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

    d3.json("countries.topo.json", function(error, us) {
      g.append("g")
        .attr("id", "countries")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.countries).features)
        .enter()
        .append("path")
        .attr("id", function(d) { return d.id; })
        .attr("style", function(d){
              console.log(d.properties.name)
              if (d.properties.name == "Brazil") {
                  console.log("hej brazil")
                  return "fill: #efa131";
              }
          })
        .attr("d", path)
        .on("click", country_clicked);
    });
        
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