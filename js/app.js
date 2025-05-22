document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let board = [];
    let emptyTile = { row: 3, col: 3 }; // Position of the empty tile
    let moveCount = 0;
    let timerSeconds = 0;
    let timerInterval = null;
    let isPaused = false;
    let gameInitialized = false;
    let shuffleIntensity = 1;

    // Cache DOM elements
    const welcomeText = document.getElementById('welcome-text');
    const instructions = document.getElementById('instructions');
    const enterGameBtn = document.getElementById('enter-game');
    const gameScreen = document.getElementById('game-screen');
    const welcomeScreen = document.getElementById('welcome-screen');
    const puzzleBoard = document.getElementById('puzzle-board');
    const newGameBtn = document.getElementById('new-game-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const timerElement = document.getElementById('timer');
    const movesCounter = document.getElementById('moves-counter');

    // Initialize the welcome sequence
    setTimeout(() => {
        // After welcome text fades in, show instructions
        setTimeout(() => {
            welcomeText.style.opacity = '0';
            welcomeText.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                instructions.classList.remove('hidden');
                instructions.classList.add('active');
            }, 500);
        }, 2000);
    }, 500);

    // Enter game button click handler
    enterGameBtn.addEventListener('click', () => {
        welcomeScreen.classList.remove('active');
        welcomeScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        gameScreen.classList.add('active');

        // Initialize game if not already done
        if (!gameInitialized) {
            initializeGame();
            gameInitialized = true;
        }
    });

    // New game button click handler
    newGameBtn.addEventListener('click', () => {
        resetGame();
    });

    // Pause button click handler
    pauseBtn.addEventListener('click', () => {
        togglePause();
    });

    // Initialize the game board
    function initializeGame() {
        resetGameState();
        
        // Create the initial ordered board
        board = [];
        for (let i = 0; i < 4; i++) {
            board[i] = [];
            for (let j = 0; j < 4; j++) {
                const tileValue = i * 4 + j + 1;
                if (tileValue < 16) {
                    board[i][j] = tileValue;
                } else {
                    board[i][j] = 0; // Empty tile
                }
            }
        }
        
        // Shuffle the board and render
        shuffleBoard();
        renderBoard();
        startTimer();

        // Add keyboard listener for arrow keys
        document.addEventListener('keydown', handleKeyDown);
    }

    // Reset game state
    function resetGameState() {
        moveCount = 0;
        timerSeconds = 0;
        updateMovesDisplay();
        updateTimerDisplay();
        stopTimer();
        isPaused = false;
        pauseBtn.textContent = 'Pause';
        shuffleIntensity = Math.min(shuffleIntensity + 1, 5); // Limit intensity to 5
    }

    // Render the game board
    function renderBoard() {
        // Clear the board
        puzzleBoard.innerHTML = '';

        // Create tiles
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const tileValue = board[i][j];
                const tile = document.createElement('div');
                
                if (tileValue !== 0) {
                    tile.className = 'tile';
                    tile.textContent = tileValue;
                    
                    // Check if tile is movable
                    if (!isPaused && isMovable(i, j)) {
                        tile.classList.add('movable');
                        // Add click event for movable tiles
                        tile.addEventListener('click', () => moveTile(i, j));
                    }
                } else {
                    tile.className = 'tile empty';
                    // Update empty tile position
                    emptyTile = { row: i, col: j };
                }
                
                puzzleBoard.appendChild(tile);
            }
        }

        // Check if puzzle is solved
        if (isPuzzleSolved()) {
            stopTimer();
            setTimeout(() => {
                alert(`Congratulations! You solved the puzzle in ${moveCount} moves and ${formatTime(timerSeconds)}.`);
            }, 300);
        }
    }

    // Check if a tile is movable (adjacent to empty tile)
    function isMovable(row, col) {
        return (
            (row === emptyTile.row && Math.abs(col - emptyTile.col) === 1) ||
            (col === emptyTile.col && Math.abs(row - emptyTile.row) === 1)
        );
    }

    // Move a tile to the empty space
    function moveTile(row, col) {
        if (isPaused) return;
        
        if (isMovable(row, col)) {
            // Swap tile with empty space
            board[emptyTile.row][emptyTile.col] = board[row][col];
            board[row][col] = 0;
            
            // Increment move counter
            moveCount++;
            updateMovesDisplay();
            
            // Render the updated board
            renderBoard();
        }
    }

    // Handle keyboard arrow keys
    function handleKeyDown(e) {
        if (isPaused) return;
        
        const key = e.key;
        let row = emptyTile.row;
        let col = emptyTile.col;
        
        // Determine which tile to move based on arrow key
        switch(key) {
            case 'ArrowUp':
                row = Math.min(row + 1, 3);
                break;
            case 'ArrowDown':
                row = Math.max(row - 1, 0);
                break;
            case 'ArrowLeft':
                col = Math.min(col + 1, 3);
                break;
            case 'ArrowRight':
                col = Math.max(col - 1, 0);
                break;
            default:
                return; // Exit for other keys
        }
        
        // Move the tile if valid
        if (row !== emptyTile.row || col !== emptyTile.col) {
            moveTile(row, col);
        }
    }

    // Shuffle the board
    function shuffleBoard() {
        // Number of random moves increases with shuffle intensity
        const numMoves = 50 * shuffleIntensity;
        
        for (let i = 0; i < numMoves; i++) {
            // Get all possible moves (tiles adjacent to empty tile)
            const possibleMoves = [];
            
            if (emptyTile.row > 0) possibleMoves.push({row: emptyTile.row - 1, col: emptyTile.col});
            if (emptyTile.row < 3) possibleMoves.push({row: emptyTile.row + 1, col: emptyTile.col});
            if (emptyTile.col > 0) possibleMoves.push({row: emptyTile.row, col: emptyTile.col - 1});
            if (emptyTile.col < 3) possibleMoves.push({row: emptyTile.row, col: emptyTile.col + 1});
            
            // Make a random move
            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                board[emptyTile.row][emptyTile.col] = board[randomMove.row][randomMove.col];
                board[randomMove.row][randomMove.col] = 0;
                emptyTile = { row: randomMove.row, col: randomMove.col };
            }
        }
        
        // Ensure the puzzle is solvable
        if (!isSolvable() || isPuzzleSolved()) {
            shuffleBoard(); // Reshuffle if not solvable or already solved
        }
    }

    // Check if the current board configuration is solvable
    function isSolvable() {
        // Flatten the board to 1D array, excluding the empty tile
        const flatBoard = [];
        let emptyRow = 0;
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (board[i][j] !== 0) {
                    flatBoard.push(board[i][j]);
                } else {
                    emptyRow = i;
                }
            }
        }
        
        // Count inversions
        let inversions = 0;
        for (let i = 0; i < flatBoard.length; i++) {
            for (let j = i + 1; j < flatBoard.length; j++) {
                if (flatBoard[i] > flatBoard[j]) {
                    inversions++;
                }
            }
        }
        
        // For a 4x4 puzzle, solvability depends on the parity of inversions + row of empty tile
        return (inversions + emptyRow) % 2 === 0;
    }

    // Check if the puzzle is solved
    function isPuzzleSolved() {
        // Check if all tiles are in order (1-15 followed by empty)
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const expectedValue = i * 4 + j + 1;
                if (expectedValue < 16) {
                    if (board[i][j] !== expectedValue) {
                        return false;
                    }
                } else {
                    if (board[i][j] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Timer functions
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            timerSeconds++;
            updateTimerDisplay();
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function updateTimerDisplay() {
        timerElement.textContent = formatTime(timerSeconds);
    }

    function formatTime(seconds) {
        return `${seconds}s`;
    }

    function updateMovesDisplay() {
        movesCounter.textContent = moveCount;
    }

    // Toggle pause state
    function togglePause() {
        isPaused = !isPaused;
        
        if (isPaused) {
            pauseBtn.textContent = 'Resume';
            stopTimer();
        } else {
            pauseBtn.textContent = 'Pause';
            startTimer();
        }
        
        // Re-render the board to update movable tiles
        renderBoard();
    }

    // Reset the game
    function resetGame() {
        resetGameState();
        shuffleBoard();
        renderBoard();
        startTimer();
    }
});
