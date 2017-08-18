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

function makeOrdinalScale(dict) {
    sortable = Object.keys(dict).map((key) => {
        return [key, dict[key]]
    })

    function sortingFunction(first, second) {
        return second[1] - first[1];
    }

    sortable.sort(sortingFunction)

    sorted = sortable.map((d) => {return d[0]; })

    range = [...Array(sorted.length).keys()].map((index) => {
        return getX(index, sorted.length)
    })

    scale = d3.scaleOrdinal()
        .domain(sorted)
        .range(range)

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
