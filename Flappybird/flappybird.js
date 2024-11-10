// Game settings
let board;
let boardWidth;
let boardHeight;
let context;

// Bird settings (will be dynamically set later)
let birdWidth;
let birdHeight;
let birdX;
let birdY;
let birdImg;
let birdFlyImg; // Image for when the bird jumps (flapping)
let bird = {};
let canJump = true; // Debounce flag to prevent multiple jumps
let spriteInterval;
let isFlapping = false; // Track whether we are on the 'flap' sprite

// Roof barrier setting
let roofHeight = 0; // Roof barrier position (top of the screen)

// Pipe settings
let pipeArray = [];
let pipeWidth;
let pipeHeight;
let pipeX;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Floor settings
let floorHeight;
let floorY;

// Physics settings
let velocityX;
let velocityY = 0; // bird jump speed
let gravity;
let jumpVelocity;
let maxFallSpeed;

let gameOver = false;
let score = 0;

// Screen shake effect variables
let shakeDuration = 0;
let shakeMagnitude = 10;

// Audio files
let jumpSound = new Audio("./shwoosh.mp3");
let scoreSound = new Audio("./coin.mp3");
let gameOverSound = new Audio("./gameOver.mp3");

// Frame rate limiter
let lastTime = 0;
const FPS = 60;
const frameInterval = 1000 / FPS;

window.onload = function () {
    board = document.getElementById("board");
    context = board.getContext("2d"); // used for drawing on the board
    setBoardDimensions();

    // Load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png"; // Default bird image
    birdFlyImg = new Image();
    birdFlyImg.src = "./flappybird-fly.png"; // Bird flying image (when jumping)

    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Start sprite animation (bird flapping)
    startSpriteAnimation();

    // Start game loop
    requestAnimationFrame(update);
    setInterval(placePipes, 3000); // every 3 seconds

    // Add controls for jump
    document.addEventListener("keydown", moveBird); // Keyboard control
    document.addEventListener("click", moveBird);   // Mouse click control
    document.addEventListener("touchstart", moveBird); // Touch control for mobile

    // Handle resizing
    window.addEventListener("resize", setBoardDimensions);
}

function setBoardDimensions() {
    // Set board dimensions as a square on PC, but full screen on mobile
    if (window.innerWidth > window.innerHeight) {
        boardWidth = window.innerHeight * 1; // 100% height for PC for a square-like board
        boardHeight = window.innerHeight;
    } else {
        boardWidth = window.innerWidth; // Full screen on mobile
        boardHeight = window.innerHeight;
    }
    board.width = boardWidth;
    board.height = boardHeight;

    // Set element dimensions based on board size
    birdWidth = boardWidth / 10; // Set bird width as a fraction of board width
    birdHeight = birdWidth; // Keep bird square
    birdX = boardWidth / 16;
    birdY = boardHeight / 4;
    bird = {
        x: birdX,
        y: birdY,
        width: birdWidth,
        height: birdHeight
    };

    pipeWidth = boardWidth / 8; // Set pipe width as a fraction of board width
    pipeHeight = boardHeight / 1.5; // Set pipe height as a fraction of board height
    pipeX = boardWidth;

    floorHeight = boardHeight / 100; // Set floor height as a fraction of board height
    floorY = boardHeight - floorHeight;

    // Set physics settings based on screen size
    velocityX = -boardWidth / 250; // Pipes moving speed based on screen size
    gravity = boardHeight / 2250;
    jumpVelocity = -boardHeight / 120;
    maxFallSpeed = boardHeight / 120;

    // Reset game elements on resize
    resetGame();
}

// Function to start alternating sprites
function startSpriteAnimation() {
    clearInterval(spriteInterval); // Clear any previous interval to avoid overlapping intervals
    spriteInterval = setInterval(() => {
        isFlapping = !isFlapping;
        birdImg = isFlapping ? birdFlyImg : new Image();
        if (!isFlapping) {
            birdImg.src = "./flappybird.png";
        }
    }, 1); // Change sprites every 33 milliseconds for a 3x faster animation
}

