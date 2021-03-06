var container = $('.vis-wrapper');
var map = $('#map');

var width = container.width(),
height = container.height(),
radius = (Math.min(width, height) / 2);

map.css({
  width: radius,
  height: radius
});


var formatNumber = d3.format(",d");
var currentNode;
var latestClicked;

var x = d3.scaleLinear()
    .range([0, 2 * Math.PI]); //Längd av arcs?

var y = d3.scaleSqrt()
    .range([0, radius]); //Ändring av siffran i range här skapar ett vitt utrymme i mitten av sunbursten

var partition = d3.partition();
var arc = d3.arc() //Varje interation av d här är ett "block" i sunbursten.
    .startAngle(function(d) {return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });


var svg = d3.select("#sunburst").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

function drawSunburst(root){
    root = d3.hierarchy(root); //Root är mittencirkeln!
    root.sum(function(d) { return d.size; });

    // Append tooltip to vis-wrapper
    d3.selectAll(".vis-wrapper")
        .append("div")
        .attr("class", "text")
        .attr("width", 200)
        .attr("height", 200)
        .style("opacity", 1);

   svg.selectAll("path")
        .data(partition(root).descendants())
        .enter().append("path")
        .attr("class", "sunburst")
        .attr("display", function(d){
          return d.depth ? null : "none";
        })
        .attr("d", arc)
        .attr("id", function(d){
          return d.data.name.replace(/\s+/g, '');
        })
        .style("fill", function(d) { 
          return "rgb("+d.data.color.colorR+","+d.data.color.colorG+","+d.data.color.colorB+")";
        })
        .attr("opacity", function(d){
          return d.depth == 0 ? 0 : 1;
        })
        .on("click", click)
        .on("mouseover",mouseover)
        .on("mousemove",mousemove)
        .on("mouseout", mouseout);
}


function mouseover(d){
//Fade the segments
    d3.selectAll("path")
        .style("opacity", function(a){
            if(a == d && a.depth != 0) {
                return 1;
            } else if(a.depth == 0) {
                return 0;
            } else {
                return 0.5;
            }
        });
}

//tooltip
function mousemove(d){
    yoff = $('.vis-wrapper').offset().top;
    xoff = $('#sidebar').width();
    d3.selectAll(".text")
        .styles({"display": "block","top": event.pageY - yoff + 10 + "px", "left": event.pageX -xoff - 70 + "px"})
        .html(d.data.name + "\n" + formatNumber(d.value) + " tons CO2");
        //.attr("style", "left:" + event.clientX + "px")
}

function mouseout(d){
    d3.selectAll("path")
        .style("opacity", function(d){return d.depth == 0 ? 0 : 1;});
    d3.selectAll(".text")
        .style("display", "none");
}


function click(a, d) {
    drawTimeline(a);
    if(latestClicked){
        latestClicked.style.strokeWidth = "";
    }
    if(a.depth == 1){
        if(currentNode == a){
            a = a.parent;
            g.transition()
              .duration(750)
              .attr("transform", "translate(0,0)");
        }

        if(latestClicked){
            latestClicked.style.strokeWidth = "";
        }
    }

if(a.depth == 2) {
        if (currentNode == a) {
            a = a.parent;
            latestClicked.style.strokeWidth = "";
            g.transition()
              .duration(750)
              .attr("transform", "translate(0,0)");
        }
        else {
                map = d3.selectAll("g#countries").selectAll("path")
                .filter(function(e){return e.properties.name == a.data.name;});
                data = map.data()[0];
                if(data){
                  var xyz = get_xyz(data);
                  zoom(xyz);
                  latestClicked = document.getElementById(data.id);
                  latestClicked.style.strokeWidth = 1;
                  var xyz = get_xyz(data);
                  zoom(xyz);
                }

        }

    }
    if(a.depth == 3){
        map = d3.selectAll("g#countries").selectAll("path")
            .filter(function(e){return e.properties.name == a.parent.data.name;});
        data = map.data()[0];
        if(data){
        var xyz = get_xyz(data);
        zoom(xyz);
        latestClicked = document.getElementById(data.id);
        latestClicked.style.strokeWidth = 1;
        var xyz = get_xyz(data);
        zoom(xyz);
        }
    }
    svg.transition()
        .duration(750)
        .tween("scale", function(){
            var xd = d3.interpolate(x.domain(), [a.x0, a.x1]),
                yd = d3.interpolate(y.domain(), [0, 1]),
                yr = d3.interpolate(y.range(), [a.y0 ? 0 : 0, radius]);
            return function(t){
                x.domain(xd(t));
                y.domain(yd(t)).range(yr(t));
            };
        })
        .selectAll("path")
        .attrTween("d", function(d) { return function() { return arc(d); }; });

    currentNode = a;

}

