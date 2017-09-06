function drawMaps(){//draw globe
    // projectionGlobal = d3.geoWinkel3()
    //     .scale(width * (182/960))
    //     .translate([width / 2, heightGlobe / 2])
    //     .precision(.1)

    projectionGlobal = d3.geoKavrayskiy7()
        .scale(width * (170/960))
        .translate([width / 2, heightGlobe / 2])
        .precision(.1)

    pathGlobal = d3.geoPath(projectionGlobal)

    var graticule = d3.geoGraticule();

    svg = d3.select("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("defs").append("path")
        .datum({type: "Sphere"})
        .attr("id", "sphere")
        .attr("d", pathGlobal);

    svg.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");

    svg.append("use")
        .attr("class", "fill")
        .attr("xlink:href", "#sphere");

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", pathGlobal);

    d3.json("./world-50m.json", function(error, world) {
        if (error) throw error;

        console.log(topojson.feature(world, world.objects.land))

        svg.insert("path", ".graticule")
            .datum(topojson.feature(world, world.objects.land))
            // .datum(world.objects.land)
            .attr("class", "land")
            .attr("d", pathGlobal);

        svg.insert("path", ".graticule")
            .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
            .attr("class", "boundary")
            .attr("d", pathGlobal);

    });

    //draw US
    // projectionDomestic = d3.geoAlbersUsa()
    projectionDomestic = d3.geoAlbers()
        .scale(width * 1070/1000)
        .translate([width / 2, heightGlobe / 2])

    // console.log(projectionDomestic.scale())

    pathDomestic = d3.geoPath(projectionDomestic)

    var gDomestic = svg.append("g")
        .attr("id", "domestic")
        .attr("transform", "translate(0," + (Number(heightGlobe) + Number(400.0)) + ")")

    d3.json("./us_states_5m.geojson", function(error, us) {
        if (error) throw error;

        // console.log(us)

        // gDomestic.insert("path")
        //   .datum(us)
        //   .attr("class", "land")
        //   .attr("d", pathDomestic);
        gDomestic
            .selectAll("path")
            .data(us.features)
            .enter()
            .append("path")
            .attr("class", "state")
            .attr("d", pathDomestic);

        // gDomestic.append("path")
        //     .attr("class", "boundary")
        //     .attr("d", pathDomestic(topojson.mesh(us, us, function(a, b) { return a !== b; })));
    });
}
