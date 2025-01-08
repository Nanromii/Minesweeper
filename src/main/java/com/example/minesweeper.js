let mines;
let rows, columns;
let revealed = []; //Cac o da duoc lat
let flagged = []; //Cac o cam co
let mineField = [];//-1 la min, 0 la o trong, cac so con lai tuong trung cho so min xung quanh o do
const DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
];

const BOARD = document.getElementById("board");
const PLAY_BUTTON = document.getElementById("play-button");
const RESET_BUTTON = document.getElementById("reset-button");
const BACK_BUTTON = document.getElementById("back-button");
let flags;

function getNumberOfMines() {
    const minesInput = document.getElementById("numberOfMines").value;
    const numberOfMines = parseInt(minesInput, 10);
    if (isNaN(numberOfMines) || numberOfMines <= 0) {
        alert("Please enter the positive number.")
        return;
    }
    if (numberOfMines > 100) {
        alert("Maximum quantity is 100.")
        return;
    }
    mines = numberOfMines;
    flags = mines;
    getRowAndColumn();
    document.getElementById("number-flag").textContent = mines;
    document.getElementById("input-section").style.display = "none";
    document.getElementById("mines-info").style.display = "block";
    document.getElementById("board").style.backgroundColor = "#aaa";
    initGame();
}

function getRowAndColumn() {
    rows = Math.ceil(Math.sqrt(5 * mines / (1.5)));
    columns = Math.ceil(rows * (1.5));
}

function initGame() {
    BOARD.innerHTML = '';
    BOARD.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    BOARD.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    mineField = Array(rows)
        .fill(null)
        .map(() => Array(columns).fill(0));
    revealed = Array(rows)
        .fill(null)
        .map(() => Array(columns).fill(false));
    flagged = Array(rows)
        .fill(null)
        .map(() => Array(columns).fill(false));
    indexMines();
    calculateNumbers();
    displayBoard();
    updateMinesLefts();
}

function indexMines() {
    let numberOfMines = 0;
    while (numberOfMines < mines) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * columns);
        if (mineField[r][c] === 0) {
            mineField[r][c] = -1;
            numberOfMines++;
        }
    }
}

function calculateNumbers() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (mineField[r][c] === -1) continue;
            let numberMinesAround = 0;
            DIRECTIONS.forEach(([i, j]) => {
                const newRow = r + i;
                const newCol = c + j;
                if (isValid(newRow, newCol) && mineField[newRow][newCol] === -1) {
                    numberMinesAround++;
                }
            });
            mineField[r][c] = numberMinesAround;
        }
    }
}

function isValid(r, c) {
    return 0 <= r && r < rows && 0 <= c && c < columns;
}

function displayBoard() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell', 'hidden');
            cell.dataset.row = r.toString();
            cell.dataset.col = c.toString();
            cell.addEventListener('click', () => revealCell(r, c));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                setFlag(r, c);
            });
            BOARD.appendChild(cell);
        }
    }
}

function revealAllMines() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (mineField[r][c] === -1) {
                const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                revealed[r][c] = true;
                cell.classList.remove('hidden');
                cell.classList.add('mine');
                cell.textContent = 'X';
            }
        }
    }
}

function revealCell(r, c) {
    if (!isValid(r, c) || flagged[r][c]) {
        return;
    }
    if (revealed[r][c]) {
        revealAround(r, c);
    }
    const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
    revealed[r][c] = true;
    cell.textContent = mineField[r][c] || '';
    cell.classList.remove('hidden');
    if (mineField[r][c] === -1) {
        cell.classList.add('mine');
        alert('Game over');
        revealAllMines();
        return;
    }
    if (mineField[r][c] === 0) {
        revealAdjacentCells(r, c);
    }
    if (checkWin()) {
        revealAllMines();
        alert('congratulations, you win!!!!');
    }
}

function revealAround(r, c) {
    if (!revealed[r][c]) return;
    let flagsAround = 0;
    DIRECTIONS.forEach(([i, j]) => {
        const newR = r + i, newC = c + j;
        if (isValid(newR, newC) && flagged[newR][newC]) {
            flagsAround++;
        }
    });
    if (flagsAround !== mineField[r][c]) return;
    DIRECTIONS.forEach(([i, j]) => {
        const newR = r + i, newC = c + j;
        if (isValid(newR, newC) && !revealed[newR][newC] && !flagged[newR][newC]) {
            revealCell(newR, newC);
        }
    });
    if (checkWin()) {
        revealAllMines();
        alert('Congratulations, you win!!!!');
    }
}

function revealAdjacentCells(r, c) {
    DIRECTIONS.forEach(([i, j]) => {
       const newR = r + i;
       const newC = c + j;
       if (isValid(r, c)) {
           revealCell(newR, newC);
       }
    });
}

function checkWin() {
    let allMinesFlagged = true;
    let allNonMinesRevealed = true;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (mineField[r][c] === -1) {
                if (!flagged[r][c]) {
                    allMinesFlagged = false;
                }
            } else {
                if (!revealed[r][c]) {
                    allNonMinesRevealed = false;
                }
            }
        }
    }
    return allNonMinesRevealed || (allMinesFlagged && allNonMinesRevealed);
}

function setFlag(r, c) {
    if (revealed[r][c]) return;
    flagged[r][c] = !flagged[r][c];
    if (flagged[r][c]) {
        flags--;
        if (flags < 0) {
            flags++;
            flagged[r][c] = !flagged[r][c];
            return;
        }
    } else {
        flags++;
    }
    const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
    cell.classList.toggle('flagged');
    updateMinesLefts();
    if (parseInt(flags.textContent) === 0 && checkWin()) {
        alert('Congratulations, you win!!!!!');
        revealAllMines();
    }
}

function updateMinesLefts() {
    document.getElementById("number-flag").textContent = flags.toString();
}

BACK_BUTTON.addEventListener('click', function() {
    window.location.href = "home.html";
});
PLAY_BUTTON.addEventListener('click', getNumberOfMines);
RESET_BUTTON.addEventListener('click', getNumberOfMines);