function clickFromCountry(d){
  if(d){
    var a = d3.selectAll("path#" + d.properties.name.replace(/\s+/g, '')).data();
    if(a.length != 0){
    click(a[0], d);
  }
  } else {
    var a = d3.selectAll("path#Brazil").data();
    if(a.length != 0){
    click(a[0], d);
    }

  }
}



// Timeline variables
var regionDiv = document.getElementById("regionDiv");
var regionP = document.getElementById("regionP");

var countryDiv = document.getElementById("countryDiv");
var countryP = document.getElementById("countryP");

var cargoDiv = document.getElementById("cargoDiv");
var cargoP = document.getElementById("cargoP");

regionDiv.style.display = "none";
countryDiv.style.display = "none";
cargoDiv.style.display = "none";

var clickedLevel;

var temporaryObject;
var currentRegionInTimeline;
var currentCountryInTimeline;
var currentCargoInTimeline;

var brazilP = document.getElementById("brazilInfo");
brazilP.textContent = "Ship exports from Brazil in 2014 emitted 6,313,472 tons CO2.";

function drawTimeline(a) {
  var object = a;

  try {
    if (object.data.name == "Brazil") {
      clickedLevel = 9;
    }
  } catch (err) {
    // brazil was not pressed
  }

  if (object.parent != null) { // Has at least 1 parent
    // Clicked object is region
    clickedLevel = 0;
    if (object.parent.parent != null) { // Has at least 2 parents
      // No, clicked object is country
      clickedLevel = 1;
      if (object.parent.parent.parent != null) { // Has at least 3 parents
        // No, clicked object is cargo
        clickedLevel = 2;
      }
    }
  } else {
    // Region clicked
  }

  switch (clickedLevel) {
    case 9:
      // Display div
      regionDiv.style.display = "none";
      countryDiv.style.display = "none";
      cargoDiv.style.display = "none";
    g.transition()
    .duration(750)
    .attr("transform", "translate(0,0)");
    d3.select("rect#zoom").style("display", "block");
      break;
    case 0: // region
      // Is child showing? keep showing region
      if ( String(countryDiv.style.display) == "block" ) {
        regionDiv.style.display = "block";
        currentRegionInTimeline = object;
      }
      // Is regionDiv not showing? Start showing it.
      else if ( String(regionDiv.style.display) == "none" ) {
        regionDiv.style.display = "block";
        currentRegionInTimeline = object;
      }
      // Is regionDiv showing? Stop showing it, only if child is not showing
      else if ( String(regionDiv.style.display) == "block" && String(countryDiv.style.display) == "none" ) {
        regionDiv.style.display = "none";
        currentRegionInTimeline = "";
      }


      // Display div
      countryDiv.style.display = "none";
      cargoDiv.style.display = "none";
      // Content
      regionP.textContent = "Region: \n " +object.data.name;

      var regionC02ofBrazil = parseInt((object.value / object.parent.value) * 10000)/100;
      var rTot = formatNumber(parseInt(object.value));
      regionInfo.textContent = rTot + " tons CO2, " + regionC02ofBrazil + "% of Brazil's total shipping emissions.";
      break;
    case 1: // country

      // Is country clicked? if so, show country IF it is not the same one clicked again
      if (object.parent.parent.data.name == "Brazil" && currentCountryInTimeline != object) {
        countryDiv.style.display = "block";
        currentCountryInTimeline = object;
      }
      // Is the same country clicked twice? Dont display country
      else if (currentCountryInTimeline == object) {
        countryDiv.style.display = "none";
        currentCountryInTimeline = "";
      }

      // Is child showing? keep showing region
      else if ( String(cargoDiv.style.display) == "block" ) {
        countryDiv.style.display = "block";
        currentCountryInTimeline = object;
      }
      // Is countryDiv not showing? Start showing it.
      else if ( String(countryDiv.style.display) == "none" ) {
        countryDiv.style.display = "block";
        currentCountryInTimeline = object;
      }
      // Is countryDiv showing? Stop showing it, only if child is not showing and currentCountryInTimeline != ""
      else if ( String(countryDiv.style.display) == "block" && String(cargoDiv.style.display) == "none") {
        countryDiv.style.display = "none";
        currentCountryInTimeline = "";
      }


      currentRegionInTimeline = object.parent;

      // Display div
      regionDiv.style.display = "block";
      cargoDiv.style.display = "none";
      // Content
      regionP.textContent = "Region: \n " +object.parent.data.name;
      countryP.textContent = "Country: \n " +object.data.name;

      var regionC02ofBrazil = parseInt((object.parent.value / object.parent.parent.value) * 10000)/100;
      var rTot = formatNumber(parseInt(object.parent.value));
      regionInfo.textContent = rTot + " tons CO2, " + regionC02ofBrazil + "% of Brazil's total shipping emissions.";


      var countryC02ofBrazil = parseInt((object.value / object.parent.parent.value) * 10000)/100;
      var countryC02ofRegion = parseInt((object.value / object.parent.value) * 10000)/100;
      var cTot = formatNumber(parseInt(object.value));
      countryInfo.textContent = cTot + " tons CO2, " + countryC02ofRegion +"% of " +object.parent.data.name + "'s shipping import from Brazil.\n " + countryC02ofBrazil +"% of Brazil's total shipping emissions.";


      break;
    case 2: // cargo

      // Is cargoDiv not showing? Start showing it.
      if ( String(cargoDiv.style.display) == "none" ) {
        cargoDiv.style.display = "block";
        currentCargoInTimeline = object;
      }
      // Is cargoDiv showing? Stop showing it, only if child is not showing
      else if ( String(cargoDiv.style.display) == "block" ) {
        cargoDiv.style.display = "none";
        currentCargoInTimeline = "";
      }

      currentRegionInTimeline = object.parent.parent;
      currentCountryInTimeline = object.parent;


      // Display div
      regionDiv.style.display = "block";
      countryDiv.style.display = "block";
      // Content
      regionP.textContent = "Region: \n " +object.parent.parent.data.name;
      countryP.textContent = "Country: \n " +object.parent.data.name;

      var regionC02ofBrazil = parseInt((object.parent.parent.value / object.parent.parent.parent.value) * 10000)/100;
      var rTot = formatNumber(parseInt(object.parent.parent.value));
      regionInfo.textContent = rTot + " tons CO2, " + regionC02ofBrazil + "% of Brazil's total shipping emissions.";


      var countryC02ofBrazil = parseInt((object.parent.value / object.parent.parent.parent.value) * 10000)/100;
      var countryC02ofRegion = parseInt((object.parent.value / object.parent.parent.value) * 10000)/100;
      var cTot = formatNumber(parseInt(object.parent.value));
      countryInfo.textContent = cTot + " tons CO2, " + countryC02ofRegion +"% of " +object.parent.parent.data.name + "'s shipping import from Brazil.\n " + countryC02ofBrazil +"% of Brazil's total shipping emissions.";

      var cargoC02ofCountry = parseInt((object.value / object.parent.value) * 100);
      var cargoC02ofBrazil = parseInt((object.value / object.parent.parent.parent.value) * 100);
      cargoP.textContent =   "Cargo: \n " +object.data.name;
      var caTot = formatNumber(parseInt(object.value));
      cargoInfo.textContent = caTot + " tons CO2, " + cargoC02ofCountry +"% of " +object.parent.data.name + "'s shipping import from Brazil.\n " +cargoC02ofBrazil +"% of Brazil's total shipping emissions.";
      break;
  }
}
var brazilObject = d3.selectAll("path#Brazil").data()[0];

function brazilClickTest () {
  click(d3.selectAll("path#Brazil").data()[0]);
}
function regionClickTest () {
  click(currentRegionInTimeline);
}
function countryClickTest () {
  click(currentCountryInTimeline);
}
function cargoClickTest () {
  click(currentCargoInTimeline);
}







d3.select(self.frameElement).style("height", height + "px");
