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
let draggable = false;

let offsetFromDragX = 0;
let offsetFromDragY = 0;
let accumulatingRotationX = 0;
let accumulatingRotationY = 0;

class ParamSet {
    constructor(name, triSortingFunction) {
        this.name = name;
        this.triSortingFunction = triSortingFunction;
    }
}

paramSets = [
    new ParamSet("MovingTarget", (tris, totalElapsed) => {
        let target = vec3.fromValues(Math.cos(totalElapsed * 0.0005), Math.sin(totalElapsed * 0.0005), 0); // Down direction for sorting
        tris.sort((a, b) => {
            let aCenterDot = vec3.dot(a.normal, target);
            let bCenterDot = vec3.dot(b.normal, target);
            return aCenterDot - bCenterDot; // Sort by the dot product with the up vector (Y-axis)
        });
    }),
    new ParamSet("TopToBottom", (tris, totalElapsed) => {
        let down = vec3.fromValues(0, -1, 0);
        tris.sort((a, b) => {
            let aCenterDot = vec3.dot(a.center, down);
            let bCenterDot = vec3.dot(b.center, down);
            return aCenterDot - bCenterDot; // Sort by the dot product with the up vector (Y-axis)
        });
    }),
    new ParamSet("Equatorial", (tris, totalElapsed) => {
        let targetOne = vec3.fromValues(0, 1, 0);
        let targetTwo = vec3.fromValues(0, -1, 0);
        tris.sort((a, b) => {
            let aCenterDot = Math.min(vec3.dot(a.center, targetOne), vec3.dot(a.center, targetTwo));
            let bCenterDot = Math.min(vec3.dot(b.center, targetOne), vec3.dot(b.center, targetTwo));
            return aCenterDot - bCenterDot; // Sort by the dot product with the up vector (Y-axis)
        });
    }),
    new ParamSet("Antipodes", (tris, totalElapsed) => {
        let targetOne = vec3.fromValues(1, 0, 0);
        let targetTwo = vec3.fromValues(-1, 0, 0);
        tris.sort((a, b) => {
            let aCenterDot = Math.min(vec3.dot(a.center, targetOne), vec3.dot(a.center, targetTwo));
            let bCenterDot = Math.min(vec3.dot(b.center, targetOne), vec3.dot(b.center, targetTwo));
            return aCenterDot - bCenterDot; // Sort by the dot product with the up vector (Y-axis)
        });
    }),
    new ParamSet("CenterOut", (tris, totalElapsed) => {
        let target = vec3.fromValues(0, 0, 0);
        tris.sort((a, b) => {
            let aCenterDist = vec3.distance(a.center, target);
            let bCenterDist = vec3.distance(b.center, target);
            return aCenterDist - bCenterDist; // Sort by the dot product with the up vector (Y-axis)
        });
    }),
    new ParamSet("ModelOrder", (tris, totalElapsed) => {
        // no sorting needed
    }),
    new ParamSet("RightToLeft", (tris, totalElapsed) => {
        let target = vec3.fromValues(-1, 0, 0);
        tris.sort((a, b) => {
            let aCenterDot = vec3.dot(a.center, target);
            let bCenterDot = vec3.dot(b.center, target);
            return aCenterDot - bCenterDot; // Sort by the dot product with the up vector (Y-axis)
        });
    }),
    new ParamSet("LeftToRight", (tris, totalElapsed) => {
        let target = vec3.fromValues(1, 0, 0);
        tris.sort((a, b) => {
            let aCenterDot = vec3.dot(a.center, target);
            let bCenterDot = vec3.dot(b.center, target);
            return aCenterDot - bCenterDot; // Sort by the dot product with the up vector (Y-axis)
        });
    }),
    new ParamSet("BackToFront", (tris, totalElapsed) => {
        let target = vec3.fromValues(0, 0, -1);
        tris.sort((a, b) => {
            let aCenterDot = vec3.dot(a.center, target);
            let bCenterDot = vec3.dot(b.center, target);
            return aCenterDot - bCenterDot; // Sort by the dot product with the up vector (Y-axis)
        });
    }),
    new ParamSet("FrontToBack", (tris, totalElapsed) => {
        let target = vec3.fromValues(0, 0, 1);
        tris.sort((a, b) => {
            let aCenterDot = vec3.dot(a.center, target);
            let bCenterDot = vec3.dot(b.center, target);
            return aCenterDot - bCenterDot; // Sort by the dot product with the up vector (Y-axis)
        });
    }),
];

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
window.onload = function() {
    thisParamSet = 0;
    document.getElementById("currentAlgorithm").innerText = paramSets[thisParamSet].name;
    render(window.performance.now());
};

