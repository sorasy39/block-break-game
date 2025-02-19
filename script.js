const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartButton = document.getElementById("restartButton");
const startButton = document.getElementById("startButton");

// ボールの設定
let ballRadius = 12;
let x, y, dx, dy;

// パドルの設定
const paddleHeight = 20;
const paddleWidth = 120;
let paddleX;
let rightPressed = false;
let leftPressed = false;

// ゲーム状態
let gameOver = false;
let gameClear = false;

// ブロック設定
const rowCount = 6;
const columnCount = 10;
const blockWidth = 75;
const blockHeight = 25;
const blockPadding = 10;
const blockOffsetTop = 80;
const blockOffsetLeft = (canvas.width - (columnCount * (blockWidth + blockPadding))) / 2;

let blocks = [];

// ボールの初期速度
let speed = 4;
const acceleration = 0.02;

// 初期化関数
function initGame() {
    x = canvas.width / 2;
    y = canvas.height - 40;

    let angle = (Math.random() * 60 + 30) * (Math.PI / 180);
    dx = Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1);
    dy = -Math.sin(angle) * speed;

    paddleX = (canvas.width - paddleWidth) / 2;
    gameOver = false;
    gameClear = false;
    restartButton.style.display = "none";  // リスタートボタンを非表示

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

// ゲームスタートボタンを押した時の処理
startButton.addEventListener('click', () => {
    startButton.style.display = 'none'; // スタートボタンを非表示
    initGame();
    draw();
});

// キーイベント
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

// リスタートボタンを押した時の処理
restartButton.addEventListener("click", restartGame);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// マウスでパドル操作
function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

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

// ゲームオーバーのメッセージ
function drawGameOver() {
    ctx.font = "40px Arial";
    ctx.fillStyle = "#ff6347";
    ctx.textAlign = "center";
    ctx.fillText("ゲームオーバー", canvas.width / 2, canvas.height / 2 - 50);

    restartButton.style.display = "block";  // リスタートボタンを表示
    restartButton.style.position = "absolute";
    restartButton.style.left = `${canvas.offsetLeft + canvas.width / 2 - 50}px`;
    restartButton.style.top = `${canvas.offsetTop + canvas.height / 2}px`;
}

// ゲームクリアのメッセージ
function drawGameClear() {
    ctx.font = "40px Arial";
    ctx.fillStyle = "#00ff00";
    ctx.textAlign = "center";
    ctx.fillText("ゲームクリア！", canvas.width / 2, canvas.height / 2 - 50);

    restartButton.style.display = "block";  // リスタートボタンを表示
    restartButton.style.position = "absolute";
    restartButton.style.left = `${canvas.offsetLeft + canvas.width / 2 - 50}px`;
    restartButton.style.top = `${canvas.offsetTop + canvas.height / 2}px`;
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

// ブロックとボールの衝突判定
function collisionDetection() {
    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
            let b = blocks[r][c];
            if (b.status === 1) {
                if (
                    x > b.x && x < b.x + blockWidth &&
                    y > b.y && y < b.y + blockHeight
                ) {
                    dy = -dy;
                    b.status = 0;
                    increaseSpeed();
                    checkWin(); // クリア判定
                }
            }
        }
    }
}

// 速度を増やす関数
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
        drawGameOver();
        return;
    }

    if (gameClear) {
        drawGameClear();
        return;
    }

    drawBlocks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // ボールの移動
    x += dx;
    y += dy;

    // 壁の跳ね返り
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
        increaseSpeed();
    }
    if (y + dy < ballRadius) {
        dy = -dy;
        increaseSpeed();
    } else if (y + dy > canvas.height - ballRadius - paddleHeight) {
        if (x > paddleX - ballRadius && x < paddleX + paddleWidth + ballRadius) {
            dy = -dy;
            increaseSpeed();
        } else {
            gameOver = true;
        }
    }

    // パドル移動
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    requestAnimationFrame(draw);
}

// リスタート関数
function restartGame() {
    startButton.style.display = 'none';  // スタートボタンを非表示にする
    restartButton.style.display = 'none'; // リスタートボタンも一旦非表示
    initGame(); // ゲームの初期化処理
    draw(); // ゲームの再描画
}
