var width = 700,
    height = 700,
    radius = (Math.min(width, height) / 2) - 10;

var formatNumber = d3.format(",d");

var x = d3.scaleLinear()
    .range([0, 2 * Math.PI]); //Längd av arcs?

var y = d3.scaleSqrt()
    .range([0, radius]); //Ändring av siffran i range här skapar ett vitt utrymme i mitten av sunbursten

var color = d3.scaleOrdinal(d3.schemeCategory20);

var partition = d3.partition();
    
var arc = d3.arc() //Varje interation av d här är ett "block" i sunbursten. Så första är den blåa cirkeln, men alla dess children som egenskaper i objektet. Nästa är den ljusblåa "analytics", med alla dess children, osv. 
    .startAngle(function(d) {return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });


var svg = d3.select("#sunburst").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

d3.json("dummyData.json", function(error, root) {
  if (error) throw error;
  
  root = d3.hierarchy(root); //Root är mittencirkeln!
  root.sum(function(d) { return d.size; });
    
  svg.selectAll("path")
      .data(partition(root).descendants())
      .enter().append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color((d.children ? d : d.parent).data.name); })
        .style("opacity", function(d) { 
        if (d.data.name == "Brazil") {
            console.log("Hejsan")
            return 0
        }
        else {
            return 1 }
            })
      .on("click", click)
    .append("title")
      .text(function(d) { return d.data.name + "\n" + formatNumber(d.value); });
});

function click(d) {
  svg.transition()
      .duration(750)
      .tween("scale", function() {
        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(y.domain(), [d.y0, 1]),
            yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
      })
    .selectAll("path")
      .attrTween("d", function(d) { return function() { return arc(d); }; });
}

d3.select(self.frameElement).style("height", height + "px");