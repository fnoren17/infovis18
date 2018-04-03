var width = 600,
height = 600,
radius = (Math.min(width, height) / 2) - 10;

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
        .styles({"display": "block","top": event.pageY - yoff + 10 + "px", "left": event.pageX -xoff - 20 + "px"})
        .html(d.data.name + "\n" + formatNumber(d.value) + " ton CO2");
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
                  latestClicked = document.getElementById(data.id);
                  latestClicked.style.strokeWidth = 1;
                }

        }

    }
    if(a.depth == 3){
        map = d3.selectAll("g#countries").selectAll("path")
            .filter(function(e){return e.properties.name == a.parent.data.name;});
        data = map.data()[0];
        if(data){
        latestClicked = document.getElementById(data.id);
        latestClicked.style.strokeWidth = 1;
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
    var a = d3.selectAll("path#" + d.properties.name.replace(/\s+/g, '')).data();
    if(a.length != 0){
    click(a[0], d);
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
brazilP.textContent = "Ship exports in 2014 from Brazil emitted 6,313,472 ton of C02.";

function drawTimeline(a) {
  var object = a;
  // console.log("object in dratimeline header");
  // console.log(object);


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
      // console.log("Brazil level");
      // Display div
      regionDiv.style.display = "none";
      countryDiv.style.display = "none";
      cargoDiv.style.display = "none";
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
      regionInfo.textContent = regionC02ofBrazil +"% of Brazil's total ship export CO2 emission.";
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

      // console.log("is object a country?");
      // console.log(object.data.name);
      // console.log(object.parent.parent.data.name);
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
      regionInfo.textContent = regionC02ofBrazil +"% of Brazil's total ship export CO2 emission.";


      var countryC02ofBrazil = parseInt((object.value / object.parent.parent.value) * 10000)/100;
      var countryC02ofRegion = parseInt((object.value / object.parent.value) * 10000)/100;
      countryInfo.textContent = countryC02ofRegion +"% of " +object.parent.data.name + "'s brazilian ship import C02 emission.\n " + +countryC02ofBrazil +"% of Brazil's total ship export CO2 emission.";


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
      regionInfo.textContent = regionC02ofBrazil +"% of Brazil's total ship export CO2 emission.";


      var countryC02ofBrazil = parseInt((object.parent.value / object.parent.parent.parent.value) * 10000)/100;
      var countryC02ofRegion = parseInt((object.parent.value / object.parent.parent.value) * 10000)/100;
      countryInfo.textContent = countryC02ofRegion +"% of " +object.parent.parent.data.name + "'s brazilian ship import C02 emission.\n " + +countryC02ofBrazil +"% of Brazil's total ship export CO2 emission.";

      var cargoC02ofCountry = parseInt((object.value / object.parent.value) * 100);
      var cargoC02ofBrazil = parseInt((object.value / object.parent.parent.parent.value) * 100);
      cargoP.textContent =   "Cargo: \n " +object.data.name;
      cargoInfo.textContent = cargoC02ofCountry +"% of " +object.parent.data.name + "'s brazilian ship import CO2 emission.\n " +cargoC02ofBrazil +"% of Brazil's total ship export CO2 emission.";
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
