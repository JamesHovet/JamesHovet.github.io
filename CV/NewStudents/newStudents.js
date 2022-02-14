var width = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth

width = width < 1000 ? width : 1000

var heightGlobe = width * (600/960)

var heights = {
    startingState : 0,
    get startingState() { return 0},//height globe
    internationalCluster : 0,
    get internationalCluster() {return this.startingState + heightGlobe},//height 400
    ordinalCountry : 0,
    get ordinalCountry() {return this.internationalCluster + 400}, //height map
    unitedStatesMap : 0,
    get unitedStatesMap() {return this.ordinalCountry + 400},//height globe
    ordinalStateCluster : 0,
    get ordinalStateCluster() {return this.unitedStatesMap + heightGlobe}, // height 400
    genderCluster : 0,
    get genderCluster() {return this.ordinalStateCluster + 400}, //height 600
    schoolTypeCluster : 0,
    get schoolTypeCluster() {return this.genderCluster + 600}, //height 400
    ordinalRepresentation : 0,
    get ordinalRepresentation() {return this.schoolTypeCluster + 400}, //height 400
    ordinalDayStudents : 0,
    get ordinalDayStudents() {return this.ordinalRepresentation + 400},
}

var height = heights.ordinalDayStudents + 1500 //long enough for the top of the screen on mobile to hit the last trigger point

var svg;
var projectionGlobal;
var pathGlobal;
var projectionDomestic;
var pathDomestic;

drawMaps()

//draw text
var padding = 50

aside1 = positionAside("#aside1", heights.internationalCluster + 50)
aside1point5 = positionAside("#aside1point5", heights.ordinalCountry)
aside2 = positionAside("#aside2", heights.unitedStatesMap - 50)
aside3 = positionAside("#aside3", heights.ordinalStateCluster)
aside4 = positionAside("#aside4", heights.genderCluster)
aside5 = positionAside("#aside5", heights.schoolTypeCluster)
aside6 = positionAside("#aside6", heights.ordinalRepresentation)
aside7 = positionAside("#aside7", heights.ordinalDayStudents)

//international axis
var ordinalInternationalScale = d3.scaleOrdinal()
    .domain([false,true])
    .range([getX(0,2),getX(1,2)])

var internationalXAxis = drawAxis(
    ordinalInternationalScale,
    Number(heightGlobe + 200 + 100),
    tickValues=["International","Domestic"],
    className="international"
)

var ordinalGenderScale = d3.scaleOrdinal()
    .domain(["M", "F"])
    .range([
        heights.genderCluster + (500 * (1/4)),
        heights.genderCluster + (500 * (3/4))
    ])


var genderYAxis = d3.axisLeft()
    .scale(ordinalGenderScale)


svg.append("g")
    .attr("class", "axis axis_" + "gender")
    .attr("transform", "translate(" + width/8 + "," + 0 + ")")
    .call(genderYAxis)


var ordinalFormScale = d3.scaleOrdinal()
    .domain([2,3,4,5])
    .range([
        getX(0,4),
        getX(1,4),
        getX(2,4),
        getX(3,4)
    ])

var formXAxis = drawAxis(
    ordinalFormScale,
    heights.genderCluster + 500,
    tickValues=["II","III","IV","V"],
    className="form"
)

var ordinalSchoolTypeScale = d3.scaleOrdinal()
    .domain(["Private", "Public"])
    .range([getX(0,2),getX(1,2)])

var schoolTypeXAxis = drawAxis(
    ordinalSchoolTypeScale,
    heights.schoolTypeCluster + 300
)

var ordinalRepresentationScale = d3.scaleOrdinal()
    .domain(["MA_Private","MA_Public", "NY_Private", "Other"])
    .range([getX(0,4),getX(1,4),getX(2,4),getX(3,4)])

var ordinalRepresentationXAxis = drawAxis(
    ordinalRepresentationScale,
    heights.ordinalRepresentation + 300,
    tickValues=["MA Private", "MA Public", "NY Private", "Other"]
)

var ordinalDayStudentsScale = d3.scaleOrdinal()
    .domain(["D","B"])
    .range([getX(1,2),getX(0,2)])


var ordinalDayStudentsXAxis = drawAxis(
    ordinalDayStudentsScale,
    heights.ordinalDayStudents + 300
)

//draw points

var nodes;

var frameRate = 25

var simulation = d3.forceSimulation();

function step() {
    svg.selectAll("circle")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", function(d) { return d.radius; })
}

var geographicStates = {}
var countries = {}

var ordinalStateScale
var ordinalCountryScale

