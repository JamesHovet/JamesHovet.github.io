//Position and size constants
const DATE_Y_SHIFT = 25;
const NOTCH_HEIGHT = 15;
const SIMULATION_TICKS = 40;
const SIMULATION_DOT_RADIUS = 3;
const FOCUS_ZOOM = 2;
const FOCUS_TIME = 1000; //in ms
const PARALLAX_FACTOR = 0.05;
const YEAR_RANGE = [1880,2030];
const PADDING = 50;
const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 400;
const EVENT_Y_POS_FACTOR = 15/16;
const BODY_Y_POS_FACTOR = 1/16;
const BACKGROUND_SVG_WIDTH = 2100;
const BACKGROUND_SVG_HEIGHT = 500;

const HORIZON_LINE = (14/16);
const SKY_COLOR = "#BADDF8";
const GRASS_COLOR = "#A3C57E";

const ARROW_OPACITY = 0.8;

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT07Dq-7PcVOBl4x_lc6G7_wNK6sUgFIiQYZ082JTpRi1kTcJzspmwqVvXRiHEOJioDXl_igTos9LiS/pub?gid=0&single=true&output=csv"

var dataJson = []

var DOT_RADIUS = 5;
var SELECTED_DOT_RADIUS = 7;
var DOT_CLICK_RADIUS = 9;

var IS_MOBILE = false;
var IS_IFRAME = false;
var IS_PORTRAIT = false;
var IS_ACTIVE = true;

var PORTRAIT_POPUP_RATIO = 0.85;

// SIZING //////////////////////////////////////////////////////////////////////////////////////////

var svg = d3.select("svg")

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    IS_MOBILE = true;
}

if(window.frameElement != null){ // We are in an iframe
    IS_IFRAME = true;

    if(!IS_MOBILE){ // Desktop
        svg.attr("width", window.frameElement.offsetWidth);
        svg.attr("height", window.frameElement.offsetHeight);

        console.log("frame")
        console.log(window.frameElement)

        window.onresize = function(e){
            console.log('resize from inside');
            console.log(e);
            console.log(window.frameElement.offsetWidth);
            desktopResize(window.frameElement.offsetWidth, window.frameElement.offsetHeight);
        }
    } else { // Mobile

        if(window.orientation == 0 || window.orientation == 180){ // portrait
            window.frameElement.height = 600;
            window.frameElement.width = window.frameElement.offsetWidth;

            IS_PORTRAIT = true;

        } else { // landscape
            window.frameElement.width = window.frameElement.offsetWidth;
            window.frameElement.height = window.frameElement.offsetWidth * screen.width/screen.height;

            IS_PORTRAIT = false;
        }

        svg.attr("width", window.frameElement.offsetWidth);
        svg.attr("height", window.frameElement.offsetHeight);

        window.addEventListener("orientationchange", function(){
            if(window.orientation == 0 || window.orientation == 180){ // portrait
                IS_PORTRAIT = true;
                window.frameElement.width = "100%"
                setTimeout(function () {

                    window.frameElement.height = 600;

                    svg.attr("width", window.frameElement.width);
                    svg.attr("height", window.frameElement.height);

                    mobileResize(window.frameElement.offsetWidth, window.frameElement.offsetHeight);
                    unfocus();
                    resetZoom();
                }, 500);


            } else { // landscape
                IS_PORTRAIT = false;
                window.frameElement.width = "100%"
                setTimeout(function () {
                    window.frameElement.height = window.frameElement.offsetWidth * screen.width/screen.height;

                    svg.attr("width", window.frameElement.width);
                    svg.attr("height", window.frameElement.height);

                    mobileResize(window.frameElement.offsetWidth, window.frameElement.offsetHeight);
                    unfocus();
                    resetZoom();
                }, 500);
            }
        })
    }
}

var width = +svg.attr("width");
var height = +svg.attr("height");

var priorWidth = width;

var EVENT_Y_POS = height * EVENT_Y_POS_FACTOR;
var BODY_Y_POS = height * BODY_Y_POS_FACTOR;

// DATA VARIABLES //////////////////////////////////////////////////////////////////////////////////
var currentData = dataJson[0]
var currentIndex = 0;
var isFocused = false;

// SETUP ///////////////////////////////////////////////////////////////////////////////////////////
d3.select("body").on("keydown", keyHandler)

var background_sky = svg.append("g")

var grass = background_sky
    .append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", GRASS_COLOR)

var sky = background_sky
    .append("rect")
    .attr("width", "100%")
    .attr("height", (100 * HORIZON_LINE) + "%")
    .attr("fill", SKY_COLOR)
    .on("click", offClickHandler)

var background = svg.append("g")
    .attr("id", "background")
    .on("click", offClickHandler)

d3.xml("background_color.svg").then((loaded) => {
    background.node().appendChild(loaded.getElementsByTagName('svg')[0].getElementById('overallRoot'))

    var k = width/BACKGROUND_SVG_WIDTH;
    var cy =  height * HORIZON_LINE - BACKGROUND_SVG_HEIGHT * k;
    var dx = -width/3;

    d3.select("#overallRoot")
        .attr("transform", "matrix(" + k + ",0,0," + k + "," + dx + "," +  (cy) + ")");

})