function update(timestamp) {
    const deltaTime = timestamp - lastTime;

    if (deltaTime >= frameInterval) {
        lastTime = timestamp - (deltaTime % frameInterval);

        context.clearRect(0, 0, window.innerWidth, window.innerHeight);

        if (shakeDuration > 0) {
            const shakeX = (Math.random() - 0.5) * shakeMagnitude;
            const shakeY = (Math.random() - 0.5) * shakeMagnitude;
            context.save();
            context.translate(shakeX, shakeY);
            shakeDuration--;
        } else {
            context.save();
        }

        // Stop flapping animation if game over
        if (gameOver) {
            clearInterval(spriteInterval); // Stop flapping
        }

        // Bird gravity and movement
        if (!gameOver) {
            velocityY += gravity;
            velocityY = Math.min(velocityY, maxFallSpeed);
            bird.y += velocityY;

            if (bird.y < roofHeight) {
                bird.y = roofHeight;
                velocityY = 0;
            }

            if (bird.y + bird.height > floorY) {
                bird.y = floorY - bird.height;
                gameOver = true;
                gameOverSound.play();
                shakeDuration = 20;
                clearInterval(spriteInterval); // Ensure flapping stops on game over
            }
        } else {
            velocityY += gravity;
            bird.y += velocityY;
            if (bird.y > board.height - bird.height) {
                bird.y = board.height - bird.height;
            }
        }

        // Draw bird with rotation
        let angle = Math.min(Math.max(velocityY / 10, -1), 1) * 20;
        context.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
        context.rotate((Math.PI / 180) * angle);
        context.drawImage(birdImg, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
        context.restore();

        // Draw pipes and check collision
        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            if (!gameOver) {
                pipe.x += velocityX;
            }
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5;
                pipe.passed = true;
                scoreSound.play();
            }

            if (detectCollision(bird, pipe)) {
                if (!gameOver) {
                    gameOver = true;
                    gameOverSound.play();
                    shakeDuration = 20;
                    clearInterval(spriteInterval); // Ensure flapping stops on collision
                }
            }
        }

        // Clear pipes that are off the screen or if too many pipes stack up
        while (pipeArray.length > 6 || (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth)) {
            pipeArray.shift();
        }

        // Score display
        context.fillStyle = "white";
        context.font = `${boardWidth / 12}px sans-serif`;
        const scoreText = score.toFixed(0);
        const scoreWidth = context.measureText(scoreText).width;
        const xPosition = (boardWidth - scoreWidth) / 2;
        const yPosition = boardWidth / 10;
        context.fillText(scoreText, xPosition, yPosition);

        // Game Over display
        if (gameOver) {
            context.fillStyle = "red";
            context.font = `${boardWidth / 8}px sans-serif`;
            const gameOverText = "GAME OVER";
            const gameOverWidth = context.measureText(gameOverText).width;
            const gameOverX = (boardWidth - gameOverWidth) / 2;
            const gameOverY = boardHeight / 2;
            context.fillText(gameOverText, gameOverX, gameOverY);
        }
    }

    requestAnimationFrame(update);
}

function placePipes() { 
    if (gameOver) return;

    let randomPipeY = pipeY - pipeHeight / 4 * (Math.random() + 0.5); // Randomize pipe positions
    let openingSpace = bird.height * 4; // Space between pipes

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (gameOver) {
        resetGame();
    } else if (canJump) {
        velocityY = jumpVelocity;

        // Create a new Audio instance for each jump to allow overlapping sounds
        const jumpSoundInstance = new Audio("./shwoosh.mp3");
        jumpSoundInstance.play();

        // Prevent multiple jumps by disabling canJump temporarily
        canJump = false;
        
        // Debounce jump with a longer delay for mobile
        setTimeout(() => (canJump = true), 170); // Debounce for 150 ms
    }
}

// Add event listeners
document.addEventListener("keydown", moveBird); // Keyboard control
document.addEventListener("click", moveBird);    // Mouse click control
document.addEventListener("touchend", moveBird);  // Touch control on mobile

// Reset function update to reset canJump on new game
function resetGame() {
    gameOver = false;
    score = 0;
    velocityY = 0; 
    bird.y = birdY;
    pipeArray = [];
    canJump = true; // Reset jump flag on new game
    
    startSpriteAnimation(); // Restart flapping animation
}

function detectCollision(bird, pipe) {
    return (
        bird.x < pipe.x + pipe.width &&
        bird.x + bird.width > pipe.x &&
        bird.y < pipe.y + pipe.height &&
        bird.y + bird.height > pipe.y
    );
}
