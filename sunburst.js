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

d3.json("data.json", function(error, root) {
    if (error) throw error;

    root = d3.hierarchy(root); //Root är mittencirkeln!
    root.sum(function(d) { return d.size; });

    // Append tooltip to container
    d3.selectAll(".container")
        .append("div")
        .attr("class", "text")
        .attr("width", 200)
        .attr("height", 200)
        .style("opacity", 1);

   svg.selectAll("path")
        .data(partition(root).descendants())
        .enter().append("path")
        .attr("class", "sunburst")
        .attr("display", function(d){return d.depth ? null : "none"})
        .attr("d", arc)
        .attr("id", function(d){return d.data.name.replace(/\s+/g, '');})
        .style("fill", function(d) { return "rgb("+d.data.color.colorR+","+d.data.color.colorG+","+d.data.color.colorB+")"})
        .attr("opacity", function(d){return d.depth == 0 ? 0 : 1})
        .on("click", click)
        .on("mouseover",mouseover)
        .on("mousemove",mousemove)
        .on("mouseout", mouseout);
});


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
    yoff = $('.container').offset().top
    d3.selectAll(".text")
        .styles({"display": "block","top": event.pageY - yoff + 10 + "px", "left": event.pageX + 10 + "px"})
        .html(d.data.name + "\n" + formatNumber(d.value));
        //.attr("style", "left:" + event.clientX + "px")
}

function mouseout(d){
    d3.selectAll("path")
        .style("opacity", function(d){return d.depth == 0 ? 0 : 1});
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
        }

        if(latestClicked){
            latestClicked.style.strokeWidth = ""
        }
    }

if(a.depth == 2) {
        if (currentNode == a) {
            a = a.parent
            latestClicked.style.strokeWidth = ""
        }
        else {
                map = d3.selectAll("g#countries").selectAll("path")
                .filter(function(e){return e.properties.name == a.data.name});
                data = map.data()[0];
                if(data){
                latestClicked = document.getElementById(data.id)
                latestClicked.style.strokeWidth = 1
                }
        }

    }
    if(a.depth == 3){
        map = d3.selectAll("g#countries").selectAll("path")
            .filter(function(e){return e.properties.name == a.parent.data.name});
        data = map.data()[0];
        if(data){
        latestClicked = document.getElementById(data.id)
        latestClicked.style.strokeWidth = 1
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
    drawTimeline(a);
}

// Timeline variables
var regionDiv = document.getElementById("regionDiv");
var regionP = document.getElementById("regionP");

var countryDiv = document.getElementById("countryDiv");
var countryP = document.getElementById("countryP");

var cargoDiv = document.getElementById("cargoDiv");
var cargoP = document.getElementById("cargoP");

var clickedLevel;

function drawTimeline(object) {

  //console.log(object);

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
      break;
    case 0: // region
      // Display div
      regionDiv.style.display = "block";
      countryDiv.style.display = "none";
      cargoDiv.style.display = "none";
      // Content
      regionP.textContent = object.data.name;
      break;
    case 1: // country
      // Display div
      regionDiv.style.display = "block";
      countryDiv.style.display = "block";
      cargoDiv.style.display = "none";
      // Content
      regionP.textContent = object.parent.data.name;
      countryP.textContent = object.data.name;
      break;
    case 2: // cargo
      // Display div
      regionDiv.style.display = "block";
      countryDiv.style.display = "block";
      cargoDiv.style.display = "block";
      // Content
      regionP.textContent = object.parent.parent.data.name;
      countryP.textContent = object.parent.data.name;
      cargoP.textContent =   object.data.name;
      cargoInfo.textContent = "CO2 usage: " + object.data.size +" kg (?)";
      break;
  }
}


d3.select(self.frameElement).style("height", height + "px");
