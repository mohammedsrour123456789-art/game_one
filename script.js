// عناصر DOM
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart-btn');
const resetAllBtn = document.getElementById('reset-all-btn');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawEl = document.getElementById('score-draw');
const btnTwoPlayers = document.getElementById('btn-two-players');
const btnVsCpu = document.getElementById('btn-vs-cpu');

// حالات اللعبة
let boardState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;
let isVsCpu = false;

let scores = { X: 0, O: 0, draw: 0 };

// جميع حالات الفوز الممكنة
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // الأفقية
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // العمودية
    [0, 4, 8], [2, 4, 6]             // القطرية
];

// تشغيل الأحداث
function init() {
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    restartBtn.addEventListener('click', resetBoard);
    resetAllBtn.addEventListener('click', resetAll);
    
    btnTwoPlayers.addEventListener('click', () => setMode(false));
    btnVsCpu.addEventListener('click', () => setMode(true));
}

function setMode(vsCpu) {
    isVsCpu = vsCpu;
    btnTwoPlayers.classList.toggle('active', !vsCpu);
    btnVsCpu.classList.toggle('active', vsCpu);
    resetAll();
}

function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (boardState[clickedIndex] !== "" || !isGameActive) return;

    makeMove(clickedIndex, currentPlayer);

    if (isGameActive && isVsCpu && currentPlayer === "O") {
        // دور الكمبيوتر
        setTimeout(cpuMove, 400);
    }
}

function makeMove(index, player) {
    boardState[index] = player;
    cells[index].innerText = player;
    cells[index].classList.add(player.toLowerCase());

    checkResult();
}

function checkResult() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusText.innerText = `🎉 الفائز هو اللاعب (${currentPlayer})!`;
        scores[currentPlayer]++;
        updateScoreBoard();
        isGameActive = false;
        return;
    }

    if (!boardState.includes("")) {
        statusText.innerText = "تعادل!";
        scores.draw++;
        updateScoreBoard();
        isGameActive = false;
        return;
    }

    // تبديل الدور
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.innerText = `دور اللاعب ${currentPlayer}`;
}

// حركات الكمبيوتر الذكية (Smart AI)
function cpuMove() {
    if (!isGameActive) return;

    // 1. البحث عن حركة للفوز بها فوراً
    let winMove = findBestMove("O");
    if (winMove !== null) {
        makeMove(winMove, "O");
        return;
    }

    // 2. حظر حركة اللاعب (X) إذا كان على وشك الفوز
    let blockMove = findBestMove("X");
    if (blockMove !== null) {
        makeMove(blockMove, "O");
        return;
    }

    // 3. اختيار المربع الأوسط (المركز) إن كان فارغاً
    if (boardState[4] === "") {
        makeMove(4, "O");
        return;
    }

    // 4. اختيار إحدى الزوايا إن كانت فارغة
    const corners = [0, 2, 6, 8].filter(idx => boardState[idx] === "");
    if (corners.length > 0) {
        const randomCorner = corners[Math.floor(Math.random() * corners.length)];
        makeMove(randomCorner, "O");
        return;
    }

    // 5. الاختيار من المربعات المتبقية العشوائية
    const emptyIndices = boardState
        .map((val, idx) => val === "" ? idx : null)
        .filter(val => val !== null);

    if (emptyIndices.length > 0) {
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        makeMove(randomIndex, "O");
    }
}

// دالة مساعدة لفحص الحركات الحاسمة (الفوز أو المنع)
function findBestMove(player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        const values = [boardState[a], boardState[b], boardState[c]];
        
        // إذا كان هناك مربعان ممتلئان لنفس اللاعب والمربع الثالث فارغ
        if (values.filter(val => val === player).length === 2 && values.includes("")) {
            if (boardState[a] === "") return a;
            if (boardState[b] === "") return b;
            if (boardState[c] === "") return c;
        }
    }
    return null;
}

function updateScoreBoard() {
    scoreXEl.innerText = scores.X;
    scoreOEl.innerText = scores.O;
    scoreDrawEl.innerText = scores.draw;
}

function resetBoard() {
    boardState = ["", "", "", "", "", "", "", "", ""];
    isGameActive = true;
    currentPlayer = "X";
    statusText.innerText = `دور اللاعب ${currentPlayer}`;
    cells.forEach(cell => {
        cell.innerText = "";
        cell.classList.remove('x', 'o');
    });
}

function resetAll() {
    scores = { X: 0, O: 0, draw: 0 };
    updateScoreBoard();
    resetBoard();
}

init();