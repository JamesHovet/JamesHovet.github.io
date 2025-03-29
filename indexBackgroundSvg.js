let body = document.body;
let svg = document.getElementById("backgroundSvg");
let start;
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
window.onload = function() {

    render(0);
};

body.onresize = function() {

    render(0);
}

function render(timestamp) {
    if (!start) {
        start = timestamp;
    }
    const elapsed = timestamp - start;
    svg.setAttribute("width", body.clientWidth);
    svg.setAttribute("height", body.clientHeight);

    // Update the viewBox to match the new width and height
    let viewBox = `0 0 ${body.clientWidth} ${body.clientHeight}`;
    svg.setAttribute("viewBox", viewBox);

    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // draw a triangle in the center of the svg
    // Clear previous content
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }

    // Calculate the center of the SVG
    let centerX = body.clientWidth / 2;
    let centerY = body.clientHeight / 2;

    // Define the size of the triangle
    let size = Math.min(body.clientWidth, body.clientHeight) / 4;

    let rotationTheta = elapsed * 0.001; // Rotation speed (radians per millisecond)

    // Calculate the vertices of the triangle
    let points = [
        // Vertex 1 (top vertex)
        [
            centerX + size * Math.cos(rotationTheta),
            centerY + size * Math.sin(rotationTheta)
        ],
        // Vertex 2 (bottom left vertex)
        [
            centerX + size * Math.cos(rotationTheta + 2 * Math.PI / 3),
            centerY + size * Math.sin(rotationTheta + 2 * Math.PI / 3)
        ],
        // Vertex 3 (bottom right vertex)
        [
            centerX + size * Math.cos(rotationTheta + 4 * Math.PI / 3),
            centerY + size * Math.sin(rotationTheta + 4 * Math.PI / 3)
        ]
    ];

    // Create the polygon element
    let polygon = document.createElementNS(SVG_NAMESPACE, "polygon");
    polygon.setAttribute("points", points.map(p => p.join(",")).join(" "));
    polygon.setAttribute("stroke", "grey");
    polygon.setAttribute("fill", "none");

    // Append the polygon to the SVG
    svg.appendChild(polygon);

    requestAnimationFrame(render)
}

requestAnimationFrame(render);