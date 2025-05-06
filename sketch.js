let tableSize = 400;
let cupX, cupY, secondCupX, secondCupY;
let coffeeLevel = 1, secondCoffeeLevel = 1;
let startTime;
let steamParticles = [], secondSteamParticles = [];
let shadowOffsetX = 0, shadowOffsetY = 0;

let ashtrayX, ashtrayY;
let smokeParticles = [];

let cigPackX, cigPackY;
let cigarettes = []; // Declare cigarettes array here
let draggedCig = null;
let flapAngle = 0;

let skipButton;
let skipToFivePM = false;

let cards = []; // Array to hold card objects
let cardWidth = 40, cardHeight = 60;


function setup() {
  createCanvas(600, 600);
  pixelDensity(1);
  cupX = width / 2 - 50;
  cupY = height / 2;
  secondCupX = width / 2 + 50;
  secondCupY = height / 2;
  ashtrayX = width / 2 + 80;
  ashtrayY = height / 2 + 80;
  cigPackX = width / 2 - 150;
  cigPackY = height / 2 + 80;
  startTime = millis();
  noStroke();

  // Button to skip to 5 PM
  skipButton = createButton('Skip to 5 PM');
  skipButton.position(60, 120);
  skipButton.mousePressed(() => skipToFivePM = true);

  // Adjusting cigarette pack
  let cigPackWidth = 10; // Reduced width
  let cigSpacing = 2;    // Closer spacing between cigarettes

  // Adjust positions of cigarettes to fit into the new pack width
  for (let i = 0; i < 6; i++) {
    let cx = cigPackX + cigSpacing + i * cigPackWidth; // Tightened positions
    let cy = cigPackY + 2.3;  // Adjusted vertical position to move the cigs up
    cigarettes.push(new Cigarette(cx, cy)); // Pushing Cigarette objects into the array
  }
}

function draw() {
  let elapsedTime = (millis() - startTime) / 1000;
  let timeOfDay = (elapsedTime / 120) % 1;

  // If the button is pressed, jump to 5 PM (0.708)
  if (skipToFivePM) {
    timeOfDay = 0.708;
  }

  drawBackground(timeOfDay);
  drawTable();
  drawShadow(timeOfDay);

  // Draw Negronis after 5 PM (5:00 PM = 0.708 of a day)
  if (timeOfDay >= 0.708) {
    drawNegroni(cupX, cupY, coffeeLevel);  // Negroni replaces coffee cup
    drawNegroni(secondCupX, secondCupY, secondCoffeeLevel); // Same for second cup
    updateNegroniLevel();
    drawCards(); // Draw the playing cards when Negronis appear
    drawOppositeCards(); // Draw the second set of playing cards on the opposite side
    steamParticles = [];
    secondSteamParticles = [];
  } else {
    drawCoffeeCup();
    drawSecondCoffeeCup();
    updateSteam(); // Keep updating steam before 5 PM
    updateSecondSteam();
  }

  updateSteam();
  updateSecondSteam();
  drawAshtray();
  drawCigarettePack();

  let hoveringPack = mouseX > cigPackX - 5 && mouseX < cigPackX + 105 &&
                     mouseY > cigPackY - 10 && mouseY < cigPackY + 50;
  if (hoveringPack && flapAngle < PI / 5) {
    flapAngle += 0.02;
  } else if (!hoveringPack && flapAngle > 0) {
    flapAngle -= 0.02;
  }

  for (let cig of cigarettes) {
    cig.update();
    cig.display();
  }

  updateSmoke();

  coffeeLevel = max(0, 1 - timeOfDay);
  secondCoffeeLevel = max(0, 1 - timeOfDay);
}

function drawNegroni(x, y, level) {
  // Negroni glass (simplified for now)
  fill(200, 30, 30); // Red color for the Negroni
  ellipse(x, y, 60, 60); // Glass outline

  fill(255, 50, 50, 200); // Semi-transparent red for the drink
  ellipse(x, y, 50, 50); // Glass contents

  fill(255, 255, 255, 100); // Ice cubes (simple squares)
  rect(x - 10, y - 5, 8, 8);
  rect(x + 5, y + 5, 8, 8);
}
function drawCards() {
  // Position of the cards on the table
  let cardX = width / 2 - 100;
  let cardY = height / 2 + 50;

  // Draw 3 cards near the cups
  for (let i = 0; i < 3; i++) {
    fill(255);
    rect(cardX + i * (cardWidth + 10), cardY, cardWidth, cardHeight, 5);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("A", cardX + i * (cardWidth + 10) + cardWidth / 2, cardY + cardHeight / 2); // "A" for Ace
  }
}
function drawOppositeCards() {
  // Position of the cards on the opposite side of the table 
  let cardX = width / 5 + 50;
  let cardY = height / 5 + 50;

  // Draw 3 cards near the second cup, mirrored across the table
  for (let i = 0; i < 3; i++) {
    fill(255);
    rect(cardX + i * (cardWidth + 10), cardY, cardWidth, cardHeight, 5);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("K", cardX + i * (cardWidth + 10) + cardWidth / 2, cardY + cardHeight / 2); // "K" for King
  }
}
function drawBackground(t) {
  let morning = color(220, 230, 255);
  let noon = color(255, 255, 240);
  let evening = color(255, 180, 120);
  let night = color(30, 20, 50);

  let bg;
  if (t < 0.25) bg = lerpColor(night, morning, t * 4);
  else if (t < 0.5) bg = lerpColor(morning, noon, (t - 0.25) * 4);
  else if (t < 0.75) bg = lerpColor(noon, evening, (t - 0.5) * 4);
  else bg = lerpColor(evening, night, (t - 0.75) * 4);

  background(bg);
}

