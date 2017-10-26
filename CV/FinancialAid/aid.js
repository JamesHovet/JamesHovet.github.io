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
    .padding(0.5)
    .mouseover(function(datum, index, selection, my) {
        if(my.active){
            d3.select("#numberGuess")
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
    .padding(0.5)
    .mouseover(function(datum, index, selection, my) {
        if(my.active){
            d3.select("#grantBoardersGuess")
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
    .padding(0.5)
    .mouseover(function(datum, index, selection, my) {
        if(my.active){
            d3.select("#grantDayGuess")
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
    .padding(0.5)
    .mouseover(function(datum, index, selection, my) {
        if(my.active){
            d3.select("#numberFullGuess")
                .html(d3.format(",")(my.unit * (index + 1)))
            }
        // console.log("from callback ", my.max, my.total)
        // console.log("amount ", my.unit * (index + 1))

    })

numberFullGrid.call()

answers = {
    numberGrid: 38,
    grantGridBoarders: 46490,
    grantGridDay: 31355,
    numberFullGrid: 66
}
function showAnswers(){
    for (var key in answers) {
        if (answers.hasOwnProperty(key)) {
            // console.log(answers[key])
            grid = window[key]
            // console.log(grid.max)
            i = Math.floor((grid.total/grid.max) * answers[key])
            // console.log(i)
            // console.log(grid.id)
            grid.selectIndex(i)
        }
    }

    d3.selectAll(".answer")
        .attr("style", "display: block;")
    d3.selectAll(".answerNumber")
        .attr("style", "display: block;")
    d3.selectAll(".guess")
        .attr("style", "display: none;")
}