// POP UP //////////////////////////////////////////////////////////////////////////////////////////
var popupG = d3.select("svg")
    .append("g")
    .attr("id", "popupG")

var popup = popupG
    .append("foreignObject")
    .attr("x",() => {
        if(!IS_PORTRAIT){
            return -POPUP_WIDTH/2
        } else {
            return -(width * PORTRAIT_POPUP_RATIO)/2
        }
    })
    .attr("y",0)
    .attr("width",() => {
        if(!IS_PORTRAIT){
            return POPUP_WIDTH;
        } else {
            return (width * PORTRAIT_POPUP_RATIO);
        }
    })
    .attr("height",POPUP_HEIGHT)
    .attr("class","node")
    .attr("id", "popup")

// SETUP TIMELINE ROOT /////////////////////////////////////////////////////////////////////////////

var root = svg.append("g")
    .attr("id", "root")

var timescale = d3.scaleLinear()
    .range([PADDING, width-PADDING])
    .domain(YEAR_RANGE)

// EVENTS AND DATA FETCH ///////////////////////////////////////////////////////////////////////////

var sim = d3.forceSimulation([])

var events = root.append("g")
    .attr("id", "events")

var eventsG = events.selectAll("g")

var eventParents
var circleClickTargets;
var circles;
var debugText;

d3.csv(CSV_URL, function(d, i){
    return {
        index: i,
        year : +d.year,
        body : d.body,
        img : d.img,
        x : timescale(d.year) + 0.01 * i, // cheat: add a little bit of a push to the initial starting positions of all the nodes so that order is maintained after the simulation
        y : EVENT_Y_POS,
        fy : EVENT_Y_POS
    };
}).then(function(data) {

    dataJson = data;
    currentData = data[0]
    currentIndex = 0;
    sFocused = false;

    sim.nodes(data)
        .force("x", d3.forceX(function(d) { return timescale(d.year); }).strength(0.1))
        .force("collision", d3.forceCollide(SIMULATION_DOT_RADIUS).strength(2))
        .stop()

    for (var i = 0; i < SIMULATION_TICKS; i++) {sim.tick();}

    eventParents = eventsG
        .data(sim.nodes())
        .enter()
            .append("g")
            .attr("transform", (d) => {return "translate(" + d.x + ", " + EVENT_Y_POS + ")";})

    circleClickTargets = eventParents
        .append("circle")
            .attr("r", DOT_CLICK_RADIUS)
            .classed("circleClickTarget", true)
            .on("click", eventClickHandler)

    circles = eventParents
        .append("circle")
            .attr("r", DOT_RADIUS)
            .classed("eventDot", true)
            .on("click", eventClickHandler)

    debugText = eventParents
        .append("text")
        .text((d) => {return Math.round(timescale(d.year))})
        .classed("debugText", true)

});

// INCREMENTS //////////////////////////////////////////////////////////////////////////////////////
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

// ZOOM ////////////////////////////////////////////////////////////////////////////////////////////
var zoom = d3.zoom()
    .scaleExtent([7/8, 4])
    .translateExtent([[0-100,0],[width + 100,0]])
    .on("zoom", zoomed)

svg.call(zoom);

function zoomed() {

    if(IS_ACTIVE){
        var transform = d3.event.transform;
        var k = transform.k;
        var cy = height * HORIZON_LINE;

        eventParents.attr("transform", function(d) {
            return "translate(" + transform.applyX(d.x) + ", " + EVENT_Y_POS + ")";
        });
        timelineParents.attr("transform", function(d) {
            return "translate(" + transform.applyX(timescale(d)) + ", " + EVENT_Y_POS + ")";
        })

        background.attr("transform", "matrix(" + k + ",0,0," + k + "," + (transform.x * (1 + PARALLAX_FACTOR)) + "," +  (cy - (k*cy)) + ")");

        popupG
            .attr("transform", "translate(" + transform.applyX(timescale(currentData.year)) + "," + BODY_Y_POS + ")");
    }

}

// HANDLERS ////////////////////////////////////////////////////////////////////////////////////////
function eventClickHandler(){
    unfocus();

    currentData = d3.event.target.__data__;
    currentIndex = currentData["index"];

    focusOnIndex(currentIndex);
}

function offClickHandler(){
    unfocus()
}

function keyHandler(){
    var keyCode = d3.event.keyCode;

    if(isFocused){
        if(keyCode == 37){ //LEFT ARROW
            leftArrowHandler();
        } else if (keyCode == 39) { //RIGHT ARROW
            rightArrowHandler();
        }
    }

}

function leftArrowHandler(){
    if(currentIndex > 0){
        focusOnIndex(currentIndex -1);
    }
}

function rightArrowHandler(){
    if(currentIndex < dataJson.length - 1){
        focusOnIndex(currentIndex  + 1);
    }
}