function drawTable() {
  fill(180, 30, 30);
  ellipse(width / 2, height / 2, tableSize, tableSize);
}

function drawCoffeeCup() {
  fill(255, 235, 150);
  ellipse(cupX, cupY, 60, 60);
  fill(180, 200, 220);
  ellipse(cupX, cupY, 50, 50);
  fill(80, 40, 20, 200);
  ellipse(cupX, cupY + 5, 45, 30 * coffeeLevel);
  noFill();
  stroke(255, 235, 150);
  strokeWeight(3);
  arc(cupX + 25, cupY - 5, 20, 20, -PI / 4, PI / 2);
  noStroke();
}

function drawSecondCoffeeCup() {
  fill(180, 200, 220);
  ellipse(secondCupX, secondCupY, 60, 60);
  fill(255, 235, 150);
  ellipse(secondCupX, secondCupY, 50, 50);
  fill(80, 40, 20, 200);
  ellipse(secondCupX, secondCupY + 5, 45, 30 * secondCoffeeLevel);
  noFill();
  stroke(180, 200, 220);
  strokeWeight(3);
  arc(secondCupX + 25, secondCupY - 5, 20, 20, -PI / 4, PI / 2);
  noStroke();
}

let shadowSpeed = 0.02; // Add a shadow speed for smoothness
let shadowTargetX = 0, shadowTargetY = 0;

function drawShadow(t) {
  let angle = TWO_PI * t;

  // Smoothly interpolate the shadow position
  shadowTargetX = cos(angle) * 30;
  shadowTargetY = sin(angle) * 30;

  // Interpolate shadow movement
  shadowOffsetX += (shadowTargetX - shadowOffsetX) * shadowSpeed;
  shadowOffsetY += (shadowTargetY - shadowOffsetY) * shadowSpeed;

  let shadowX = cupX + shadowOffsetX;
  let shadowY = cupY + shadowOffsetY;
  let opacity = map(sin(angle), -1, 1, 40, 100);

  push();
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
  fill(0, opacity);
  ellipse(shadowX, shadowY, 70, 30);
  drawingContext.shadowBlur = 0;
  pop();

  let secondShadowX = secondCupX + shadowOffsetX;
  let secondShadowY = secondCupY + shadowOffsetY;
  fill(0, opacity);
  ellipse(secondShadowX, secondShadowY, 70, 30);
    
  // Ashtray shadow
  let ashtrayShadowX = ashtrayX + shadowOffsetX;
  let ashtrayShadowY = ashtrayY + shadowOffsetY;
  fill(0, opacity);
  ellipse(ashtrayShadowX, ashtrayShadowY, 85, 35);

  // Cigarette pack shadow
  let cigPackShadowX = cigPackX + shadowOffsetX + 20; // center the shadow roughly
  let cigPackShadowY = cigPackY + shadowOffsetY + 25; // adjust for vertical center
  fill(0, opacity);
  rect(cigPackShadowX, cigPackShadowY, 70, 20, 5);
}


function drawAshtray() {
  fill(120);
  ellipse(ashtrayX, ashtrayY, 80, 30);
  fill(100);
  ellipse(ashtrayX, ashtrayY + 5, 75, 10);
}

function drawCigarettePack() {
  push();
  translate(cigPackX, cigPackY);

  // Adjusting the pack width to fit the 6 cigarettes that are now closer together
  let cigPackWidth = 10 * 6 + 5; // 6 cigarettes, 10 units wide, with a small gap
  let cigPackHeight = 50;

  // Draw the outer body of the pack
  fill(220);
  rect(-5, -5, cigPackWidth, cigPackHeight, 5); // Width adjusted to match cigarettes

  // Draw the top part of the pack
  fill(160, 50, 50);
  rect(-5, -10, cigPackWidth, 10); // Keep the top the same width as the pack

  // Draw the flap of the pack
  push();
  translate(cigPackWidth, -5);
  rotate(-flapAngle);
  fill(200, 80, 80);
  rect(-cigPackWidth, -5, cigPackWidth, 10); // Width adjusted to match pack size
  pop();

  pop();
}

