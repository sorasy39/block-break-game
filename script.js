const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartButton = document.getElementById("restartButton");
const startButton = document.getElementById("startButton");

// デバイスごとのキャンバスサイズ設定
function resizeCanvas() {
    if (window.innerWidth > 800) {
        // PC用（固定サイズ）
        canvas.width = 800;
        canvas.height = 600;
    } else {
        // スマホ用（画面サイズに適応）
        canvas.width = window.innerWidth * 0.9;
        canvas.height = window.innerHeight * 0.7;
    }
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ボール設定
let ballRadius = canvas.width * 0.015; // 画面サイズに依存
let x, y, dx, dy;

// パドル設定（画面サイズに応じて変化）
const paddleHeight = 15;
let paddleWidth = canvas.width * 0.2;
let paddleX;

// ゲーム状態
let gameOver = false;
let gameClear = false;

// ブロック設定（PCとスマホで異なるバランス）
const rowCount = window.innerWidth > 800 ? 6 : 4;
const columnCount = window.innerWidth > 800 ? 10 : 6;
const blockWidth = canvas.width / columnCount - 10;
const blockHeight = 25;
const blockPadding = 10;
const blockOffsetTop = 60;
const blockOffsetLeft = (canvas.width - (columnCount * (blockWidth + blockPadding))) / 2;

let blocks = [];

// ボールの初期速度
let speed = 4;
const acceleration = 0.02;

// 初期化
function initGame() {
    resizeCanvas(); // サイズを更新
    ballRadius = canvas.width * 0.015; // 再計算
    paddleWidth = canvas.width * 0.2; // パドルサイズも更新
    x = canvas.width / 2;
    y = canvas.height - 40;

    let angle = (Math.random() * 60 + 30) * (Math.PI / 180);
    dx = Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1);
    dy = -Math.sin(angle) * speed;

    paddleX = (canvas.width - paddleWidth) / 2;
    gameOver = false;
    gameClear = false;
    restartButton.style.display = "none";

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

// スタートボタン
startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    initGame();
    draw();
});

// キーイベント
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// タッチ操作（スマホ）
canvas.addEventListener("touchmove", function(e) {
    let touchX = e.touches[0].clientX - canvas.offsetLeft;
    if (touchX > 0 && touchX < canvas.width) {
        paddleX = touchX - paddleWidth / 2;
    }
    e.preventDefault();
});

// リスタートボタン
restartButton.addEventListener("click", restartGame);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        paddleX += 20;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        paddleX -= 20;
    }
}

function keyUpHandler(e) {}

// パドルの描画
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
    ctx.fillStyle = "#00b3b3";
    ctx.fill();
    ctx.closePath();
}

// ボールの描画
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6347";
    ctx.fill();
    ctx.closePath();
}

// ブロックの描画
function drawBlocks() {
    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
            if (blocks[r][c].status === 1) {
                let b = blocks[r][c];
                ctx.fillStyle = "#0095DD";
                ctx.fillRect(b.x, b.y, blockWidth, blockHeight);
            }
        }
    }
}

// ブロックとの衝突判定
function collisionDetection() {
    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
            let b = blocks[r][c];
            if (b.status === 1) {
                if (x > b.x && x < b.x + blockWidth && y > b.y && y < b.y + blockHeight) {
                    dy = -dy;
                    b.status = 0;
                    increaseSpeed();
                    checkWin();
                }
            }
        }
    }
}

// 速度アップ
function increaseSpeed() {
    let speedFactor = 1 + acceleration;
    dx *= speedFactor;
    dy *= speedFactor;
}

// クリア判定
function checkWin() {
    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
            if (blocks[r][c].status === 1) {
                return;
            }
        }
    }
    gameClear = true;
}

// ゲームループ
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.fillStyle = "#ff6347";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("ゲームオーバー", canvas.width / 2, canvas.height / 2 - 50);
        restartButton.style.display = "block";
        return;
    }

    if (gameClear) {
        ctx.fillStyle = "#00ff00";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("ゲームクリア！", canvas.width / 2, canvas.height / 2 - 50);
        restartButton.style.display = "block";
        return;
    }

    drawBlocks();
    drawBall();
    drawPaddle();
    collisionDetection();

    x += dx;
    y += dy;

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
        increaseSpeed();
    }
    if (y + dy < ballRadius) {
        dy = -dy;
        increaseSpeed();
    } else if (y + dy > canvas.height - ballRadius - paddleHeight) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
            increaseSpeed();
        } else {
            gameOver = true;
        }
    }

    requestAnimationFrame(draw);
}

// リスタート関数
function restartGame() {
    restartButton.style.display = 'none';
    initGame();
    draw();
}
