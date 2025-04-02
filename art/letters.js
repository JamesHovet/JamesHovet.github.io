let svg = document.getElementById("lettersSvg");
svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

let canvas = document.getElementById("lettersCanvas");

let startTime;
let stop = false;
let fps = 30;
let fpsInterval = 1000 / fps;
let then = window.performance.now();
let now;
let totalElapsed = 0;

window.onload = function() {
    render(window.performance.now());
}

svg.onresize = function() {
    render(window.performance.now());
}

const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
let lettersIndex = -1; // Start with the first letter

let currentPositionInitialized = false;
let currX = 0;
let currY = 0;
let oldX = 0;
let oldY = 0;
let direction_radians = 0;

let lines_to_draw = 8000;
let lines_drawn = 0;
let walk_magnitude = (5.0 / 600.0) * svg.clientWidth; // The distance to move in each step
let lines_to_draw_per_frame = 100;
let time_to_wait_until = 0;


let g = null;

function render(timestamp) {
    if (stop) {
        return;
    }

    requestAnimationFrame(render);

    now = timestamp;
    const elapsed = now - then;

    function drawLetter(ctx, centerX, centerY) {
        ctx.font = "bold 650px 'Times New Roman'";
        ctx.fillStyle = "black"; // Set the fill color to black
        ctx.textAlign = "center"; // Center the text horizontally
        ctx.textBaseline = "middle"; // Center the text vertically
        ctx.fillText(letters[lettersIndex], centerX, centerY); // Draw the letter A at the center of the canvas
    }

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval); // Reset the start time for the next interval
        totalElapsed += elapsed;

        svg.setAttribute("width", svg.clientWidth);
        svg.setAttribute("height", svg.clientHeight);
        svg.setAttribute("stroke-width", "0.03rem");

        // Update the viewBox to match the new width and height
        let viewBox = `0 0 ${svg.clientWidth} ${svg.clientHeight}`;
        svg.setAttribute("viewBox", viewBox);

        canvas.setAttribute("width", svg.clientWidth);
        canvas.setAttribute("height", svg.clientHeight);
        // Clear the canvas
        let ctx = canvas.getContext("2d", {willReadFrequently: true});
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let centerX = svg.clientWidth / 2;
        let centerY = svg.clientHeight / 2;

        if (!currentPositionInitialized || lines_drawn >= lines_to_draw) {
            lettersIndex = (lettersIndex + 1) % letters.length; // Move to the next letter

            drawLetter(ctx, centerX, centerY);

            // Clear previous content
            while (svg.firstChild) {
                svg.removeChild(svg.firstChild);
            }

            g = document.createElementNS(SVG_NAMESPACE, "g");
            svg.appendChild(g);
            lines_drawn = 0;

            while (true) {
                let newX = Math.random() * svg.clientWidth; // Random X position within the canvas
                let newY = Math.random() * svg.clientHeight; // Random Y position within the canvas
                // Check if the new position is within a black pixel on the canvas
                let imageData = ctx.getImageData(newX, newY, 1, 1).data;
                let isOnTopOfBlack = !(imageData[3] === 0); // Check if the pixel is not transparent
                if (isOnTopOfBlack) {
                    currX = newX;
                    currY = newY;
                    break; // Found a valid starting position
                }
            }
            oldX = currX;
            oldY = currY;
            direction_radians = Math.random() * 2 * Math.PI; // Random initial direction

            currentPositionInitialized = true;
            return;
        }

        drawLetter(ctx, centerX, centerY); // Draw the current letter at the current position

        for (let i = 0; i < lines_to_draw_per_frame; i++) {
            let tries = 0;
            while (true) {
                let new_direction = gauss(direction_radians, Math.PI / 4); // Random direction with some noise
                let newX = currX + Math.cos(new_direction) * walk_magnitude; // Move in the new direction
                let newY = currY + Math.sin(new_direction) * walk_magnitude; // Move in the new direction
                // Check if the new position is within a black pixel on the canvas
                let imageData = ctx.getImageData(newX, newY, 1, 1).data;
                let isOnTopOfBlack = !(imageData[3] === 0);
                if (isOnTopOfBlack) {
                    oldX = currX;
                    oldY = currY;
                    currX = newX;
                    currY = newY;
                    direction_radians = new_direction; // Update the direction
                    break;
                }
                tries++;
                if (tries > 100) {
                    direction_radians = gauss(direction_radians, Math.PI / 2); // If too many tries, change direction significantly
                }
                if (tries > 500) {
                    console.log("Too many tries, stopping the walk.");
                    stop = true; // Stop the walk if we can't find a valid position
                    return;
                }
            }

            // draw the line on the svg
            let line = document.createElementNS(SVG_NAMESPACE, "line");
            line.setAttribute("x1", oldX);
            line.setAttribute("y1", oldY);
            line.setAttribute("x2", currX);
            line.setAttribute("y2", currY);
            line.setAttribute("stroke", "black");
            g.appendChild(line);

            lines_drawn += 1;
        }
    } else {
        console.log("waiting");
    }
}

function gauss(mean, stddev) {
    let u1 = 1 - Math.random(); // Uniform(0,1) random doubles
    let u2 = 1 - Math.random();
    let randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) *
        Math.sin(2.0 * Math.PI * u2); // Box-Muller transform
    return mean + stddev * randStdNormal; // Transform to desired mean and stddev
}