d3.json("./outputGeoJson.geojson", function (error, data) {

    filtered = data.features.filter((d) => {
        // console.log(d["properties"]["isNew"])
        // console.log(d["geometry"]["coordinates"][0])
        return d["properties"]["isNew"] == "true"
        // return d["geometry"]["coordinates"][0] != 0
    })

    nodes = filtered.map((d) => {

        //if coordinates are absent, just put them at the GPS coordinates for Groton
        if (d["geometry"]["coordinates"][0] == 0){
            d["geometry"]["coordinates"] = [-71.584016, 42.593495]
        }

        isUSA = d["properties"]["isUSA"]
        state = d["properties"]["state"]
        country = d["properties"]["country"]
        schoolType = d["properties"]["schoolType"]

        if (state == "MA" && schoolType == "Private"){
            group = "MA_Private"
        } else if (state == "MA") {
            group = "MA_Public"
        } else if (state == "NY" && schoolType == "Private") {
            group = "NY_Private"
        } else {
            group = "Other"
        }

        if(isUSA && state != "NONE" ) {
            if(geographicStates[state] == null){
                geographicStates[state] = 0
            }
            geographicStates[state] += 1
        } else {
            state = "International"
        }

        if(country != "USA") {
            if(countries[country] == null){
                countries[country] = 0
            }
            countries[country] += 1
        }

        coords = projectionGlobal(d["geometry"]["coordinates"])
        latLng = d["geometry"]["coordinates"]
        node = {
            lat : latLng[0],
            lng : latLng[1],
            fx : coords[0],
            fy : coords[1],
            start : coords,
            attractionTarget: [width/4, heightGlobe + 200],
            radius : 5,
            domestic: isUSA,
            state : state,
            gender : d["properties"]["gender"],
            form : d["properties"]["form"],
            schoolType : schoolType,
            country: country,
            group: group,
            boarding: d["properties"]["boarder"]
        }
        return node
    })

    console.log(nodes)

    ordinalStateScale = makeOrdinalScale(geographicStates, max=6)

    var stateXAxis = drawAxis(ordinalStateScale, heights.ordinalStateCluster + 300)

    ordinalCountryScale = makeOrdinalScale(countries)

    var countryXAis = drawAxis(ordinalCountryScale, heights.ordinalCountry + 250)

    //simulation
    simulation
        .force("x", d3.forceX(function(d) {
            return d.attractionTarget[0];
        }).strength(0.04))
        .force("y", d3.forceY(function(d) {
            return d.attractionTarget[1];
        }).strength(0.04))
        .force("collide", d3.forceCollide((d) => {return d.radius; }))
        .force("attraction", d3.forceManyBody().strength(0.01).theta(0.5))

        .alphaTarget(0.01)
        .stop()


    simulation.nodes(nodes).tick()

    // simulation.on("tick", (e) => step(e));
    window.setInterval(step, frameRate)

    //draw to svg
    svg.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.x; })
        .attr("r", function(d) { return d.radius; })
        .attr("class", "point")
        .classed("domestic", (d) => {
                return d.domestic ? true : false
            })
    // console.log(nodes)

});

//top y coords


var stops = [
    heights.startingState,
    heights.internationalCluster - 300,
    heights.ordinalCountry - 300,
    heights.unitedStatesMap - 200,
    heights.unitedStatesMap + 100,
    heights.genderCluster - 300,
    heights.schoolTypeCluster - 300,
    heights.ordinalRepresentation - 300,
    heights.ordinalDayStudents - 300,
    99999999
]

var i = 0

var states = [
    {name : "startingState", f : setToStart, min : stops[i], max : stops[++i] },
    {name : "internationalCluster", f : setToInternationalCluster, min: stops[i] , max : stops[++i]},
    {name : "ordinalCountry", f : setToCountryOrdinal, min: stops[i] , max : stops[++i]},
    {name : "unitedStatesMap", f : setToUnitedStatesMap, min : stops[i], max: stops[++i]},
    {name : "ordinalStateCluster", f : setToOrdinalStateCluster, min : stops[i], max: stops[++i]},
    {name : "genderCluster", f : setToGenderCluster, min : stops[i], max: stops[++i]},
    {name : "schoolTypeCluster", f : setToSchoolTypeCluster, min : stops[i], max: stops[++i]},
    {name : "ordinalRepresentaion", f : setToOrdinalRepresentaion, min : stops[i], max: stops[++i]},
    {name : "ordinalDayStudents", f : setToOrdinalDayStudents, min : stops[i], max: stops[++i]}
    //TBD
]

function showDebugStates(){
    var color = d3.scaleOrdinal(d3.schemeCategory10)

    svg.append("g")
        .selectAll("rect")
        .data(states)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d) => {return d.min - 200; })
        .attr("height", (d) => {return d.max - d.min})
        .attr("width", 30)
        .attr("fill", (d, i) => {return color(i); })

}

//DELETE ME
// showDebugStates()

function debug() {
    showDebugStates()
}

currentState = "startingState"

function setStateFromScroll(scroll_pos) {
    states.map((state) => {
        if (scroll_pos > state.min && scroll_pos < state.max && state.name != currentState){

            state.f()
            currentState = state.name
        }
    })
}

var last_known_scroll_position = 0;
var ticking = false;

window.addEventListener('scroll', function(e) {
  last_known_scroll_position = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(function() {
      setStateFromScroll(last_known_scroll_position);
      ticking = false;
    });
  }
  ticking = true;
});
