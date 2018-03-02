var width = 700,
height = 700,
radius = (Math.min(width, height) / 2) - 10;

var formatNumber = d3.format(",d");
var currentNode;
var latestClicked;

var x = d3.scaleLinear()
    .range([0, 2 * Math.PI]); //Längd av arcs?

var y = d3.scaleSqrt()
    .range([0, radius]); //Ändring av siffran i range här skapar ett vitt utrymme i mitten av sunbursten

var color_scheme = [{continent: "Latin America and the Caribbean", color: {colorR: 238, colorG: 99, colorB: 99}}, 
{continent: "Southern Asia", color:{colorR: 238, colorG: 158, colorB: 99}}, 
{continent: "South-eastern Asia", color:{colorR: 238, colorG: 220, colorB: 99}}, 
{continent: "Western Europe", color:{colorR: 204, colorG: 238, colorB: 99}}, 
{continent: "Eastern Asia", color:{colorR: 99, colorG: 238, colorB: 99}}, 
{continent: "Southern Europe", color:{colorR: 99, colorG: 238, colorB: 171}}, 
{continent: "Northern Europe", color:{colorR: 99, colorG: 238, colorB: 210}}, 
{continent: "Northern America", color:{colorR: 99, colorG: 187, colorB: 238}}, 
{continent: "Northern Africa", color:{colorR: 102, colorG: 99, colorB: 238}}, 
{continent: "Sub-Saharan Africa", color:{colorR: 148, colorG: 99, colorB: 238}}, 
{continent: "Eastern Europe", color:{colorR: 207, colorG: 99, colorB: 238}}, 
{continent: "Western Asia", color:{colorR: 238, colorG: 99, colorB: 187}}];

function color(object) {
        
    if (object.depth == 0) {
        object.data.color = {colorR: 0, colorG: 0, colorB: 0};
    }
    else if (object.depth == 1) { 
        var parent = object.parent;
        var numbChildren = object.children.length;
        for (i=0; i < color_scheme.length; i++) {
            if (color_scheme[i].continent == object.data.name) {
                object.data.color = color_scheme[i].color;
            }
        }
    }
    else {
        var scalar;
        var arr = object.parent.children;
        for (var i = 0, len = arr.length; i < len; i++) {
            if(arr[i].data.name == object.data.name){
                var scalar = ((i+1)*5*object.depth);
            }
        }
        var parentColor = object.parent.data.color;
        var numbChildren = object.parent.children.length;
        var rDiff = parseInt((parentColor.colorR/numbChildren)/2 + scalar);
        var gDiff = parseInt((parentColor.colorG/numbChildren)/2 + scalar);
        var bDiff = parseInt((parentColor.colorB/numbChildren)/2 + scalar);
        object.data.color = {colorR: parentColor.colorR - rDiff, colorG: parentColor.colorG - gDiff, colorB: parentColor.colorB - bDiff};
        //d.colorR < 0 ? d.colorR=0 : d.colorR
    }
}

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

    d3.selectAll("body")
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
        .style("fill", function(d) { color(d); return "rgb("+d.data.color.colorR+","+d.data.color.colorG+","+d.data.color.colorB+")"})
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

function mousemove(d){
    d3.selectAll(".text")
        .styles({"display": "block","top": event.clientY + 10 + "px", "left": event.clientX + 10 + "px"})
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
}

d3.select(self.frameElement).style("height", height + "px");