function setToStart() {
    nodes = simulation.nodes()

    nodes = nodes.map((node) => {
        node.attractionTarget = node.start
        return node
    })
    simulation.alpha(1).restart()
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
    simulation.alpha(1).restart()
    simulation.nodes(nodes)
    //add back the physics
    .force("collide", d3.forceCollide((d) => {return d.radius; }))
    .force("attraction", d3.forceManyBody().strength(3))
}

function setToUnitedStatesMap() {
    nodes = simulation.nodes()

    nodes = nodes.map((node) => {
        if (node.domestic) {
            node.attractionTarget = projectionDomestic([node.lat ,node.lng])
            node.attractionTarget[1] += Number(heightGlobe) + Number(400)
        } else {
            node.attractionTarget = [width + 300, Number(heightGlobe) + Number(400) + Number(heightGlobe)/2]
        }

        return node
    })
    simulation.alpha(1).restart()
    simulation.nodes(nodes)
    //take away collision and attraction
    .force("collide", d3.forceCollide((d) => {return d.radius/2; }))
    simulation.force("attraction", null)
}

function setToOrdinalStateCluster() {
    nodes = simulation.nodes()

    nodes = nodes.map((node) => {
        if (node.domestic) {
            node.attractionTarget = [ordinalStateScale(node.state), heightGlobe + heightGlobe + 400 + 200]
        } else {
            node.attractionTarget = [width + 300, heightGlobe + heightGlobe + 400 + 200]
        }

        return node
    })
    simulation.alpha(1).restart()
    simulation.nodes(nodes)
    //add back the physics
    .force("collide", d3.forceCollide((d) => {return d.radius; }))
    .force("attraction", d3.forceManyBody().strength(3))
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
    simulation.alpha(1).restart()
    simulation.nodes(nodes)
    //add back the physics
    // .force("collide", d3.forceCollide((d) => {return d.radius; }))
    // .force("attraction", d3.forceManyBody().strength(3))
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
    simulation.alpha(1).restart()
    simulation.nodes(nodes)
    //add back the physics
    // .force("collide", d3.forceCollide((d) => {return d.radius; }))
    // .force("attraction", d3.forceManyBody().strength(3))
}
