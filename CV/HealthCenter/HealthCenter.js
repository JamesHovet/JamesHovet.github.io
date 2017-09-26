var width = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth

width = width < 1000 ? width : 1000

var height = width < 1000 ? 600 : width * 0.6

var padding = 15

var grotonColor = "#8C1217"
var secondaryColor = "#222222"
var opacity = 0.2

//form

function draw(selector, source, width, height){
    var svgForm = d3.select(selector)
        .attr("width", width)
        .attr("height", height)

    var sankey = d3.sankey()
        .nodeWidth(40)
        .nodePadding(20)
        .extent([[0 + padding, 0 + padding], [width - padding, height - padding]]);

    var link = svgForm.append("g")
        .attr("class", "links")
        .attr("fill", "none")
        .attr("stroke", secondaryColor)
        .attr("stroke-opacity", opacity)
      .selectAll("path");

    var node = svgForm.append("g")
        .attr("class", "nodes")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
      .selectAll("g");

    d3.json(source, function (error, form) {

        sankey(form)

        link = link
            .data(form.links)
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
            .data(form.nodes)
            .enter().append("g");

        node.append("rect")
            .attr("x", function(d) { return d.x0; })
            .attr("y", function(d) { return d.y0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .attr("width", function(d) { return d.x1 - d.x0; })
            .attr("fill", grotonColor)
            .on("mouseover", function(d, i){
                console.log(d)

                sourceLinks = Array()
                targetLinks = Array()

                if(d.hasOwnProperty("sourceLinks")){
                    sourceLinks = d.sourceLinks
                }
                if(d.hasOwnProperty("targetLinks")){
                    targetLinks = d.targetLinks
                }

                connectedLinks = sourceLinks.concat(targetLinks).map((i) => {return i.index})

                console.log(connectedLinks)

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


    })

}

draw("#form", "./form.json", width, height)
draw("#perscription", "./perscription.json", width*2/3, height*2/3)
draw("#access", "./access.json", width*2/3, height*2/3)
