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

    let g = document.createElementNS(SVG_NAMESPACE, "g");
    svg.appendChild(g);

    // Calculate the center of the SVG
    let centerX = body.clientWidth / 2;
    let centerY = body.clientHeight / 2;

    // Define the size of the triangle
    let size = Math.min(body.clientWidth, body.clientHeight) / 4;

    let rotationTheta = elapsed * 0.001; // Rotation speed (radians per millisecond)

    let rotation = mat4.fromRotation(mat4.create(), rotationTheta, [0, 1, 1]);

    let projection = mat4.perspective(mat4.create(), Math.PI / 4, 1, 0.1, 100);
    let eye = vec3.fromValues(0, 0, 5); // Eye position
    let target = vec3.fromValues(0, 0, 0); // Look at the origin
    let up = vec3.fromValues(0, 1, 0); // Up direction
    let view = mat4.lookAt(mat4.create(), eye, target, up);
    // Combine the transformations
    let modelViewProjection = mat4.multiply(mat4.create(), projection, view);
    modelViewProjection = mat4.multiply(modelViewProjection, modelViewProjection, rotation);
    // Apply the model-view-projection matrix to the vertices

    let tris = cube.map(triangle => {
        let vertex1 = vec3.transformMat4(vec3.create(), triangle._1, modelViewProjection);
        let vertex2 = vec3.transformMat4(vec3.create(), triangle._2, modelViewProjection);
        let vertex3 = vec3.transformMat4(vec3.create(), triangle._3, modelViewProjection);
        return new MyTriangle(vertex1, vertex2, vertex3);
    });

    tris.sort((a, b) => {
        let aCenterDot = vec3.dot(a.center, up);
        let bCenterDot = vec3.dot(b.center, up);
        return aCenterDot - bCenterDot; // Sort by the dot product with the up vector (Y-axis)

    });

    tris.forEach(triangle => {
        let points = triangle.map(point => {
            // Project the 3D vertex to 2D screen coordinates
            let x = centerX + (point[0] / point[2]) * size; // Perspective projection
            let y = centerY - (point[1] / point[2]) * size; // Invert Y coordinate for SVG
            return [x, y];
        });

        // Create the polygon element
        let polygon = document.createElementNS(SVG_NAMESPACE, "polygon");
        polygon.setAttribute("points", points.map(p => p.join(",")).join(" "));
        polygon.setAttribute("stroke", "grey");
        polygon.setAttribute("fill", "white");

        // Append the polygon to the SVG group
        g.appendChild(polygon);
    });


    // // Calculate the vertices of the triangle
    // let points = [
    //     // Vertex 1 (top vertex)
    //     [
    //         centerX + size * Math.cos(rotationTheta),
    //         centerY + size * Math.sin(rotationTheta)
    //     ],
    //     // Vertex 2 (bottom left vertex)
    //     [
    //         centerX + size * Math.cos(rotationTheta + 2 * Math.PI / 3),
    //         centerY + size * Math.sin(rotationTheta + 2 * Math.PI / 3)
    //     ],
    //     // Vertex 3 (bottom right vertex)
    //     [
    //         centerX + size * Math.cos(rotationTheta + 4 * Math.PI / 3),
    //         centerY + size * Math.sin(rotationTheta + 4 * Math.PI / 3)
    //     ]
    // ];
    //
    // // Create the polygon element
    // let polygon = document.createElementNS(SVG_NAMESPACE, "polygon");
    // polygon.setAttribute("points", points.map(p => p.join(",")).join(" "));
    // polygon.setAttribute("stroke", "grey");
    // polygon.setAttribute("fill", "white");
    //
    // // Append the polygon to the SVG
    // g.appendChild(polygon);

    requestAnimationFrame(render)
}

requestAnimationFrame(render);