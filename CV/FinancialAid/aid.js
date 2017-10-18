var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth

docWidth = width < 1000
    ? width
    : 1000

var docHeight = width < 1000
    ? 600
    : width * 0.6

var padding = 50

var grotonColor = "#8C1217"
var secondaryColor = "#222222"

var formatComma = d3.format(",");

number = d3.select("#SVG_number")
    // .attr("class", "left")

numberGrid = new Grid(number, "#SVG_number")
    .width(docWidth * 0.8)
    .height(docHeight * 0.5)
    .rows(10)
    .cols(20)
    .max(100)
    .padding(1)
    .mouseover(function(datum, index, selection, my) {
        if(my.active){
            d3.select("#numberAnswer")
                .html((my.unit * (index + 1)))
            }
        // console.log("from callback ", my.max, my.total)
        // console.log("amount ", my.unit * (index + 1))

    })
    .click(function(datum, index, selection, my) {
        console.log("g1 click", datum, index, selection)

    })

numberGrid.call()

grantBoarders = d3.select("#SVG_grantBoarders")

grantGridBoarders = new Grid(grantBoarders, "#SVG_grantBoarders")
    .width(300)
    .height(300)
    .rows(20)
    .cols(20)
    .max(56000)
    .padding(1)
    .mouseover(function(datum, index, selection, my) {
        if(my.active){
            d3.select("#grantBoardersAnswer")
                .html(d3.format(",")(my.unit * (index + 1)))
            }
        // console.log("from callback ", my.max, my.total)
        // console.log("amount ", my.unit * (index + 1))

    })

grantGridBoarders.call()

grantDay = d3.select("#SVG_grantDay")

grantGridDay = new Grid(grantDay, "#SVG_grantDay")
    .width(300)
    .height(300)
    .rows(20)
    .cols(20)
    .max(56000)
    .padding(1)
    .mouseover(function(datum, index, selection, my) {
        if(my.active){
            d3.select("#grantDayAnswer")
                .html(d3.format(",")(my.unit * (index + 1)))
            }
        // console.log("from callback ", my.max, my.total)
        // console.log("amount ", my.unit * (index + 1))

    })

grantGridDay.call()

numberFull = d3.select("#SVG_numberFull")

numberFullGrid = new Grid(numberFull, "#SVG_numberFull")
    .width(300)
    .height(300)
    .rows(20)
    .cols(20)
    .max(400)
    .padding(1)
    .mouseover(function(datum, index, selection, my) {
        if(my.active){
            d3.select("#numberFullAnswer")
                .html(d3.format(",")(my.unit * (index + 1)))
            }
        // console.log("from callback ", my.max, my.total)
        // console.log("amount ", my.unit * (index + 1))

    })

numberFullGrid.call()





//
// g2 = new grid(d3.select("#two"), "#two")
//     .mouseover(function(datum, index, selection, my) {
//         console.log("g2")
//         console.log("from callback ", my.max, my.total)
//         console.log("amount ", my.unit * (index + 1))
//
//     })
//     .click(function(datum, index, selection, my) {
//         console.log("g2 click", datum, index, selection)
//     })
//
// g2.call()
