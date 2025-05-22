document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const puzzleBoard = document.getElementById('puzzle-board');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    // Game state
    let boardSize = 4; // 4x4 board
    let board = [];
    let emptyPos = { row: 3, col: 3 }; // Bottom right corner
    let isAnimating = false;
    let moveCount = 0;
    
    // Initialize the game
    function initGame() {
        createBoard();
        shuffleBoard();
        renderBoard();
        addEventListeners();
    }
    
    // Create the initial board state
    function createBoard() {
        board = [];
        let counter = 1;
        
        for (let i = 0; i < boardSize; i++) {
            board[i] = [];
            for (let j = 0; j < boardSize; j++) {
                if (i === boardSize - 1 && j === boardSize - 1) {
                    board[i][j] = 0; // Empty space
                } else {
                    board[i][j] = counter++;
                }
            }
        }
    }
    
    // Shuffle the board
    function shuffleBoard() {
        // Reset move count
        moveCount = 0;
        
        // Perform random moves to shuffle
        const moves = 500; // Number of random moves to perform
        for (let i = 0; i < moves; i++) {
            const possibleMoves = getPossibleMoves();
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            moveTile(randomMove.row, randomMove.col, false);
        }
    }
    
    // Get all possible valid moves
    function getPossibleMoves() {
        const moves = [];
        const { row, col } = emptyPos;
        
        // Check all four directions
        if (row > 0) moves.push({ row: row - 1, col }); // Up
        if (row < boardSize - 1) moves.push({ row: row + 1, col }); // Down
        if (col > 0) moves.push({ row, col: col - 1 }); // Left
        if (col < boardSize - 1) moves.push({ row, col: col + 1 }); // Right
        
        return moves;
    }
    
    // Move a tile to the empty space
    function moveTile(row, col, animate = true) {
        if (isAnimating || !isValidMove(row, col)) return false;
        
        // Update board state
        board[emptyPos.row][emptyPos.col] = board[row][col];
        board[row][col] = 0;
        
        // Move the tile visually
        const tile = document.querySelector(`[data-number="${board[emptyPos.row][emptyPos.col]}"]`);
        if (animate) {
            isAnimating = true;
            tile.style.transition = 'transform 0.3s ease';
            
            // Calculate the translation
            const dx = (emptyPos.col - col) * (100 / boardSize);
            const dy = (emptyPos.row - row) * (100 / boardSize);
            
            tile.style.transform = `translate(${dx}%, ${dy}%)`;
            
            // After animation completes, update the DOM and check for win
            setTimeout(() => {
                tile.style.transition = 'none';
                tile.style.transform = 'translate(0, 0)';
                emptyPos = { row, col };
                renderBoard();
                isAnimating = false;
                moveCount++;
                
                if (checkWin()) {
                    setTimeout(() => {
                        alert(`Congratulations! You won in ${moveCount} moves!`);
                    }, 300);
                }
            }, 300);
        } else {
            emptyPos = { row, col };
        }
        
        return true;
    }
    
    // Check if a move is valid
    function isValidMove(row, col) {
        const { row: emptyRow, col: emptyCol } = emptyPos;
        return (
            (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow)
        );
    }
    
    // Check if the puzzle is solved
    function checkWin() {
        let counter = 1;
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (i === boardSize - 1 && j === boardSize - 1) {
                    // Last position should be empty (0)
                    if (board[i][j] !== 0) return false;
                } else if (board[i][j] !== counter++) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // Render the board in the DOM
    function renderBoard() {
        // Clear the board
        puzzleBoard.innerHTML = '';
        
        // Create tiles
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                const value = board[i][j];
                if (value === 0) {
                    // Empty space
                    const emptyTile = document.createElement('div');
                    emptyTile.className = 'tile empty';
                    emptyTile.dataset.row = i;
                    emptyTile.dataset.col = j;
                    puzzleBoard.appendChild(emptyTile);
                } else {
                    // Numbered tile
                    const tile = document.createElement('div');
                    tile.className = 'tile';
                    tile.textContent = value;
                    tile.dataset.number = value;
                    tile.dataset.row = i;
                    tile.dataset.col = j;
                    puzzleBoard.appendChild(tile);
                }
            }
        }
    }
    
    // Handle tile click
    function handleTileClick(e) {
        const tile = e.target.closest('.tile:not(.empty)');
        if (!tile || isAnimating) return;
        
        const row = parseInt(tile.dataset.row);
        const col = parseInt(tile.dataset.col);
        
        moveTile(row, col);
    }
    
    // Handle keyboard input
    function handleKeyDown(e) {
        if (isAnimating) return;
        
        const { row, col } = emptyPos;
        let newRow = row;
        let newCol = col;
        
        switch (e.key) {
            case 'ArrowUp':
                if (row < boardSize - 1) newRow = row + 1;
                break;
            case 'ArrowDown':
                if (row > 0) newRow = row - 1;
                break;
            case 'ArrowLeft':
                if (col < boardSize - 1) newCol = col + 1;
                break;
            case 'ArrowRight':
                if (col > 0) newCol = col - 1;
                break;
            default:
                return; // Ignore other keys
        }
        
        moveTile(newRow, newCol);
    }
    
    // Add event listeners
    function addEventListeners() {
        // Tile clicks
        puzzleBoard.addEventListener('click', handleTileClick);
        
        // Keyboard controls
        document.addEventListener('keydown', handleKeyDown);
        
        // Shuffle button
        shuffleBtn.addEventListener('click', () => {
            if (!isAnimating) {
                shuffleBoard();
                renderBoard();
            }
        });
        
        // Reset button
        resetBtn.addEventListener('click', () => {
            if (!isAnimating) {
                createBoard();
                renderBoard();
                moveCount = 0;
            }
        });
        
        // Touch support
        let touchStartX = 0;
        let touchStartY = 0;
        
        puzzleBoard.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        puzzleBoard.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY || isAnimating) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            // Only consider swipes longer than 30px
            if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
                // Handle tap on tile
                const touch = e.changedTouches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                const tile = element?.closest('.tile:not(.empty)');
                
                if (tile) {
                    const row = parseInt(tile.dataset.row);
                    const col = parseInt(tile.dataset.col);
                    moveTile(row, col);
                }
                
                return;
            }
            
            // Handle swipe
            const { row, col } = emptyPos;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal swipe
                if (dx > 30 && col > 0) {
                    // Swipe right - move left tile
                    moveTile(row, col - 1);
                } else if (dx < -30 && col < boardSize - 1) {
                    // Swipe left - move right tile
                    moveTile(row, col + 1);
                }
            } else {
                // Vertical swipe
                if (dy > 30 && row > 0) {
                    // Swipe down - move upper tile
                    moveTile(row - 1, col);
                } else if (dy < -30 && row < boardSize - 1) {
                    // Swipe up - move lower tile
                    moveTile(row + 1, col);
                }
            }
            
            touchStartX = 0;
            touchStartY = 0;
        }, { passive: true });
    }
    
    // Start the game
    initGame();
});