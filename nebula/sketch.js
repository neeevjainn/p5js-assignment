/*
 * @name Dynamic Rotating Nebula
 * @description A generative sketch creating a 3D-like rotating cloud of particles.
 * The density, speed, and color palette are easily controlled by variables.
 * Modifications: Adjusted canvas size, implemented color palette change, 
 * introduced mouseX control for rotation speed, and used a complex loop 
 * to create particle effect.
 */

// --- Variables to Modify ---

const NUM_POINTS = 500;           // Controls the density of the cloud (Experiment with 100 to 1000)
const RADIUS = 200;               // Controls the overall size/spread of the cloud
const ROTATION_SPEED_BASE = 0.005; // Base speed of rotation

// --- Color Variables ---
let PRIMARY_COLOR;
let SECONDARY_COLOR;
let BACKGROUND_HUE = 220; // Dark Blue/Purple Background

let particles = [];
let angle = 0; // Global rotation angle

function setup() {
  // 🖼️ Canvas Size Modification
  createCanvas(800, 600); 
  
  // 🎨 Enable HSB (Hue, Saturation, Brightness) for vibrant colors
  colorMode(HSB, 360, 100, 100);
  background(BACKGROUND_HUE, 80, 10); // Dark background

  // Define the particle colors
  PRIMARY_COLOR = color(300, 80, 90); // Pink/Magenta
  SECONDARY_COLOR = color(180, 70, 90); // Cyan/Aqua

  // Initialize particles with random positions within the radius
  for (let i = 0; i < NUM_POINTS; i++) {
    particles.push({
      // Random angle (0 to 360)
      a: random(TWO_PI),
      // Random distance from the center
      r: random(RADIUS * 0.1, RADIUS), 
      // Z-depth for scaling effect
      z: random(10, 500), 
      // Unique speed modifier for twinkling/jittering
      speedMod: random(0.5, 1.5) 
    });
  }
  
  // No stroke, we want filled circles
  noStroke(); 
}

function draw() {
  // Draw a semi-transparent background over the previous frame
  // This creates the desired trailing/smear effect (essential for "nebula")
  fill(BACKGROUND_HUE, 80, 10, 0.1); 
  rect(0, 0, width, height);

  // 🖱️ Mouse Interaction for Rotation Speed
  // Map mouseX to control rotation speed, adding a dynamic feel
  let mouseRotation = map(mouseX, 0, width, 0.0, 0.02);
  angle += ROTATION_SPEED_BASE + mouseRotation; 

  // Move the coordinate system to the center of the canvas
  translate(width / 2, height / 2);

  for (let i = 0; i < NUM_POINTS; i++) {
    let p = particles[i];

    // 🔄 Update Z-depth for 3D effect
    p.z -= p.speedMod * 2; 
    if (p.z < 1) {
      p.z = 500; // Reset particle when it moves past the viewer
      p.r = random(RADIUS * 0.1, RADIUS); // Reset distance
    }

    // Calculate projected 2D coordinates
    // We divide by 'p.z' to simulate perspective (closer = larger/faster)
    let projectedR = p.r / p.z * 500;
    
    // Calculate final position based on rotation angle (angle + particle's initial angle)
    let x = projectedR * cos(p.a + angle);
    let y = projectedR * sin(p.a + angle);

    // Calculate size and color based on Z-depth
    let size = map(p.z, 1, 500, 8, 0.5); // Closer particles are larger (8px max)
    let colorMix = map(p.z, 1, 500, 0, 1); // Closer is color 1, farther is color 2

    // Apply color interpolation
    let mixedColor = lerpColor(PRIMARY_COLOR, SECONDARY_COLOR, colorMix);
    fill(mixedColor);

    // Draw the particle
    circle(x, y, size);
  }
}

// ⌨️ Optional: Press spacebar to freeze the rotation
function keyPressed() {
  if (key === ' ') {
    if (isLooping()) {
      noLoop(); // Pause animation
      console.log('Animation Paused');
    } else {
      loop(); // Resume animation
      console.log('Animation Resumed');
    }
  }
}