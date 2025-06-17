document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('game-board');
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const restartBtn = document.getElementById('restart-btn');
    const modeSelect = document.getElementById('game-mode');
    const themeSelect = document.getElementById('theme-selector');
    const scoreX = document.getElementById('score-x');
    const scoreO = document.getElementById('score-o');
    const scoreDraws = document.getElementById('score-draws');

    // Add error logging for null elements
    if (!board) console.error('game-board element not found');
    if (!status) console.error('status element not found');
    if (!restartBtn) console.error('restart-btn element not found');
    if (!modeSelect) console.error('game-mode element not found');
    if (!themeSelect) console.error('theme-selector element not found');
    if (!scoreX) console.error('score-x element not found');
    if (!scoreO) console.error('score-o element not found');
    if (!scoreDraws) console.error('score-draws element not found');

    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let isAIMode = false;

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[clickedCellIndex] !== '' || !gameActive) {
            return;
        }

        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;

        if (checkResult()) {
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        status.textContent = `Player ${currentPlayer}'s turn`;

        if (gameActive && isAIMode && currentPlayer === 'O') {
            setTimeout(makeAIMove, 500);
        }
    }

    function makeAIMove() {
        const emptyCells = gameState.reduce((acc, cell, index) => {
            if (cell === '') acc.push(index);
            return acc;
        }, []);

        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const aiMove = emptyCells[randomIndex];
            gameState[aiMove] = 'O';
            cells[aiMove].textContent = 'O';
            if (checkResult()) {
                return;
            }
            currentPlayer = 'X';
            status.textContent = `Player ${currentPlayer}'s turn`;
        }
    }

    function checkResult() {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            status.textContent = `Player ${currentPlayer} wins!`;
            gameActive = false;
            updateScore(currentPlayer);
            return true;
        }

        if (!gameState.includes('')) {
            status.textContent = "It's a draw!";
            gameActive = false;
            updateScore('Draws');
            return true;
        }

        return false;
    }

    function updateScore(result) {
        fetch('/update_score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ result: result }),
        })
        .then(response => response.json())
        .then(data => {
            scoreX.textContent = data.X;
            scoreO.textContent = data.O;
            scoreDraws.textContent = data.Draws;
        });
    }

    function restartGame() {
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        status.textContent = `Player ${currentPlayer}'s turn`;
        cells.forEach(cell => {
            cell.textContent = '';
        });
    }

    function changeGameMode() {
        isAIMode = modeSelect.value === 'ai';
        restartGame();
    }

    function changeTheme() {
        const selectedTheme = themeSelect.value;
        document.body.className = selectedTheme === 'default' ? '' : `${selectedTheme}-theme`;
    }

    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    } else {
        console.error('restart-btn not found, could not add event listener');
    }

    if (modeSelect) {
        modeSelect.addEventListener('change', changeGameMode);
    } else {
        console.error('game-mode not found, could not add event listener');
    }

    if (themeSelect) {
        themeSelect.addEventListener('change', changeTheme);
    } else {
        console.error('theme-selector not found, could not add event listener');
    }

    // Initialize game status
    if (status) {
        status.textContent = `Player ${currentPlayer}'s turn`;
    } else {
        console.error('status element not found, could not set initial game status');
    }
});
