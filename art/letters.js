let svg = document.getElementById("lettersSvg");
svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

let canvas = document.getElementById("lettersCanvas");

let startTime;
let stop = false;
let fps = 30;
let fpsInterval = 1000 / fps;
let then;
let now;

window.onload = function() {
    render(window.performance.now());
}

svg.onresize = function() {
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

        svg.setAttribute("width", svg.clientWidth);
        svg.setAttribute("height", svg.clientHeight);
        svg.setAttribute("stroke-width", "0.03rem");

        // Update the viewBox to match the new width and height
        let viewBox = `0 0 ${svg.clientWidth} ${svg.clientHeight}`;
        svg.setAttribute("viewBox", viewBox);

        canvas.setAttribute("width", svg.clientWidth);
        canvas.setAttribute("height", svg.clientHeight);
        // Clear the canvas
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let centerX = svg.clientWidth / 2;
        let centerY = svg.clientHeight / 2;

        // Clear previous content
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        let g = document.createElementNS(SVG_NAMESPACE, "g");
        svg.appendChild(g);

        let canvasCircleCenterX = centerX + Math.sin(elapsed * 0.0001) * (Math.min(svg.clientWidth, svg.clientHeight) / 3);
        let canvasCircleCenterY = centerY + Math.cos(elapsed * 0.0001) * (Math.min(svg.clientWidth, svg.clientHeight) / 3);
        ctx.beginPath();
        ctx.arc(canvasCircleCenterX, canvasCircleCenterY, Math.min(svg.clientWidth, svg.clientHeight) / 6, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.strokeStyle = "black";
        ctx.fill();

        // draw a grid of 75 x 60 circles spread evenly across the entire svg ares
        let numRows = 75;
        let numCols = 60;
        let circleRadius = 3; // Radius of each circle
        let circleSpacingX = (svg.clientWidth - 2 * circleRadius) / (numCols - 1);
        let circleSpacingY = (svg.clientHeight - 2 * circleRadius) / (numRows - 1);
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                let x = circleRadius + col * circleSpacingX;
                let y = circleRadius + row * circleSpacingY;
                let circle = document.createElementNS(SVG_NAMESPACE, "circle");
                circle.setAttribute("cx", x);
                circle.setAttribute("cy", y);
                circle.setAttribute("r", circleRadius);

                // get the color from the canvas at this position
                let imageData = ctx.getImageData(x - circleRadius, y - circleRadius, circleRadius * 2, circleRadius * 2);
                if (imageData.data[3] === 0) {
                    // if the circle is transparent, make it white
                    circle.setAttribute("fill", "blue");
                } else {
                    circle.setAttribute("fill", "red");
                }

                g.appendChild(circle);
            }
        }
    }
}