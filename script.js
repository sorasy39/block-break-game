
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartButton = document.getElementById("restartButton");
const startButton = document.getElementById("startButton");

// デバイスごとのキャンバスサイズ設定
function resizeCanvas() {
    if (window.innerWidth > 800) {
        canvas.width = 700; // サイズを少し小さく
        canvas.height = 500; // サイズを少し小さく
    } else {
        canvas.width = window.innerWidth * 0.5;
        canvas.height = window.innerHeight * 0.6; // 少し小さく
    }
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ゲーム設定
let ballRadius, x, y, dx, dy;
let paddleHeight = 12; // パドル高さを少し小さく
let paddleWidth;
let paddleX;
let rightPressed = false;
let leftPressed = false;
let gameOver = false;
let gameClear = false;
let speed = 4;
const acceleration = 0.02;
const maxSpeed = 10;

// ブロック設定
const rowCount = window.innerWidth > 800 ? 5 : 4;
const columnCount = window.innerWidth > 800 ? 8 : 5;
let blockWidth, blockHeight, blockPadding, blockOffsetTop, blockOffsetLeft;
let blocks = [];

// 初期化
function initGame() {
    resizeCanvas();
    ballRadius = canvas.width * 0.012; // ボールを小さく
    paddleWidth = canvas.width * 0.15; // パドルを少し小さく
    paddleX = (canvas.width - paddleWidth) / 2;

    x = canvas.width / 2;
    y = canvas.height - 30; // 少し上げてスペース確保
    speed = 4; // 速度をリセット
    let angle = (Math.random() * 60 + 30) * (Math.PI / 180);
    dx = Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1);
    dy = -Math.sin(angle) * speed;

    gameOver = false;
    gameClear = false;
    restartButton.style.display = "none";

    blockWidth = canvas.width / columnCount - 10;
    blockHeight = 20; // ブロックを少し小さく
    blockPadding = 8;
    blockOffsetTop = 50;
    blockOffsetLeft = (canvas.width - (columnCount * (blockWidth + blockPadding))) / 2;

    blocks = [];
    for (let r = 0; r < rowCount; r++) {
        blocks[r] = [];
        for (let c = 0; c < columnCount; c++) {
            blocks[r][c] = {
                x: c * (blockWidth + blockPadding) + blockOffsetLeft,
                y: r * (blockHeight + blockPadding) + blockOffsetTop,
                status: 1
            };
        }
    }
}

// キーイベント
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

// スムーズなパドル移動
function movePaddle() {
    if (rightPressed) paddleX += 5; // パドルを少し速く
    if (leftPressed) paddleX -= 5; // パドルを少し速く
    paddleX = Math.max(0, Math.min(canvas.width - paddleWidth, paddleX));
}

// タッチ操作（スマホ対応）
canvas.addEventListener("touchmove", function(e) {
    let touchX = e.touches[0].clientX - canvas.offsetLeft;
    if (touchX > 0 && touchX < canvas.width) {
        paddleX = touchX - paddleWidth / 2;
    }
    e.preventDefault();
});

// パドル描画
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight - 20, paddleWidth, paddleHeight); // 少し上に位置調整
    ctx.fillStyle = "#00b3b3";
    ctx.fill();
    ctx.closePath();
}

// ボール描画
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6347";
    ctx.fill();
    ctx.closePath();
}

// ブロック描画
function drawBlocks() {
    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
            if (blocks[r][c].status === 1) {
                let b = blocks[r][c];
                ctx.fillStyle = "#0095DD";
                ctx.fillRect(b.x, b.y, blockWidth, blockHeight);
                ctx.strokeStyle = "#FFFFFF";
                ctx.strokeRect(b.x, b.y, blockWidth, blockHeight);
            }
        }
    }
}

// 衝突判定
function collisionDetection() {
    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
            let b = blocks[r][c];
            if (b.status === 1 && x > b.x && x < b.x + blockWidth && y > b.y && y < b.y + blockHeight) {
                dy = -dy;
                b.status = 0;
                increaseSpeed();
                checkWin();
            }
        }
    }
}

// 速度アップ（上限あり）
function increaseSpeed() {
    if (speed < maxSpeed) {
        speed *= (1 + acceleration);
        let angle = Math.atan2(dy, dx);
        dx = Math.cos(angle) * speed;
        dy = Math.sin(angle) * speed;
    }
}

// クリア判定
function checkWin() {
    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
            if (blocks[r][c].status === 1) return;
        }
    }
    gameClear = true;
}

// ゲームループ
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.fillStyle = "#ff6347";
        ctx.font = "30px Arial"; // フォントサイズを小さく
        ctx.textAlign = "center";
        ctx.fillText("ゲームオーバー", canvas.width / 2, canvas.height / 2);
        restartButton.style.display = "block";
        return;
    }

    if (gameClear) {
        ctx.fillStyle = "#00ff00";
        ctx.font = "30px Arial"; // フォントサイズを小さく
        ctx.textAlign = "center";
        ctx.fillText("ゲームクリア！", canvas.width / 2, canvas.height / 2);
        restartButton.style.display = "block";
        return;
    }

    drawBlocks();
    drawBall();
    drawPaddle();
    collisionDetection();
    movePaddle();

    x += dx;
    y += dy;

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
        increaseSpeed();
    }
    if (y + dy < ballRadius) {
        dy = -dy;
        increaseSpeed();
    } else if (y + dy > canvas.height - ballRadius - paddleHeight - 20) { // 位置調整
        if (x > paddleX && x < paddleX + paddleWidth) {
            let hitPoint = (x - paddleX) / paddleWidth - 0.5;
            let newAngle = hitPoint * Math.PI / 3;
            let currentSpeed = Math.sqrt(dx * dx + dy * dy);

            dx = Math.sin(newAngle) * currentSpeed;
            dy = -Math.cos(newAngle) * currentSpeed;
        } else {
            gameOver = true;
        }
    }

    requestAnimationFrame(draw);
}

startButton.addEventListener("click", () => { startButton.style.display = 'none'; initGame(); draw(); });
restartButton.addEventListener("click", () => { restartButton.style.display = 'none'; initGame(); draw(); });
