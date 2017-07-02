function draw(t,index,data) {

    // console.log(data)
    // console.log(track)
    // t = getTrackSpec(track)
    // console.log(t)

    var img = document.createElement('img');
    img.crossOrigin = '';
    img.setAttribute('src', t.current_url)
    // document.body.appendChild(img)

    var barColor
    var neutralColor = "#222222"

    img.addEventListener('load', function() {
        var vibrant = new Vibrant(img);
        var swatches = vibrant.swatches()
        barColor = swatches["Vibrant"].getHex()

        function rgb(values) {
            return 'rgb(' + values.join(', ') + ')';
        }

        var bars_g = document.getElementById("bars_" + String(index))
        bars_g.setAttribute("fill",barColor)
        var path_g_current = document.getElementById("path_g_" + String(index))
        path_g_current.setAttribute("stroke", neutralColor)
        var bk_current = document.getElementById("bk_" + String(index))
        bk_current.setAttribute("fill", neutralColor)
        var rect_bk_current = document.getElementById("rect_bk_" + String(index))


    });



    //start main d3 stuff
    // var vis = d3.select("svg").append("g").attr("transform","translate(100,100)");
    // var vis = d3.select("#svgDiv_" + String(index))

    // var vis = d3.select("#svgDiv_" + String(index)).select("svg").select("g").select("g")
    var vis = d3.select("#svgDiv_" + String(index))
        .select("svg")
        .append("g")
        .attr("transform", "scale(1.5)")
        .append("g")
        .attr("transform","translate(100,100)")
        .attr("id","set_" + String(index))


    // var vis = d3.select()

    console.log(vis)
    // console.log(document.getElementById("svgDiv_0"))

    vis.attr("id","didThisWork")

    vis.append("defs")
        .append('pattern')
        .attr('id', 'albumCover_' + String(index))
        .attr('patternContentUnits', 'objectBoundingBox')
        .attr('width', "100%")
        .attr('height', "100%")
        .append("image")
        .attr("xlink:href", t.current_url)
        .attr('width', 1)
        .attr('height', 1)



    vis.append("rect")
        .attr("id","rect_bk_" + String(index))
        .attr("x","-50%")
        .attr("y","-50%")
        .attr("width","100%")
        .attr("height","100%")
        .attr("fill","url(#albumCover_" + String(index) +")")
        .attr("filter","url(#f1)")


    //draw dial outer circle
    vis.append("circle")
        .attr("id","bk_" + String(index))
        .attr("cx",0)
        .attr("cy",0)
        .attr("fill",neutralColor)
        .attr("r",100/2.1 + 50)


    //create the clip paths
    vis.selectAll("clipPath")
        .data(clipPaths)
        .enter()
        .append("clipPath")
        .attr("id", (d,i) => {return"tri" + i+ "_" + String(index)})
        .append("path")
        .attr("d",(d) => {return d})

    vis.append("g")
        .attr("id","bars_" + String(index))
        .attr("fill",neutralColor)
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx",0)
        .attr("cy",0)
        .attr("r",(d) => {return (d*100)/2.1 + 50})
        .attr("clip-path",(d,i) => {return"url(#tri" + i+ "_" + String(index) + ")"})
        .attr("fill",barColor)

    //clip radial lines

    vis.append("clipPath")
        .attr("id","circle_clip_" + String(index))
        .append("circle")
        .attr("cx",0)
        .attr("cy",0)
        .attr("r",100/2.1 + 50)


    vis.append("g")
        .attr("id","path_g_" + String(index))
        .attr("fill","none")
        .attr("stroke",neutralColor)
        .attr("stroke-width","5")
        .selectAll("path")
        .data(clipPaths)
        .enter()
        .append("path")
        .attr("d",(d)=> {return d})
        .attr("clip-path","url(#circle_clip_" + String(index) +")")

    //album cover
    vis.append("circle")
        .attr("cx",0)
        .attr("cy",0)
        .attr("r",50)
        .attr("fill","url(#albumCover_" + String(index) + ")")
        .attr("stroke","white")
        .attr("stroke-width","5")

    var info = d3.select("#svgDiv_" + String(index)+ " .trackInfo")

    info.select(".songTitle a")
        .attr("href",t.current_href)
        .html(t.current_name)
    info.select(".artist a")
        .attr("href",t.current_artist_href)
        .html(t.current_artist)
    info.select(".albumTitle a")
        .attr("href",t.current_album_href)
        .html(t.current_album)
}

function createTileDiv(track,index) {
    this.div = $("<div>", {id: "svgDiv_" + index, class: "svgDiv"})

    this.svg = $("<svg width='300' height='300'>")

    div.append(this.svg)

    this.trackInfoDiv = $("<div class='trackInfo'>")

    this.trackInfoDiv.append($("<h1 class='songTitle'><a href='null'>Loading</a></h1>"))
    this.trackInfoDiv.append($("<h1 class='artist'><a href='null'>Loading</a></h1>"))
    this.trackInfoDiv.append($("<h1 class='albumTitle'><a href='null'>Loading</a></h1>"))

    this.div.append(this.trackInfoDiv)

    // console.log(track)
    $("body").append(div)

    draw(track,index,[1.00,1.00,.50,.50,.25,.25,.0,.0])

}
