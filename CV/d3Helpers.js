
function Grid(selection, id) {
    var id = id
        width = 600, // default width
        height = 600; // default height
        rows = 10;
        cols = 10;
        className = "grid";
        min = 0;
        max = 1000000; //one million
        padding = 2
        fillColor = "#AEAEAE"
        highlightColor = "#8C1217"
        activeColor = "#A74E53"
        active = true
        mouseover = function(d, i, selection) {
            return
        }
        mouseout = function(d, i, selection) {
            return
        }
        click = function(d, i, selection) {
            return
        }



    function my() {

        var svg = selection
            .attr("width", width)
            .attr("height", height)
            .attr("class", selection.attr("class") + " " + "gridSVG_" + className)

        my.rows = rows
        my.cols = cols
        my.max = max
        my.total = my.rows * my.cols
        my.unit = my.max / my.total
        squareDim = height/rows < width/cols ? height/rows : width/cols

        offsetX = (width - (my.cols * squareDim))/2
        offsetY = (height - (my.rows * squareDim))/2

        values = []

        my.mouseover = mouseover
        my.mouseout = mouseout
        my.click = click

        // console.log(rows, my.rows)
        // console.log(cols, my.cols)
        // // console.log(total, my.total)
        // console.log(my.total)

        for (var i = 0; i < my.total; i++) {
            values.push({
                "x" : (i % my.cols * squareDim) + offsetX,
                "y" : (Math.floor(i/my.cols) * squareDim) + offsetY,
                "i" : i
            })
        }

        g = svg.append("g")
            .attr("class", "gridG_" + className)
            .attr("id", id)
            .selectAll("rect")
            .data(values)
            .enter()
            .append("rect")
                .attr("x", (d) => {return d.x + padding})
                .attr("y", (d) => {return d.y + padding})
                .attr("width", (d) => {return squareDim - padding*2})
                .attr("height", (d) => {return squareDim - padding*2})
                .attr("fill", fillColor)
                .on("mouseover", function(datum, index) {
                    if(my.active){
                        d3.select(id)
                            .selectAll("rect")
                            .attr("fill", (d, i) => {
                                if(i <= index) {
                                    return activeColor
                                } else {
                                    return fillColor
                                }
                            })
                        }

                    // console.log("mouseover", mouseover)
                    // console.log("my.mouseover", my.mouseover())
                    my.mouseover(datum, index, g, my)
                }.bind(this))
                .on("mouseout", (datum, index) => {

                    my.mouseout(datum, index, g, my)
                })
                .on("click", function(datum, index) {
                    // console.log("in primary callback: ", this.active)
                    // console.log("in primary callback my: ", my.active)
                    if(my.active){
                        my.active = false
                        d3.select(id)
                            .selectAll("rect")
                            .attr("fill", (d, i) => {
                                if(i <= index) {
                                    return highlightColor
                                } else {
                                    return fillColor
                                }
                            })
                    } else {
                        my.active = true
                    }
                    my.click(datum, index, g, my)
                }.bind(this))

    }

    my.width = function(value) {
        if (!arguments.length)
            return width;
        width = value;
        return my;
    };

    my.height = function(value) {
        if (!arguments.length)
            return height;
        height = value;
        return my;
    };

    my.rows = function(value) {
        if(!arguments.length)
            return rows;
        rows = value;
        return my
    }

    my.cols = function(value) {
        if(!arguments.length)
            return cols
        cols = value
        return my
    }

    my.className = function(value) {
        if(!arguments.length)
            return className
        className = value
        return my
    }

    my.min = function(value) {
        if(!arguments.length)
            return min
        min = value
        return my
    }

    my.max = function(value) {
        if(!arguments.length)
            return max
        max = value
        return my
    }

    my.padding = function(value) {
        if(!arguments.length)
            return padding
        padding = value
        return my
    }

    my.fillColor = function(value) {
        if(!arguments.length)
            return fillColor
        fillColor = value
        return my
    }

    my.highlightColor = function(value) {
        if(!arguments.length)
            return highlightColor
        highlightColor = value
        return my
    }

    my.activeColor = function(value) {
        if(!arguments.length)
            return activeColor
        activeColor = value
        return my
    }

    my.mouseover = function(value) {
        if(!arguments.length)
            return mouseover
        mouseover = value
        return my
    }

    my.mouseout = function(value) {
        if(!arguments.length)
            return mouseout
        mouseout = value
        return my
    }

    my.click = function(value) {
        if(!arguments.length)
            return click
        click = value
        return my
    }

    my.active = function(value) {
        if(!arguments.length)
            return active
        active = value
        return my
    }

    return my;
}

function drawAxis(scale, yPos, tickValues=null, className="default"){
    var axis = d3.axisBottom()
        .scale(scale)
        .tickValues(tickValues)

    svg.append("g")
        .attr("class", "axis axis_" + className)
        .attr("transform", "translate(" + 0 + "," + yPos + ")")
        .call(axis)
    return axis
}

function makeOrdinalScale(dict, max=null) {
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

function positionAside(selector, yPos) {
    aside = d3.select(selector)
        .attr("y", yPos)
        .attr("x", width/8)
        .attr("width", width/2)

    return aside
}
function getX(index, items) {
    workingWidth = width * (6/8)
    offset = width * (1/8)

    return offset + (((index * 2) + 1 ) * (workingWidth/(items * 2)))
}