function handleLeftArrow() {
    thisParamSet = (thisParamSet - 1 + paramSets.length) % paramSets.length;
    document.getElementById("currentAlgorithm").innerText = paramSets[thisParamSet].name;
}

function handleRightArrow() {
    thisParamSet = (thisParamSet + 1) % paramSets.length;
    document.getElementById("currentAlgorithm").innerText = paramSets[thisParamSet].name;
}

document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowLeft") {
        handleLeftArrow();
    } else if (event.key === "ArrowRight") {
        handleRightArrow();
    }
});

function showMore() {
    let moreControls = document.getElementById("moreControls");
    moreControls.hidden = false;
    let showMoreButton = document.getElementById("showMoreButton");
    showMoreButton.hidden = true;
    let links = document.getElementById("links");
    links.hidden = true;

    draggable = true;
    svg.setAttribute("style", "z-index: auto;"); // Ensure the SVG is on top for dragging

    svg.addEventListener("mousedown", svgMousedownListener);
}

function undoShowMore() {
    let moreControls = document.getElementById("moreControls");
    moreControls.hidden = true;
    let showMoreButton = document.getElementById("showMoreButton");
    showMoreButton.hidden = false;
    let links = document.getElementById("links");
    links.hidden = false;

    svg.setAttribute("style", "z-index: -1;"); // Reset z-index to default when hiding more controls

    let backgroundButton = document.getElementById("backgroundButton");
    backgroundButton.checked = false; // Reset background to white when hiding more controls
    handleBackgroundButton();

    draggable = false;

    svg.removeEventListener("mousedown", svgMousedownListener);
}

function handleBackgroundButton() {
    let backgroundButton = document.getElementById("backgroundButton");
    if (backgroundButton.checked) {
        svg.setAttribute("style", "background-color: black;");
    } else {
        svg.setAttribute("style", "background-color: none;");
    }
    document.body.setAttribute("style", "color: " + (backgroundButton.checked ? "white" : "auto") + ";");
}


function svgMousedownListener (event) {
    if (draggable) {
        let offsetX = event.clientX - svg.getBoundingClientRect().left;
        let offsetY = event.clientY - svg.getBoundingClientRect().top;
        let originalOffsetFromDragX = offsetFromDragX;
        let originalOffsetFromDragY = offsetFromDragY;
        let rotDirection = null

        function drag(event) {
            let x = event.clientX - offsetX;
            let y = event.clientY - offsetY;
            if (rotDirection == null && Math.max(Math.abs(x), Math.abs(y)) > 10) {
                if (Math.abs(x) > Math.abs(y)) {
                    rotDirection = "x"; // More horizontal movement, adjust X rotation
                } else {
                    rotDirection = "y"; // More vertical movement, adjust Y rotation
                }
            }
            if (rotDirection === "x") {
                offsetFromDragX = originalOffsetFromDragX - x * 0.001; // Adjust X rotation based on mouse movement
            } else {
                offsetFromDragY = originalOffsetFromDragY - y * 0.001;
            }
        }

        function drop() {
            document.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", drop);
        }

        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", drop);
    }
}

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

        if (document.getElementById("rotate").checked) {
            accumulatingRotationX += elapsed * 0.00005;
        }
        if (document.getElementById("rotateY").checked) {
            accumulatingRotationY += elapsed * 0.00005;
        }

        let rotationTheta = offsetFromDragX + accumulatingRotationX; // Rotation speed

        let rotationX = mat4.fromRotation(mat4.create(), rotationTheta, [0, 1, 0]);

        let rotateY = mat4.fromRotation(mat4.create(), offsetFromDragY + accumulatingRotationY, [1, 0, 0]);

        let rotation = mat4.multiply(mat4.create(), rotationX, rotateY);

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
            return new MyTriangle(vertex1, vertex2, vertex3, triangle);
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

                let colorCheckbox = document.getElementById("showColor");
                let hueCheckbox = document.getElementById("showHue");
                let invertCheckbox = document.getElementById("invert");
                let originalCenter = triangle.original.center; // vec3

                let hue = 0;
                let saturation = 0;
                let lightness = 100;

                if (hueCheckbox.checked) {
                    hue = Math.floor((Math.atan2(originalCenter[1], originalCenter[0]) + Math.PI) / (2 * Math.PI) * 360);
                    saturation = 100;
                    if (!colorCheckbox.checked) {
                        lightness = 50;
                    }
                }

                if (colorCheckbox.checked) {
                    lightness = map(idx, 0, tris.length, 100, 0);
                }

                if (invertCheckbox.checked) {
                    lightness = 100 - lightness;
                }

                polygon.setAttribute("fill", "hsl(" + hue + ", " + saturation + "%, " + lightness + "%)")

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

function map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

requestAnimationFrame(render);