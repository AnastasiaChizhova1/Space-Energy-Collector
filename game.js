// Определяем основные переменные
const colors = ["red", "blue", "green", "yellow"];
let boardSize = 5;
let board = [];
let sequence = [];
let currentSequenceIndex = 0;
let energy = 100;
let score = 0;
let timeLeft = 30;
let gameActive = false;
let timerInterval = null;

// Получаем элементы DOM
const gameBoard = document.getElementById("gameBoard");
const sequenceDiv = document.getElementById("sequence");
const energyDiv = document.getElementById("energy");
const scoreDiv = document.getElementById("score");
const timerDiv = document.getElementById("timer");
const gameOverMessage = document.getElementById("gameOverMessage");

// Функция для обновления прогресс-бара энергии
function updateEnergy() {
    if (!energyDiv) return;
    energyDiv.style.width = energy === 0 ? '20px' : `${energy}%`;
    energyDiv.textContent = '⚡';
    if (energy > 60) {
        energyDiv.style.background = "#4caf50";
    } else if (energy > 30) {
        energyDiv.style.background = "#ffeb3b";
    } else {
        energyDiv.style.background = "#ff4444";
    }
}

// Функция для начала новой игры
function startGame() {
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
    if (timerDiv) timerDiv.textContent = `Время: ${timeLeft}`;
    if (gameOverMessage) gameOverMessage.style.display = "none";
    if (sequenceDiv) sequenceDiv.innerHTML = "";
    createBoard();
    generateSequence();
    updateSequenceDisplay();
    spawnCrystals();
    startTimer();
}

// Функция для запуска таймера
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!gameActive) {
            clearInterval(timerInterval);
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
                    gameOverMessage.textContent = `Игра окончена из-за нехватки энергии! Ты собрал ${score} последовательностей.`; // Уточняем причину
                }
                updateEnergy();
                clearInterval(timerInterval);
            }
        }
    }, 1000);
}

// Создаём игровое поле
function createBoard() {
    if (!gameBoard) return;
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
}

// Генерируем последовательность для сбора
function generateSequence() {
    sequence = [];
    for (let i = 0; i < 3; i++) {
        sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    updateSequenceDisplay();
}

// Обновляем отображение последовательности
function updateSequenceDisplay() {
    if (!sequenceDiv) return;
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
    if (!cell) return;
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
        console.log("Энергия уменьшена до:", energy); // Отладка значения энергии
        if (energy <= 0) {
            gameActive = false;
            if (gameOverMessage) {
                console.log("Игра окончена, отображаем сообщение");
                gameOverMessage.style.display = "block";
                gameOverMessage.textContent = `Игра окончена из-за нехватки энергии! Ты собрал ${score} последовательностей.`;
            } else {
                console.log("Ошибка: gameOverMessage не найден в DOM");
            }
            updateEnergy();
            clearInterval(timerInterval);
        }
    }
}

// Запускаем игру при загрузке страницы
startGame();
