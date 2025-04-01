let body = document.body;
let svg = document.getElementById("backgroundSvg");
svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
let startTime;
let stop = false;
let fps = 60;
let fpsInterval = 1000 / fps;
let then = window.performance.now();
let now;
let elementsExist = false;
let g = null;
let totalElapsed = 0;
let thisParamSet = 0;

class ParamSet {
    constructor(triSortingFunction, rotationSpeed = 0.00007) {
        this.triSortingFunction = triSortingFunction;
        this.rotationSpeed = rotationSpeed;
    }
}

paramSets = [
    /**
     * Sort by the dot product of the triangle with to (0, -1, 0)
     */
    new ParamSet((tris, totalElapsed) => {
        let down = vec3.fromValues(0, -1, 0);
        tris.sort((a, b) => {
            let aCenterDot = vec3.dot(a.center, down);
            let bCenterDot = vec3.dot(b.center, down);
            return aCenterDot - bCenterDot; // Sort by the dot product with the up vector (Y-axis)
        });
    }, 0.00007),
    /**
     * Sort by the distance to (0, 0, 0)
     */
    new ParamSet((tris, totalElapsed) => {
        let target = vec3.fromValues(0, 0, 0);
        tris.sort((a, b) => {
            let aCenterDist = vec3.distance(a.center, target);
            let bCenterDist = vec3.distance(b.center, target);
            return aCenterDist - bCenterDist; // Sort by the dot product with the up vector (Y-axis)
        });
    }),
    /**
     * Sort by the dot product similarity between (cos(t), sin(t), 0) and the triangle normal
     */
    new ParamSet((tris, totalElapsed) => {
        let target = vec3.fromValues(Math.cos(totalElapsed * 0.001), Math.sin(totalElapsed * 0.001), 0); // Down direction for sorting
        tris.sort((a, b) => {
            let aCenterDot = vec3.dot(a.normal, target);
            let bCenterDot = vec3.dot(b.normal, target);
            return aCenterDot - bCenterDot; // Sort by the dot product with the up vector (Y-axis)
        });
    }, 0.00005),
];

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
window.onload = function() {
    thisParamSet = Math.round(window.performance.now()) % paramSets.length;
    console.log(thisParamSet);
    render(window.performance.now());
};

body.onresize = function() {
    render(window.performance.now());
}

function render(timestamp) {
    if (stop) {
        return;
    }

    requestAnimationFrame(render);

    now = timestamp;
    const elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval); // Reset the start time for the next interval
        totalElapsed += elapsed;

        svg.setAttribute("width", body.clientWidth);
        svg.setAttribute("height", body.clientHeight);
        svg.setAttribute("stroke-width", "0.05rem");

        // Update the viewBox to match the new width and height
        let viewBox = `0 0 ${body.clientWidth} ${body.clientHeight}`;
        svg.setAttribute("viewBox", viewBox);


        if (!elementsExist) {
            g = document.createElementNS(SVG_NAMESPACE, "g");
            svg.appendChild(g);
        }


        let centerX = body.clientWidth / 2;
        let centerY = body.clientHeight / 2;

        let size = Math.min(body.clientWidth, body.clientHeight) / 3;

        let rotationTheta = totalElapsed * paramSets[thisParamSet].rotationSpeed;

        let rotation = mat4.fromRotation(mat4.create(), rotationTheta, [0, 1, 0]);

        let projection = mat4.perspective(mat4.create(), Math.PI / 50, 1, 0.1, 100);
        let eye = vec3.fromValues(0, 0, 50); // Eye position
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

        paramSets[thisParamSet].triSortingFunction(tris, totalElapsed);

        let idx = 0;
        tris.forEach(triangle => {
            let points = triangle.map(point => {
                let x = centerX + (point[0] / point[2]) * size;
                let y = centerY - (point[1] / point[2]) * size;
                return [x, y];
            });

            if (!elementsExist) {
                let polygon = document.createElementNS(SVG_NAMESPACE, "polygon");
                polygon.setAttribute("points", points.map(p => p.join(",")).join(" "));
                polygon.setAttribute("stroke", "#9E9E9E");
                polygon.setAttribute("fill", "white");
                polygon.setAttribute("stroke-linejoin", "round");

                g.appendChild(polygon);

                let circleX = centerX + (triangle.center[0] / triangle.center[2]) * size;
                let circleY = centerY - (triangle.center[1] / triangle.center[2]) * size;
                let circle = document.createElementNS(SVG_NAMESPACE, "circle");
                circle.setAttribute("cx", circleX);
                circle.setAttribute("cy", circleY);
                circle.setAttribute("r", "1px"); // Radius of the circle
                circle.setAttribute("fill", "white"); // Fill color of the circle
                circle.setAttribute("stroke", "#9E9E9E"); // Stroke color of the circle

                g.appendChild(circle);
            } else {
                let polygon = g.children[idx * 2];
                polygon.setAttribute("points", points.map(p => p.join(",")).join(" "));
                let circle = g.children[idx * 2 + 1];
                let circleX = centerX + (triangle.center[0] / triangle.center[2]) * size;
                let circleY = centerY - (triangle.center[1] / triangle.center[2]) * size;
                circle.setAttribute("cx", circleX);
                circle.setAttribute("cy", circleY);
            }
            idx++;
        });

        elementsExist = true;
    }
}

requestAnimationFrame(render);