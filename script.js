// ======= Select DOM Elements =======
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const turnEl = document.getElementById('turn');
const restartBtn = document.getElementById('restartBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreDEl = document.getElementById('scoreD');
const resultScreen = document.getElementById('resultScreen');
const resultMessage = document.getElementById('resultMessage');
const newGameBtn = document.getElementById('newGameBtn');

// ======= Game State =======
let board = Array(9).fill('');
let current = 'X';
let running = true;

// ======= Persistent Scores (Local Storage) =======
const scores = {
  X: parseInt(localStorage.getItem('ttt_score_x') || '0', 10),
  O: parseInt(localStorage.getItem('ttt_score_o') || '0', 10),
  D: parseInt(localStorage.getItem('ttt_score_d') || '0', 10),
};
updateScoreUI();

const winLines = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// ======= Initialize Board =======
function createCells() {
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', onCellClick);
    boardEl.appendChild(cell);
  }
}

// ======= Click Handling =======
function onCellClick(e) {
  const idx = Number(e.target.dataset.index);
  if (!running || board[idx]) return;
  makeMove(idx, current);
}

function makeMove(idx, player) {
  board[idx] = player;
  const cell = boardEl.querySelector(`.cell[data-index='${idx}']`);
  cell.textContent = player;
  cell.classList.add('disabled');

  const result = checkWinner();
  if (result) {
    handleResult(result);
    return;
  }
  current = current === 'X' ? 'O' : 'X';
  updateStatus();
}

function checkWinner() {
  for (const [a,b,c] of winLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a,b,c] };
    }
  }
  if (board.every(Boolean)) return { winner: null }; // Draw
  return null;
}

function handleResult(result) {
  running = false;
  if (result.winner) {
    result.line.forEach(i => {
      boardEl.querySelector(`.cell[data-index='${i}']`).classList.add('win');
    });
    resultMessage.textContent = `🏆 Player ${result.winner} Wins!`;
    scores[result.winner] += 1;
  } else {
    resultMessage.textContent = `🤝 It's a Draw!`;
    scores.D += 1;
  }

  saveScores();
  updateScoreUI();
  showResultScreen();
}

// ======= Overlay Control =======
function showResultScreen() {
  resultScreen.classList.remove('hidden');
  resultScreen.classList.add('visible');
}

function hideResultScreen() {
  resultScreen.classList.add('hidden');
  resultScreen.classList.remove('visible');
  restart(true);
}

// ======= Restart Game =======
function restart(keepTurn = false) {
  board = Array(9).fill('');
  running = true;
  current = keepTurn ? current : 'X';
  updateStatus();

  boardEl.querySelectorAll('.cell').forEach(c => {
    c.textContent = '';
    c.className = 'cell';
  });
}

// ======= Score Functions =======
function resetScores() {
  if (confirm('Reset all scores?')) {
    scores.X = 0; scores.O = 0; scores.D = 0;
    saveScores();
    updateScoreUI();
    alert('Scores have been reset!');
  }
}

function saveScores() {
  localStorage.setItem('ttt_score_x', scores.X);
  localStorage.setItem('ttt_score_o', scores.O);
  localStorage.setItem('ttt_score_d', scores.D);
}

function updateScoreUI() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDEl.textContent = scores.D;
}

function updateStatus() {
  statusEl.innerHTML = `Turn: <span id="turn">${current}</span>`;
}

// ======= Init =======
createCells();
restart();

// ======= Button Listeners =======
restartBtn.addEventListener('click', () => restart(true));
resetScoreBtn.addEventListener('click', resetScores);
newGameBtn.addEventListener('click', hideResultScreen);
