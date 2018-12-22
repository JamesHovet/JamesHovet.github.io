var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var dateShift = 30

var yearRange = [1880,2030]

var eventYPos = height * (7/8);

var background = svg.append("g")
    .attr("id", "background")
    .attr("transform-origin", "bottom left")

d3.xml("background.svg").then((document) => {
    background.node().appendChild(document.getElementsByTagName('svg')[0].getElementById('overallRoot'))
    d3.select("#overallRoot")
        .attr("transform", "translate(-500, 0)")
})

var root = svg.append("g")
    .attr("id", "root")

var timescale = d3.scaleLinear()
    .range([0, width])
    .domain(yearRange)

// CONTENT
var events = root.append("g")
    .attr("id", "events")

var eventParents = events.selectAll("g")
    .data(dataJson)
    .enter()
        .append("g")
        .attr("transform", (d) => {return "translate(" + timescale(d.year) + ", " + eventYPos + ")";})

var circles = eventParents
    .append("circle")
    .attr("r", 4)
    .classed("eventDot", true)
    .on("click", eventClickHandler)

var debugText = eventParents
    .append("text")
    .text((d) => {return Math.round(timescale(d.year))})
    .classed("debugText", true)


var yearIncrements = getIncrements(yearRange);

var timeline = root.append("g")
    .attr("id", "timeline")

var timelineParents = timeline.selectAll("g")
    .data(yearIncrements)
    .enter()
        .append("g")
        .attr("transform", (d) => {return "translate(" + timescale(d) + "," + eventYPos + ")";})

var timelineDates = timelineParents
    .append("text")
    .text((d) => {return d;})
    .attr("transform", "translate(0," + dateShift + ")")
    .classed("timelineDates")

// ZOOM
var zoom = d3.zoom()
    .scaleExtent([7/8, 4])
    .translateExtent([[0-100,0],[width + 100,0]])
    .on("zoom", zoomed)

svg.call(zoom);

function zoomed() {
    var transform = d3.event.transform;
    eventParents.attr("transform", function(d) {
        return "translate(" + transform.applyX(timescale(d.year)) + ", " + eventYPos + ")";
    });
    timelineParents.attr("transform", function(d) {
        return "translate(" + transform.applyX(timescale(d)) + ", " + eventYPos + ")";
    })
    background.attr("transform", "translate(" + transform.x + ",0) scale(" + transform.k + ")")
}

function eventClickHandler(){
    console.log(d3.event.target.__data__)
}

//Actions

function resetZoom(){
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
}

function translateTo(x,y){
    zoom.translateTo(svg, x,y);
}

function smoothTranslateTo(x,y, time){
    svg.transition().duration(time).call(zoom.translateTo, x, y);
}

//Helpers
function getIncrements(range) {
    var lower = range[0];
    var upper = range[1];
    var increments = (upper - lower)/10
    return [...Array(increments).keys()].map((d) => {return lower + d * 10;})
}
