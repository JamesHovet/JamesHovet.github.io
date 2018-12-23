var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

//Position and size constants
const DATE_Y_SHIFT = 30;
const NOTCH_HEIGHT = 15;
const EVENT_Y_POS = height * (7/8);
const BODY_Y_POS = height * (1/8);
const DOT_RADIUS = 5;
const SELECTED_DOT_RADIUS = 7;
const FOCUS_ZOOM = 3;
const FOCUS_TIME = 1000; //in ms
const PARALLAX_FACTOR = 0.05;
const YEAR_RANGE = [1880,2030];
const POPUP_WIDTH = 400;
const POPUP_HEIGHT = 200;

// Data Variables //////////////////////////////////////////////////////////////////////////////////
var currentData = {"year":0}
var currentTarget;

// SETUP ///////////////////////////////////////////////////////////////////////////////////////////
var offClickTarget = svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0)
    .on("click", offClickHandler)
    .attr("fill", "white")

var background = svg.append("g")
    .attr("id", "background")

d3.xml("background.svg").then((document) => {
    background.node().appendChild(document.getElementsByTagName('svg')[0].getElementById('overallRoot'))
    d3.select("#overallRoot")
        .attr("transform", "translate(-500, 0)")
})

var root = svg.append("g")
    .attr("id", "root")

var timescale = d3.scaleLinear()
    .range([0, width])
    .domain(YEAR_RANGE)


// POP UP //////////////////////////////////////////////////////////////////////////////////////////
var popupG = d3.select("svg")
    .append("g")
    .attr("id", "popupG")

var popup = popupG
    .append("foreignObject")
    .attr("x",-POPUP_WIDTH/2)
    .attr("y",0)
    .attr("width",POPUP_WIDTH)
    .attr("height",POPUP_HEIGHT)
    .attr("class","node")
    .attr("id", "popup")


// CONTENT /////////////////////////////////////////////////////////////////////////////////////////
var yearIncrements = getIncrements(YEAR_RANGE);

var timeline = root.append("g")
    .attr("id", "timeline")

var timelineParents = timeline.selectAll("g")
    .data(yearIncrements)
    .enter()
        .append("g")
        .attr("transform", (d) => {return "translate(" + timescale(d) + "," + EVENT_Y_POS + ")";})

var timelineNotches = timelineParents
    .append("line")
    .attr("x1", 0).attr("y1", -NOTCH_HEIGHT/2)
    .attr("x2", 0).attr("y2", NOTCH_HEIGHT/2)
    .classed("timelineNotches", true)

var timelineDates = timelineParents
    .append("text")
    .text((d) => {return d;})
    .attr("transform", "translate(0," + DATE_Y_SHIFT + ")")
    .attr("text-anchor", "middle")
    .classed("timelineDates", true)

var events = root.append("g")
    .attr("id", "events")

var eventParents = events.selectAll("g")
    .data(dataJson)
    .enter()
        .append("g")
        .attr("transform", (d) => {return "translate(" + timescale(d.year) + ", " + EVENT_Y_POS + ")";})

var circles = eventParents
    .append("circle")
    .attr("r", DOT_RADIUS)
    .classed("eventDot", true)
    .on("click", eventClickHandler)

var debugText = eventParents
    .append("text")
    .text((d) => {return Math.round(timescale(d.year))})
    .classed("debugText", true)


// ZOOM ////////////////////////////////////////////////////////////////////////////////////////////
var zoom = d3.zoom()
    .scaleExtent([7/8, 4])
    .translateExtent([[0-100,0],[width + 100,0]])
    .on("zoom", zoomed)

svg.call(zoom);

function zoomed() {
    var transform = d3.event.transform;
    var k = transform.k;
    var cy = 500;
    eventParents.attr("transform", function(d) {
        return "translate(" + transform.applyX(timescale(d.year)) + ", " + EVENT_Y_POS + ")";
    });
    timelineParents.attr("transform", function(d) {
        return "translate(" + transform.applyX(timescale(d)) + ", " + EVENT_Y_POS + ")";
    })
    // background.attr("transform", "translate(" + transform.x + ",0) scale(" + transform.k + ")")
    background.attr("transform", "matrix(" + k + ",0,0," + k + "," + (transform.x * (1 + PARALLAX_FACTOR)) + "," +  (cy - (k*cy)) + ")");

    popupG
        .attr("transform", "translate(" + transform.applyX(timescale(currentData.year)) + "," + BODY_Y_POS + ")");

}

// HANDLERS ////////////////////////////////////////////////////////////////////////////////////////
function eventClickHandler(){
    if(currentTarget != null){
        offClickHandler()
    }

    var transform = d3.zoomTransform(svg);
    currentTarget = d3.event.target;
    currentData = d3.event.target.__data__;

    focus(timescale(currentData.year), FOCUS_ZOOM, FOCUS_TIME);
    popup
        .style("opacity", 1)
        .html(currentData.body)
    popupG
        .attr("transform", "translate(" + transform.applyX(timescale(currentData.year)) + "," + BODY_Y_POS + ")");

    currentTarget.setAttribute("class", "selectedEvent");
    currentTarget.setAttribute("r", SELECTED_DOT_RADIUS);
}

function offClickHandler(){
    popup
        .style("opacity", 0);
    currentTarget.setAttribute("class", "eventDot");
    currentTarget.setAttribute("r", DOT_RADIUS)
}

// ACTIONS /////////////////////////////////////////////////////////////////////////////////////////
function resetZoom(){
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
}

function smoothTranslateTo(x,y, time){
    svg.transition().duration(time).call(zoom.translateTo, x, y);
}

function focus(x,k,time){
    var zoomTo = d3.zoomIdentity
        .translate(width/2 - (x*k),0)
        .scale(k)

    svg.transition().duration(time).call(zoom.transform, zoomTo);
}

// HELPERS /////////////////////////////////////////////////////////////////////////////////////////
function getIncrements(range) {
    var lower = range[0];
    var upper = range[1];
    var increments = (upper - lower)/10
    return [...Array(increments).keys()].map((d) => {return lower + d * 10;})
}
