// Определяем основные переменные
const colors = ["red", "brightBlue", "green", "yellow"];
let boardSize = 5;
let board = [];
let sequence = [];
let currentSequenceIndex = 0;
let energy = 100;
let score = 0;
let timeLeft = 30;
let gameActive = false;
let timerInterval = null;
let gameStartCount = 0; // Счётчик запусков игры

// Получаем элементы DOM
const gameBoard = document.getElementById("gameBoard");
const sequenceDiv = document.getElementById("sequence");
const energyDiv = document.getElementById("energy");
const scoreDiv = document.getElementById("score");
const timerDiv = document.getElementById("timer");
const gameOverMessage = document.getElementById("gameOverMessage");

// Функция для обновления прогресс-бара энергии
function updateEnergy() {
    if (!energyDiv) {
        console.error("Energy div not found in DOM");
        return;
    }
    energyDiv.style.width = energy === 0 ? '20px' : `${energy}%`;
    energyDiv.textContent = '⚡';
    if (energy > 60) {
        energyDiv.style.background = "#4caf50";
    } else if (energy > 30) {
        energyDiv.style.background = "#ffeb3b";
    } else {
        energyDiv.style.background = "#ff4444";
    }
    console.log(`Energy updated to ${energy}% at ${new Date().toISOString()}`);
}

// Функция для начала новой игры
function startGame() {
    gameStartCount++; // Увеличиваем счётчик запусков
    console.log(`User started a new game at ${new Date().toISOString()} | Total starts: ${gameStartCount}`);

    boardSize = 5;
    board = [];
    sequence = [];
    currentSequenceIndex = 0;
    energy = 100;
    score = 0;
    timeLeft = 30;
    gameActive = true;

    updateEnergy();
    if (scoreDiv) scoreDiv.textContent = `Собранные последовательности: ${score}`;
    else console.error("Score div not found in DOM");

    if (timerDiv) timerDiv.textContent = `Время: ${timeLeft}`;
    else console.error("Timer div not found in DOM");

    if (gameOverMessage) gameOverMessage.style.display = "none";
    else console.error("GameOverMessage div not found in DOM");

    if (sequenceDiv) sequenceDiv.innerHTML = "";
    else console.error("Sequence div not found in DOM");

    createBoard();
    generateSequence();
    updateSequenceDisplay();
    spawnCrystals();
    startTimer();
}

// Функция для запуска таймера
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        console.log(`Cleared previous timer interval at ${new Date().toISOString()}`);
    }
    timerInterval = setInterval(() => {
        if (!gameActive) {
            clearInterval(timerInterval);
            console.log(`Game stopped, timer cleared at ${new Date().toISOString()}`);
            return;
        }

        timeLeft--;
        if (timerDiv) timerDiv.textContent = `Время: ${timeLeft}`;

        if (timeLeft <= 0) {
            energy -= 10;
            updateEnergy();
            timeLeft = 30;
            if (timerDiv) timerDiv.textContent = `Время: ${timeLeft}`;

            if (energy <= 0) {
                gameActive = false;
                if (gameOverMessage) {
                    gameOverMessage.style.display = "block";
                    gameOverMessage.textContent = `Игра окончена из-за нехватки энергии! Ты собрал ${score} последовательностей.`;
                    console.log(`Game over due to lack of energy at ${new Date().toISOString()} | Final score: ${score}`);
                }
                updateEnergy();
                clearInterval(timerInterval);
            }
        }
    }, 1000);
}

// Создаём игровое поле
function createBoard() {
    if (!gameBoard) {
        console.error("GameBoard div not found in DOM");
        return;
    }
    gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    gameBoard.innerHTML = "";
    board = [];

    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener("click", handleClick);
            gameBoard.appendChild(cell);
            board[i][j] = null;
        }
    }
    console.log(`Game board created with size ${boardSize}x${boardSize} at ${new Date().toISOString()}`);
}

// Генерируем последовательность для сбора
function generateSequence() {
    sequence = [];
    for (let i = 0; i < 3; i++) {
        sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    updateSequenceDisplay();
    console.log(`New sequence generated: ${sequence.join(" -> ")} at ${new Date().toISOString()}`);
}

// Обновляем отображение последовательности
function updateSequenceDisplay() {
    if (!sequenceDiv) {
        console.error("Sequence div not found in DOM");
        return;
    }
    sequenceDiv.innerHTML = "Собери: ";
    sequence.forEach((color, index) => {
        const span = document.createElement("span");
        span.style.color = color;
        span.textContent = index === sequence.length - 1 ? color : `${color} → `;
        if (index === currentSequenceIndex) {
            span.style.fontWeight = "bold";
            span.style.textDecoration = "underline";
        }
        sequenceDiv.appendChild(span);
    });
}

// Появление кристаллов на поле
function spawnCrystals() {
    if (!gameActive) return;

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] && Math.random() < 0.1) {
                board[i][j] = null;
                updateCell(i, j);
            }
        }
    }

    const emptyCells = [];
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (!board[i][j]) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }

    const numCrystals = Math.min(3, emptyCells.length);
    for (let i = 0; i < numCrystals; i++) {
        if (emptyCells.length === 0) break;
        const index = Math.floor(Math.random() * emptyCells.length);
        const { row, col } = emptyCells.splice(index, 1)[0];
        board[row][col] = colors[Math.floor(Math.random() * colors.length)];
        updateCell(row, col);
    }

    setTimeout(spawnCrystals, 2000);
}

// Обновляем отображение клетки
function updateCell(row, col) {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cell) {
        console.error(`Cell at row ${row}, col ${col} not found in DOM`);
        return;
    }
    cell.className = "cell";
    if (board[row][col]) {
        cell.classList.add(board[row][col]);
        cell.classList.add("appear");
    } else {
        cell.classList.remove("red", "blue", "green", "yellow", "appear");
    }
}

// Обрабатываем клик по клетке
function handleClick(event) {
    if (!gameActive) return;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const color = board[row][col];

    if (!color || !event.target.classList.contains("appear")) return;

    console.log(`User clicked cell at row ${row}, col ${col} with color ${color} at ${new Date().toISOString()}`);

    const targetColor = sequence[currentSequenceIndex];
    if (color === targetColor) {
        const cell = event.target;
        cell.classList.add("disappear");
        setTimeout(() => {
            board[row][col] = null;
            updateCell(row, col);
        }, 300);
        currentSequenceIndex++;

        if (currentSequenceIndex === sequence.length) {
            score++;
            if (scoreDiv) scoreDiv.textContent = `Собранные последовательности: ${score}`;
            currentSequenceIndex = 0;
            generateSequence();
            timeLeft = 30;
            if (timerDiv) timerDiv.textContent = `Время: ${timeLeft}`;
            console.log(`Sequence completed! Score: ${score} at ${new Date().toISOString()}`);

            if (score % 5 === 0) {
                boardSize++;
                createBoard();
                spawnCrystals();
            }
        } else {
            updateSequenceDisplay();
        }
    } else {
        energy -= 10;
        updateEnergy();
        console.log(`Incorrect click, energy decreased to ${energy} at ${new Date().toISOString()}`);
        if (energy <= 0) {
            gameActive = false;
            if (gameOverMessage) {
                gameOverMessage.style.display = "block";
                gameOverMessage.textContent = `Игра окончена из-за нехватки энергии! Ты собрал ${score} последовательностей.`;
                console.log(`Game over due to lack of energy at ${new Date().toISOString()} | Final score: ${score}`);
            }
            updateEnergy();
            clearInterval(timerInterval);
        }
    }
}

// Запускаем игру при загрузке страницы
window.onload = function() {
    startGame();
};
