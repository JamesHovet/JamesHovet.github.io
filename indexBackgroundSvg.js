let body = document.body;
let svg = document.getElementById("backgroundSvg");
let startTime;
let stop = false;
let fps = 60;
let fpsInterval = 1000 / fps;
let then;
let now;

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
window.onload = function() {
    render(window.performance.now());
};

body.onresize = function() {
    render(window.performance.now());
}

function render(timestamp) {
    if (!startTime) {
        startTime = timestamp;
    }
    if (stop) {
        return;
    }

    requestAnimationFrame(render);

    now = timestamp;
    const elapsed = now - startTime;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval); // Reset the start time for the next interval

        svg.setAttribute("width", body.clientWidth);
        svg.setAttribute("height", body.clientHeight);

        // Update the viewBox to match the new width and height
        let viewBox = `0 0 ${body.clientWidth} ${body.clientHeight}`;
        svg.setAttribute("viewBox", viewBox);

        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

        // Clear previous content
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        let g = document.createElementNS(SVG_NAMESPACE, "g");
        svg.appendChild(g);

        let centerX = body.clientWidth / 2;
        let centerY = body.clientHeight / 2;

        let size = Math.min(body.clientWidth, body.clientHeight) / 3;

        let rotationTheta = elapsed * 0.0001; // Rotation speed (radians per millisecond)

        let rotation = mat4.fromRotation(mat4.create(), rotationTheta, [0, 1, 0]);

        let projection = mat4.perspective(mat4.create(), Math.PI / 8, 1, 0.1, 100);
        let eye = vec3.fromValues(0, 0, 10); // Eye position
        let target = vec3.fromValues(0, 0, 0); // Look at the origin
        let up = vec3.fromValues(0, 1, 0); // Up direction
        let view = mat4.lookAt(mat4.create(), eye, target, up);
        let modelViewProjection = mat4.multiply(mat4.create(), projection, view);
        modelViewProjection = mat4.multiply(modelViewProjection, modelViewProjection, rotation);

        let tris = torus_knot.map(triangle => {
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
                let x = centerX + (point[0] / point[2]) * size;
                let y = centerY - (point[1] / point[2]) * size;
                return [x, y];
            });

            let polygon = document.createElementNS(SVG_NAMESPACE, "polygon");
            polygon.setAttribute("points", points.map(p => p.join(",")).join(" "));
            polygon.setAttribute("stroke", "grey");
            polygon.setAttribute("fill", "white");

            g.appendChild(polygon);

            let circleX = centerX + (triangle.center[0] / triangle.center[2]) * size;
            let circleY = centerY - (triangle.center[1] / triangle.center[2]) * size;
            let circle = document.createElementNS(SVG_NAMESPACE, "circle");
            circle.setAttribute("cx", circleX);
            circle.setAttribute("cy", circleY);
            circle.setAttribute("r", "1px"); // Radius of the circle
            circle.setAttribute("fill", "white"); // Fill color of the circle
            circle.setAttribute("stroke", "grey"); // Stroke color of the circle

            g.appendChild(circle);
        });
    }
}

requestAnimationFrame(render);