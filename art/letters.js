let svg = document.getElementById("lettersSvg");
svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

let startTime;
let stop = false;
let fps = 60;
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

        let centerX = svg.clientWidth / 2;
        let centerY = svg.clientHeight / 2;

        // Clear previous content
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        let g = document.createElementNS(SVG_NAMESPACE, "g");
        svg.appendChild(g);


        let circle = document.createElementNS(SVG_NAMESPACE, "circle");
        circle.setAttribute("cx", centerX);
        circle.setAttribute("cy", centerY);
        circle.setAttribute("r", Math.min(svg.clientWidth, svg.clientHeight) / 3);
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke", "black");
        circle.setAttribute("stroke-width", "0.03rem");
        g.appendChild(circle);


    }
}