// ACTIONS /////////////////////////////////////////////////////////////////////////////////////////
function focusOnIndex(index){
    unfocus()
    isFocused = true;

    currentData = dataJson[index];
    currentIndex = index;

    var transform = d3.zoomTransform(svg);
    focusZoom(timescale(currentData.year), FOCUS_ZOOM, FOCUS_TIME);

    popup
        .style("opacity", 1)
        .html(formatHTML(currentData));
    popupG
        .attr("transform", "translate(" + transform.applyX(timescale(currentData.year)) + "," + BODY_Y_POS + ")");

    var selectedEvent = selectAtIndex(circles, index);
    selectedEvent.classed("selectedEvent", true);
    selectedEvent.attr("r", SELECTED_DOT_RADIUS)

}

function unfocus(){
    isFocused = false;

    circles.classed("selectedEvent", false);
    circles.classed("eventDot", true);
    circles.attr("r", DOT_RADIUS);

    popup.style("opacity", 0);
}

function resetZoom(){
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
}

function smoothTranslateTo(x,y, time){
    svg.transition().duration(time).call(zoom.translateTo, x, y);
}

function focusZoom(x,k,time){
    var zoomTo = d3.zoomIdentity
        .translate(width/2 - (x*k),0)
        .scale(k)

    svg.transition().duration(time).call(zoom.transform, zoomTo);
}

// HELPERS /////////////////////////////////////////////////////////////////////////////////////////
function getIncrements(range) {
    var lower = range[0];
    var upper = range[1];
    var increments = (upper - lower)/10 + 1;
    return [...Array(increments).keys()].map((d) => {return lower + d * 10;})
}

function selectAtIndex(selection, index){
    return selection.filter(function (d, i) {
        return i == index
    })
}

function formatHTML(data){
    out = data.body
    if(data.hasOwnProperty("img")){
        out = "<table><td class='popupText'><div>" + data.body + "</div></td><td class='popupImg'><img src='" + data.img + "'/></td></table>"
    }

    arrows = "  <svg viewBox='0 0 32 32' width='30' height='30' onclick='leftArrowHandler()' class='arrow'><polygon  fill-opacity='" + ARROW_OPACITY + "' scale='.5' points='32,0 23.349,16 32,32 0,16 '/></svg>  <svg viewBox='0 0 32 32' width='30' height='30' onclick='rightArrowHandler()' class='arrow'><polygon fill-opacity='" + ARROW_OPACITY + "' points='0,32 8.651,16 0,0 32,16 '/></svg>"


    out = "<div class='popupDiv' id='popupDiv'>" + "<h1 class='year'>" + data.year + arrows + "</h1>" + out + "<br>" + "</div>"

    return out;
}

function desktopResize(new_width, new_height){

    svg.attr("width", new_width)

    // offClickTarget.attr("width", new_width);

    var k = width/BACKGROUND_SVG_WIDTH;
    var cy =  height * HORIZON_LINE - BACKGROUND_SVG_HEIGHT * k;
    var dx = -width/3;

    d3.select("#overallRoot")
        .attr("transform", "matrix(" + k + ",0,0," + k + "," + dx + "," +  (cy) + ")");

    timescale.range([PADDING, new_width-PADDING]);

    if (Math.abs(new_width - priorWidth) > 50){
        priorWidth = new_width
        sim.nodes().forEach((d) => {
            d.x = timescale(d.year);
        });
        sim.force("x", d3.forceX(function(d) { return timescale(d.year); }).strength(0.1))
        for (var i = 0; i < SIMULATION_TICKS; i++) {sim.tick();}
    }

    zoom.translateExtent([[0-100,0],[new_width + 100,0]]);

    width = new_width;

    //TODO: Force change in window or something to make these changes apply without having to
    //move the view box
}

function mobileResize(new_width, new_height){


    width = new_width;
    height = new_height;

    //Background
    var k = width/BACKGROUND_SVG_WIDTH;
    var cy =  height * HORIZON_LINE - BACKGROUND_SVG_HEIGHT * k;
    var dx = -width/3;

    d3.select("#overallRoot")
        .attr("transform", "matrix(" + k + ",0,0," + k + "," + dx + "," +  (cy) + ")");

    //Popup
    BODY_Y_POS = height * (1/8);
    popup.attr("x",() => {
        if(!IS_PORTRAIT){
            return -POPUP_WIDTH/2
        } else {
            return -(width * PORTRAIT_POPUP_RATIO)/2
        }
    })
    .attr("width",() => {
        if(!IS_PORTRAIT){
            return POPUP_WIDTH;
        } else {
            return (width * PORTRAIT_POPUP_RATIO);
        }
    })

    //timeline nodes
    EVENT_Y_POS = height * (15/16);

    timescale.range([PADDING, new_width-PADDING]);

    sim.nodes().forEach((d) => {
        d.x = timescale(d.year);
        d.y = EVENT_Y_POS;
    });
    sim.force("x", d3.forceX(function(d) { return timescale(d.year); }).strength(0.1))
    for (var i = 0; i < SIMULATION_TICKS; i++) {sim.tick();}

    zoom.translateExtent([[0-100,0],[new_width + 100,0]]);

}

// TODO: Responsive timeline increments
// TODO: Vertical and/or better pictures on mobile
// TODO: Introduction/'click here to start' (with text that says 'rotate your phone into lanscape for the best experience')
