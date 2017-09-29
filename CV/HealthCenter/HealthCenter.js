var width = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth

width = width < 1000 ? width : 1000

var height = width < 1000 ? 600 : width * 0.6

var padding = 50

var grotonColor = "#8C1217"
var secondaryColor = "#222222"
var opacity = 0.2

var format = d3.format(".0%");


function draw(selector, source, width, height){
    function getX(index, items) {
        return ((index * 2) + 1) * (width/(items * 2))
    }

    function drawYAxis(scale, yPos, selector, tickValues=null, className="noLine"){
        var axis = d3.axisBottom()
            .scale(scale)
            .tickValues(tickValues)

        d3.select(selector).append("g")
            .attr("class", "axis axis_" + className)
            .attr("transform", "translate(" + 0 + "," + yPos + ")")
            .call(axis)
        return axis
    }

    function drawTitle(text, yPos, className="default"){
        d3.select(selector).append("g")
            .attr("class", "title title_" + className)
            .attr("transform", "translate(" + 0 + "," + yPos + ")")
            .append("text")
            .attr("x", () => {return width/2})
            .attr("y", 0)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(() => {return text})
    }

    function makeOrdinalScale(dict, max=null) {
        // console.log(dict)

        sortable = Object.keys(dict).map((key) => {
            return [key, dict[key]]
        })

        function sortingFunction(first, second) {
            return second[1] - first[1];
        }

        sortable.sort(sortingFunction)

        sorted = sortable.map((d) => {return d[0]; })

        if(max){
            sorted = sorted.slice(0,max)
        }

        range = [...Array(sorted.length).keys()].map((index) => {
            return getX(index, sorted.length )
        })

        scale = d3.scaleOrdinal()
            .domain(sorted)
            .range(range)
            .unknown(width + 200)//get the unkowns off the screen

        return scale
    }

    var svg = d3.select(selector)
        .attr("width", width)
        .attr("height", height)

    var sankey = d3.sankey()
        .nodeWidth(40)
        .nodePadding(20)
        .extent([[0 + padding, 0 + padding], [width - padding, height - padding]]);

    var link = svg.append("g")
        .attr("class", "links")
        .attr("fill", "none")
        .attr("stroke", secondaryColor)
        .attr("stroke-opacity", opacity)
      .selectAll("path");

    var node = svg.append("g")
        .attr("class", "nodes")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
      .selectAll("g");

    d3.json(source, function (error, data) {

        sankey(data)

        console.log(data)


        link = link
            .data(data.links)
            .enter().append("path")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", function(d) { return Math.max(1, d.width); })
            .on("mouseover", function(d, i) {
                d3.select(this)
                    .attr("stroke", grotonColor)
                    .attr("stroke-opacity", opacity)

                // console.log(this)
                // console.log(d)

            })
            .on("mouseout", function (d, i) {
                d3.select(this)
                    .attr("stroke", secondaryColor)
                    .attr("stroke-opacity", opacity)
            })

        node = node
            .data(data.nodes)
            .enter().append("g");

        node.append("rect")
            .attr("x", function(d) { return d.x0; })
            .attr("y", function(d) { return d.y0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .attr("width", function(d) { return d.x1 - d.x0; })
            .attr("fill", grotonColor)
            .on("mouseover", function(d, i){

                sourceLinks = Array()
                targetLinks = Array()

                if(d.hasOwnProperty("sourceLinks")){
                    sourceLinks = d.sourceLinks
                }
                if(d.hasOwnProperty("targetLinks")){
                    targetLinks = d.targetLinks
                }

                connectedLinks = sourceLinks.concat(targetLinks).map((i) => {return i.index})

                d3.select(selector + " .links").selectAll("path")
                    .attr("stroke", (d, i) => {
                        if(connectedLinks.includes(i)){
                            return grotonColor
                        } else {
                            return secondaryColor
                        }
                    })

            })
            .on("mouseout", function(d, i) {
                d3.select(selector + " .links").selectAll("path")
                    .attr("stroke", (d, i) => {
                        return secondaryColor
                    })
            })

        maxDepth = 0
        for(node of data.nodes){
            if(node.depth > maxDepth){
                maxDepth = node.depth
            }
        }

        console.log(maxDepth)

        d3.select(selector + " .nodes")
            .selectAll("g")
            .append("text")
            .attr("x", function(d) { return d.x0 - 6; })
            .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .attr("font-family", "Georgia")
            .text(function(d) { return d.name + " " + format((d.value) / data.total); })
            .filter(function(d) { return d.x0 < width / 2; })
            .attr("x", function(d) { return d.x1 + 6; })
            .attr("text-anchor", "start");

        // console.log(data)
        scale = makeOrdinalScale(data.questions)
        // console.log(svg)
        drawYAxis(scale, height - padding*(2/3), selector)

        if(data.hasOwnProperty("title")){
            console.log(data.title)
            drawTitle(data.title, padding/2)
        }


    })

}

draw("#form", "./form.json", width, height)
draw("#perscription", "./perscription.json", width*2/3, height*2/3)
draw("#access", "./access.json", width*2/3, height*2/3)
