var attractionStrength = 0.1
var standardAlphaTarget = 0.3

function setToStart() {
    nodes = simulation.nodes()

    nodes = nodes.map((node) => {
        node.attractionTarget = node.start
        return node
    })
    simulation.alpha(1).alphaTarget(standardAlphaTarget).restart()
    simulation.nodes(nodes)
    //take away collision and attraction
    simulation.force("collide", null)
    simulation.force("attraction", null)
}

function setToInternationalCluster() {
    nodes = simulation.nodes()

    nodes = nodes.map((node) => {

        node.attractionTarget = [ordinalInternationalScale(node.domestic), heightGlobe + 200]

        node.fx = null
        node.fy = null

        return node
    })
    simulation.alpha(1).alphaTarget(standardAlphaTarget).restart()
    simulation.nodes(nodes)
    //add back the physics
    .force("collide", d3.forceCollide((d) => {return d.radius; }))
    .force("attraction", d3.forceManyBody().strength(attractionStrength))
}

function setToCountryOrdinal() {
    nodes = simulation.nodes()

    nodes = nodes.map((node) => {
        if (node.country != "USA") {
            node.attractionTarget = [ordinalCountryScale(node.country), heights.ordinalCountry + 200]
        } else {
            node.attractionTarget = [width + 300,heights.ordinalCountry + 200]
        }

        return node
    })
    simulation.alpha(1).alphaTarget(standardAlphaTarget).restart()
    simulation.nodes(nodes)
    //add back the physics
    .force("collide", d3.forceCollide((d) => {return d.radius; }))
    .force("attraction", d3.forceManyBody().strength(attractionStrength))
}

function setToUnitedStatesMap() {
    nodes = simulation.nodes()

    nodes = nodes.map((node) => {
        if (node.domestic) {
            node.attractionTarget = projectionDomestic([node.lat ,node.lng])
            node.attractionTarget[1] += heights.unitedStatesMap
        } else {
            node.attractionTarget = [width + 300, heights.unitedStatesMap]
        }

        return node
    })
    simulation.alpha(1).alphaTarget(1).restart()
    simulation.nodes(nodes)
    //take away collision and attraction
    .force("collide", d3.forceCollide((d) => {return d.radius/4; }))
    simulation.force("attraction", null)
    // simulation.force("collide", null)
}

function setToOrdinalStateCluster() {
    nodes = simulation.nodes()

    nodes = nodes.map((node) => {
        if (node.domestic) {
            node.attractionTarget = [ordinalStateScale(node.state), heights.ordinalStateCluster + 200]
        } else {
            node.attractionTarget = [width + 300,heights.ordinalStateCluster + 200]
        }

        return node
    })
    simulation.alpha(1).alphaTarget(standardAlphaTarget).restart()
    simulation.nodes(nodes)
    //add back the physics
    .force("collide", d3.forceCollide((d) => {return d.radius; }))
    .force("attraction", d3.forceManyBody().strength(attractionStrength))
}

function setToGenderCluster() {
    nodes = simulation.nodes()

    nodes = nodes.map((node) => {

        node.attractionTarget = [
            ordinalFormScale(node.form),
            ordinalGenderScale(node.gender)
        ]
        return node
    })
    simulation.alpha(1).alphaTarget(standardAlphaTarget).restart()
    simulation.nodes(nodes)
    //add back the physics
    // .force("collide", d3.forceCollide((d) => {return d.radius; }))
    // .force("attraction", d3.forceManyBody().strength(attractionStrength))
}

function setToSchoolTypeCluster() {
    nodes = simulation.nodes()

    nodes = nodes.map((node) => {

        node.attractionTarget = [
            ordinalSchoolTypeScale(node.schoolType),
            heights.schoolTypeCluster + 200
        ]
        return node
    })
    simulation.alpha(1).alphaTarget(standardAlphaTarget).restart()
    simulation.nodes(nodes)
    //add back the physics
    .force("collide", d3.forceCollide((d) => {return d.radius; }))
    .force("attraction", d3.forceManyBody().strength(attractionStrength))
}

//TODO

function setToOrdinalRepresentaion() {
    nodes = simulation.nodes()

    nodes = nodes.map((node) => {

        node.attractionTarget = [
            ordinalRepresentationScale(node.group),
            heights.ordinalRepresentation + 200
        ]
        return node
    })
    simulation.alpha(1).alphaTarget(standardAlphaTarget).restart()
    simulation.nodes(nodes)
    //add back the physics
    .force("collide", d3.forceCollide((d) => {return d.radius; }))
    .force("attraction", d3.forceManyBody().strength(attractionStrength))
}

function setToOrdinalDayStudents() {
    nodes = simulation.nodes()

    nodes = nodes.map((node) => {

        node.attractionTarget = [
            ordinalDayStudentsScale(node.boarding),
            heights.ordinalDayStudents + 200
        ]
        return node
    })
    simulation.alpha(1).alphaTarget(standardAlphaTarget).restart()
    simulation.nodes(nodes)
    //add back the physics
    .force("collide", d3.forceCollide((d) => {return d.radius; }))
    .force("attraction", d3.forceManyBody().strength(attractionStrength))
}