function updateSteam() {
  if (coffeeLevel > 0 && frameCount % 5 === 0 && random() < coffeeLevel) {
    steamParticles.push(new SteamLine(cupX, cupY - 30, coffeeLevel));
  }

  for (let i = steamParticles.length - 1; i >= 0; i--) {
    let p = steamParticles[i];
    p.update();
    p.display();
    if (p.isFinished()) steamParticles.splice(i, 1);
  }
}

function updateSecondSteam() {
  if (secondCoffeeLevel > 0 && frameCount % 5 === 0 && random() < secondCoffeeLevel) {
    secondSteamParticles.push(new SteamLine(secondCupX, secondCupY - 30, secondCoffeeLevel));
  }

  for (let i = secondSteamParticles.length - 1; i >= 0; i--) {
    let p = secondSteamParticles[i];
    p.update();
    p.display();
    if (p.isFinished()) secondSteamParticles.splice(i, 1);
  }
}

function updateSmoke() {
  for (let cig of cigarettes) {
    if (cig.lit && cig.burnAmount < 1 && frameCount % 5 === 0) {
      let tipY = cig.y + cig.length * (1 - cig.burnAmount);
      smokeParticles.push(new Smoke(cig.x, tipY - 2));
    }
  }

  for (let i = smokeParticles.length - 1; i >= 0; i--) {
    let s = smokeParticles[i];
    s.update();
    s.display();
    if (s.isFinished()) smokeParticles.splice(i, 1);
  }
}

function updateNegroniLevel() {
  coffeeLevel = max(0, coffeeLevel - 0.001);
  secondCoffeeLevel = max(0, secondCoffeeLevel - 0.001);
}


function mousePressed() {
  for (let cig of cigarettes) {
    if (!cig.dragged && dist(mouseX, mouseY, cig.x, cig.y) < 10) {
      draggedCig = cig;
      cig.dragged = true;
      break;
    }
  }

  for (let cig of cigarettes) {
    let tipY = cig.y + cig.length * (1 - cig.burnAmount);
    if (dist(mouseX, mouseY, cig.x, tipY) < 10 && cig.dragged && !cig.lit) {
      cig.lit = true;
    }
  }
}

function mouseDragged() {
  if (draggedCig) {
    draggedCig.x = mouseX;
    draggedCig.y = mouseY;
  }
}

function mouseReleased() {
  draggedCig = null;
}

// --- Classes ---
class SteamLine {
  constructor(x, y, level) {
    this.x = x + random(-5, 5);
    this.y = 290;
    this.opacity = 100 * level;
    this.level = level;
    this.curve = random(-0.5, 0.5);
    this.offset = 0;
  }
  update() {
    this.y -= 0.3;
    this.x += this.curve;
    this.offset += 0.05;
    this.opacity -= 1.0;
  }
  display() {
    noFill();
    stroke(255, this.opacity);
    strokeWeight(map(this.level, 0, 1, 0.2, 1.2));
    beginShape();
    for (let i = 0; i < 10; i++) {
      let px = this.x + sin(this.offset + i * 0.2) * 2;
      let py = this.y - i * 3;
      vertex(px, py);
    }
    endShape();
  }
  isFinished() {
    return this.opacity <= 0;
  }
}

class Smoke {
  constructor(x, y) {
    this.x = x + random(-2, 2);
    this.y = y;
    this.opacity = 100;
    this.size = random(3, 6);
  }
  update() {
    this.y -= 0.5;
    this.x += random(-0.4, 0.4);
    this.opacity -= 1;
    this.size += 0.05;
  }
  display() {
    noFill();
    stroke(255, this.opacity);
    strokeWeight(1);
    ellipse(this.x, this.y, this.size, this.size);
  }
  isFinished() {
    return this.opacity <= 0;
  }
}

class Cigarette {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.length = 40;
    this.burnAmount = 0;
    this.lit = false;
    this.dragged = false;
  }

  update() {
    if (this.lit) {
      this.burnAmount = min(1, this.burnAmount + 0.0006);
    }
  }

  display() {
    let burnY = this.y + this.length * (1 - this.burnAmount);
    fill(255);
    rect(this.x - 3, this.y, 6, this.length * (1 - this.burnAmount));
    fill(this.burnAmount < 0.95 ? color(255, 100, 0) : color(139, 69, 19));
    ellipse(this.x, burnY, 5, 5);
  }
}