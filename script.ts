const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 500;

let score = 0;
let gameFrame = 0;
ctx.font = '50px Georgia';

// Mouse interactivity
let canvasPosition = canvas.getBoundingClientRect();
interface Mouse {
  x: number;
  y: number;
  click: boolean;
}
const mouse: Mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  click: false
};

canvas.addEventListener('mousemove', (e: MouseEvent) => {
  mouse.click = true;
  mouse.x = e.x - canvasPosition.left;
  mouse.y = e.y - canvasPosition.top;
});
window.addEventListener('mouseup', () => {
  mouse.click = false;
});

// Player
const playerLeft = new Image();
playerLeft.src = 'fish-swim-left.png';
const playerRight = new Image();
playerRight.src = 'fish-swim-right.png';

class Player {
  x: number;
  y: number;
  radius: number;
  angle: number;
  frameX: number;
  frameY: number;
  frame: number;
  spriteWidth: number;
  spriteHeight: number;
  moving: boolean = false;

  constructor() {
    this.x = canvas.width;
    this.y = canvas.height / 2;
    this.radius = 50;
    this.angle = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.frame = 0;
    this.spriteWidth = 160;
    this.spriteHeight = 105;
  }

  update(): void {
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;

    if (mouse.x !== this.x) {
      this.x -= dx / 20;
      this.moving = true;
    }
    if (mouse.y !== this.y) {
      this.y -= dy / 20;
      this.moving = true;
    }

    if (this.x < 0) this.x = 0;
    if (this.x > canvas.width) this.x = canvas.width;
    if (this.y < 50) this.y = 50;
    if (this.y > canvas.height) this.y = canvas.height;

    this.angle = Math.atan2(dy, dx);
  }

  draw(): void {
    if (mouse.click) {
      ctx.lineWidth = 0.2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    }

    if (gameFrame % 10 === 0) {
      this.frame++;
      if (this.frame >= 12) this.frame = 0;

      if (this.frame === 3 || this.frame === 7 || this.frame === 11) {
        this.frameX = 0;
      } else {
        this.frameX++;
      }

      if (this.frame < 3) {
        this.frameY = 0;
      } else if (this.frame < 7) {
        this.frameY = 1;
      } else if (this.frame < 11) {
        this.frameY = 2;
      } else {
        this.frameY = 0;
      }
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const sprite = this.x >= mouse.x ? playerLeft : playerRight;
    ctx.drawImage(
      sprite,
      this.frameX * this.spriteWidth,
      this.frameY * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      -60,
      -45,
      this.spriteWidth * 0.8,
      this.spriteHeight * 0.8
    );
    ctx.restore();
  }
}
const player = new Player();

// Bubbles
const bubblesArray: Bubble[] = [];
const bubbleImg = new Image();
bubbleImg.src = 'pop2.png';

class Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  distance: number = 0;
  sound: string;
  counted: boolean = false;
  frameX: number = 0;
  spriteWidth: number = 91;
  spriteHeight: number = 91;
  pop: boolean = false;

  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = -50 - Math.random() * canvas.height / 2;
    this.radius = 50;
    this.speed = Math.random() * -5 + -1;
    this.sound = Math.random() <= 0.5 ? 'sound1' : 'sound2';
  }

  update(): void {
    this.y -= this.speed;
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    this.distance = Math.sqrt(dx * dx + dy * dy);
  }

  draw(): void {
    ctx.drawImage(
      bubbleImg,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x - 68,
      this.y - 68,
      this.spriteWidth * 1.5,
      this.spriteHeight * 1.5
    );
  }
}

function handleBubbles(): void {
  for (let i = bubblesArray.length - 1; i >= 0; i--) {
    if (bubblesArray[i].y > canvas.height * 2) {
      bubblesArray.splice(i, 1);
    }
  }

  for (let i = 0; i < bubblesArray.length; i++) {
    if (bubblesArray[i].distance < bubblesArray[i].radius + player.radius) {
      popAndRemove(i);
    }
  }

  for (let i = 0; i < bubblesArray.length; i++) {
    bubblesArray[i].update();
    bubblesArray[i].draw();
  }

  if (gameFrame % 50 === 0) {
    bubblesArray.push(new Bubble());
  }
}

function popAndRemove(i: number): void {
  const bubble = bubblesArray[i];
  if (bubble) {
    if (!bubble.counted) score++;
    bubble.counted = true;
    bubble.frameX++;
    if (bubble.frameX > 7) bubble.pop = true;
    if (bubble.pop) bubblesArray.splice(i, 1);
  }
}

/**** TEXT IN BUBBLES ***/
interface Particle {
  x: number;
  y: number;
  size: number;
  baseX: number;
  baseY: number;
  density: number;
  distance: number;
  draw(): void;
  update(): void;
}
let bubbleTextArray: Particle[] = [];

let adjustX = -3;
let adjustY = -3;

ctx.fillStyle = 'white';
ctx.font = '17px Verdana';
ctx.fillText('DANIEL', 20, 42);

const textCoordinates = ctx.getImageData(0, 0, 100, 100);

class Particle2 implements Particle {
  x: number;
  y: number;
  size: number;
  baseX: number;
  baseY: number;
  density: number;
  distance: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.size = 7;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = Math.random() * 15 + 1;
  }

  draw(): void {
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(34,147,214,1)';
    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.beginPath();

    if (this.distance < 50) {
      this.size = 14;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(this.x + 4, this.y - 4, this.size / 3, 0, Math.PI * 2);
      ctx.arc(this.x - 6, this.y - 6, this.size / 5, 0, Math.PI * 2);
    } else if (this.distance <= 80) {
      this.size = 8;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(this.x + 3, this.y - 3, this.size / 2.5, 0, Math.PI * 2);
      ctx.arc(this.x - 4, this.y - 4, this.size / 4.5, 0, Math.PI * 2);
    } else {
      this.size = 5;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(this.x + 1, this.y - 1, this.size / 3, 0, Math.PI * 2);
    }

    ctx.closePath();
    ctx.fill();
  }

  update(): void {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.distance = distance;

    const forceDirectionX = dx / distance;
    const forceDirectionY = dy / distance;
    const maxDistance = 100;
    const force = (maxDistance - distance) / maxDistance;
    const directionX = forceDirectionX * force * this.density;
    const directionY = forceDirectionY * force * this.density;

    if (distance < 100) {
      this.x -= directionX;
      this.y -= directionY;
    } else {
      if (this.x !== this.baseX) {
        const dx = this.x - this.baseX;
        this.x -= dx / 20;
      }
      if (this.y !== this.baseY) {
        const dy = this.y - this.baseY;
        this.y -= dy / 20;
      }
    }
  }
}

function init2(): void {
  bubbleTextArray = [];
  for (let y = 0; y < textCoordinates.height; y++) {
    for (let x = 0; x < textCoordinates.width; x++) {
      const alpha = textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3];
      if (alpha > 128) {
        const positionX = x + adjustX;
        const positionY = y + adjustY;
        bubbleTextArray.push(new Particle2(positionX * 8, positionY * 8));
      }
    }
  }
}
init2();

/** animation loop **/
function animate(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bubbleTextArray.forEach(particle => {
    particle.draw();
    particle.update();
  });

  handleBubbles();
  player.update();
  player.draw();

  ctx.font = '20px Georgia';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('score: ' + score, 141, 336);
  ctx.fillStyle = 'rgba(34,147,214,1)';
  ctx.fillText('score: ' + score, 140, 335);

  gameFrame++;
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  canvasPosition = canvas.getBoundingClientRect();
  mouse.x = canvas.width / 2;
  mouse.y = canvas.height / 2;
});
