// Games Application
class Games {
    constructor() {
        this.currentGame = null;
        this.gameStates = new Map();
        this.highScores = this.loadHighScores();
    }

    getWindowConfig() {
        return {
            title: 'Games',
            icon: 'ri-gamepad-line',
            width: 600,
            height: 500
        };
    }

    render() {
        return `
            <div class="games-content">
                <div class="games-header">
                    <h2>RetroOS Games</h2>
                    <p>Classic games reimagined for the modern web</p>
                </div>
                
                <div class="games-grid">
                    <div class="game-card" data-game="tic-tac-toe">
                        <div class="game-icon">
                            <i class="ri-grid-line"></i>
                        </div>
                        <h3 class="game-title">Tic-Tac-Toe</h3>
                        <p class="game-description">Classic strategy game for two players</p>
                        <div class="game-stats">
                            <span>Best: ${this.highScores.tictactoe || 0} wins</span>
                        </div>
                    </div>
                    
                    <div class="game-card" data-game="snake">
                        <div class="game-icon">
                            <i class="ri-bug-line"></i>
                        </div>
                        <h3 class="game-title">Snake</h3>
                        <p class="game-description">Guide the snake to eat food and grow longer</p>
                        <div class="game-stats">
                            <span>High Score: ${this.highScores.snake || 0}</span>
                        </div>
                    </div>
                    
                    <div class="game-card" data-game="memory">
                        <div class="game-icon">
                            <i class="ri-brain-line"></i>
                        </div>
                        <h3 class="game-title">Memory Match</h3>
                        <p class="game-description">Test your memory by matching pairs of cards</p>
                        <div class="game-stats">
                            <span>Best Time: ${this.highScores.memory || '--'}</span>
                        </div>
                    </div>
                    
                    <div class="game-card" data-game="puzzle">
                        <div class="game-icon">
                            <i class="ri-puzzle-line"></i>
                        </div>
                        <h3 class="game-title">Sliding Puzzle</h3>
                        <p class="game-description">Arrange numbered tiles in correct order</p>
                        <div class="game-stats">
                            <span>Best: ${this.highScores.puzzle || '--'} moves</span>
                        </div>
                    </div>
                    
                    <div class="game-card" data-game="breakout">
                        <div class="game-icon">
                            <i class="ri-rectangle-line"></i>
                        </div>
                        <h3 class="game-title">Breakout</h3>
                        <p class="game-description">Break all the bricks with your paddle and ball</p>
                        <div class="game-stats">
                            <span>High Score: ${this.highScores.breakout || 0}</span>
                        </div>
                    </div>
                    
                    <div class="game-card" data-game="tetris">
                        <div class="game-icon">
                            <i class="ri-layout-grid-line"></i>
                        </div>
                        <h3 class="game-title">Block Drop</h3>
                        <p class="game-description">Arrange falling blocks to clear lines</p>
                        <div class="game-stats">
                            <span>High Score: ${this.highScores.tetris || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    init(windowId) {
        this.windowId = windowId;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const window = document.getElementById(this.windowId);
        
        // Game card clicks
        window.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                this.startGame(card.dataset.game);
            });
        });
    }

    startGame(gameType) {
        this.currentGame = gameType;
        const content = document.querySelector(`#${this.windowId} .games-content`);
        
        switch (gameType) {
            case 'tic-tac-toe':
                content.innerHTML = this.renderTicTacToe();
                this.initTicTacToe();
                break;
            case 'snake':
                content.innerHTML = this.renderSnake();
                this.initSnake();
                break;
            case 'memory':
                content.innerHTML = this.renderMemory();
                this.initMemory();
                break;
            case 'puzzle':
                content.innerHTML = this.renderPuzzle();
                this.initPuzzle();
                break;
            case 'breakout':
                content.innerHTML = this.renderBreakout();
                this.initBreakout();
                break;
            case 'tetris':
                content.innerHTML = this.renderTetris();
                this.initTetris();
                break;
        }
    }

    renderTicTacToe() {
        return `
            <div class="game-container">
                <div class="game-header">
                    <button class="back-button">
                        <i class="ri-arrow-left-line"></i>
                        Back to Games
                    </button>
                    <h3>Tic-Tac-Toe</h3>
                    <button class="restart-button">
                        <i class="ri-refresh-line"></i>
                        Restart
                    </button>
                </div>
                
                <div class="tic-tac-toe-game">
                    <div class="game-status">Player X's Turn</div>
                    <div class="tic-tac-toe-board">
                        ${Array.from({ length: 9 }, (_, i) => `
                            <div class="tic-tac-toe-cell" data-index="${i}"></div>
                        `).join('')}
                    </div>
                    <div class="game-score">
                        <div class="score-item">
                            <span>Player X:</span>
                            <span class="score-x">0</span>
                        </div>
                        <div class="score-item">
                            <span>Player O:</span>
                            <span class="score-o">0</span>
                        </div>
                        <div class="score-item">
                            <span>Draws:</span>
                            <span class="score-draw">0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initTicTacToe() {
        let currentPlayer = 'X';
        let gameBoard = Array(9).fill('');
        let gameActive = true;
        let scores = { x: 0, o: 0, draw: 0 };
        
        const statusDisplay = document.querySelector(`#${this.windowId} .game-status`);
        const cells = document.querySelectorAll(`#${this.windowId} .tic-tac-toe-cell`);
        const backButton = document.querySelector(`#${this.windowId} .back-button`);
        const restartButton = document.querySelector(`#${this.windowId} .restart-button`);
        
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        const checkWinner = () => {
            for (let condition of winningConditions) {
                const [a, b, c] = condition;
                if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                    return gameBoard[a];
                }
            }
            return gameBoard.includes('') ? null : 'Tie';
        };
        
        const updateScores = () => {
            document.querySelector(`#${this.windowId} .score-x`).textContent = scores.x;
            document.querySelector(`#${this.windowId} .score-o`).textContent = scores.o;
            document.querySelector(`#${this.windowId} .score-draw`).textContent = scores.draw;
        };
        
        const resetGame = () => {
            gameBoard = Array(9).fill('');
            gameActive = true;
            currentPlayer = 'X';
            statusDisplay.textContent = "Player X's Turn";
            cells.forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('disabled', 'winner');
            });
        };
        
        const handleCellClick = (e) => {
            const index = parseInt(e.target.dataset.index);
            
            if (gameBoard[index] !== '' || !gameActive) return;
            
            gameBoard[index] = currentPlayer;
            e.target.textContent = currentPlayer;
            e.target.classList.add('disabled');
            
            const winner = checkWinner();
            if (winner) {
                gameActive = false;
                if (winner === 'Tie') {
                    statusDisplay.textContent = "It's a Tie!";
                    scores.draw++;
                } else {
                    statusDisplay.textContent = `Player ${winner} Wins!`;
                    scores[winner.toLowerCase()]++;
                    
                    // Highlight winning cells
                    for (let condition of winningConditions) {
                        const [a, b, c] = condition;
                        if (gameBoard[a] === winner && gameBoard[b] === winner && gameBoard[c] === winner) {
                            cells[a].classList.add('winner');
                            cells[b].classList.add('winner');
                            cells[c].classList.add('winner');
                            break;
                        }
                    }
                }
                
                updateScores();
                cells.forEach(cell => cell.classList.add('disabled'));
                
                // Auto restart after 3 seconds
                setTimeout(resetGame, 3000);
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
            }
        };
        
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });
        
        backButton.addEventListener('click', () => {
            this.showGameMenu();
        });
        
        restartButton.addEventListener('click', resetGame);
    }

    renderSnake() {
        return `
            <div class="game-container">
                <div class="game-header">
                    <button class="back-button">
                        <i class="ri-arrow-left-line"></i>
                        Back to Games
                    </button>
                    <h3>Snake</h3>
                    <div class="game-info">
                        <span>Score: <span class="current-score">0</span></span>
                        <span>High: <span class="high-score">${this.highScores.snake || 0}</span></span>
                    </div>
                </div>
                
                <div class="snake-game">
                    <div class="game-controls">
                        <button class="control-btn" data-action="start">Start Game</button>
                        <button class="control-btn" data-action="pause">Pause</button>
                        <div class="speed-control">
                            <label>Speed:</label>
                            <select class="speed-select">
                                <option value="200">Slow</option>
                                <option value="150" selected>Normal</option>
                                <option value="100">Fast</option>
                                <option value="50">Extreme</option>
                            </select>
                        </div>
                    </div>
                    
                    <canvas class="snake-canvas" width="400" height="400"></canvas>
                    
                    <div class="game-instructions">
                        <p>Use arrow keys or WASD to control the snake</p>
                        <p>Eat the red food to grow and increase your score</p>
                        <p>Don't hit the walls or yourself!</p>
                    </div>
                </div>
            </div>
        `;
    }

    initSnake() {
        const window = document.getElementById(this.windowId);
        const canvas = window.querySelector('.snake-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const scoreElement = window.querySelector('.current-score');
        const highScoreElement = window.querySelector('.high-score');
        const startButton = window.querySelector('[data-action="start"]');
        const pauseButton = window.querySelector('[data-action="pause"]');
        const speedSelect = window.querySelector('.speed-select');
        const backButton = window.querySelector('.back-button');
        
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        
        let snake = [{ x: 10, y: 10 }];
        let food = { x: 15, y: 15 };
        let dx = 0;
        let dy = 0;
        let score = 0;
        let gameRunning = false;
        let gameLoop = null;
        let speed = 150;
        
        const drawGame = () => {
            // Clear canvas
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw snake
            ctx.fillStyle = '#10b981';
            snake.forEach((segment, index) => {
                if (index === 0) {
                    // Head
                    ctx.fillStyle = '#059669';
                } else {
                    ctx.fillStyle = '#10b981';
                }
                ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
            });
            
            // Draw food
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
            
            // Draw grid
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            for (let i = 0; i <= tileCount; i++) {
                ctx.beginPath();
                ctx.moveTo(i * gridSize, 0);
                ctx.lineTo(i * gridSize, canvas.height);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(0, i * gridSize);
                ctx.lineTo(canvas.width, i * gridSize);
                ctx.stroke();
            }
        };
        
        const updateGame = () => {
            if (!gameRunning) return;
            
            const head = { x: snake[0].x + dx, y: snake[0].y + dy };
            
            // Check wall collision
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                gameOver();
                return;
            }
            
            // Check self collision
            if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                gameOver();
                return;
            }
            
            snake.unshift(head);
            
            // Check food collision
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                scoreElement.textContent = score;
                generateFood();
            } else {
                snake.pop();
            }
            
            drawGame();
        };
        
        const generateFood = () => {
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            
            // Make sure food doesn't spawn on snake
            if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
                generateFood();
            }
        };
        
        const gameOver = () => {
            gameRunning = false;
            clearInterval(gameLoop);
            
            // Update high score
            if (score > (this.highScores.snake || 0)) {
                this.highScores.snake = score;
                this.saveHighScores();
                highScoreElement.textContent = score;
                
                if (window.retroOS && window.retroOS.notifications) {
                    window.retroOS.notifications.show('New High Score!', `Snake: ${score} points`, 'success');
                }
            }
            
            // Show game over message
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        };
        
        const startGame = () => {
            snake = [{ x: 10, y: 10 }];
            dx = 0;
            dy = 0;
            score = 0;
            scoreElement.textContent = score;
            generateFood();
            gameRunning = true;
            
            clearInterval(gameLoop);
            gameLoop = setInterval(updateGame, speed);
            
            drawGame();
        };
        
        const pauseGame = () => {
            gameRunning = !gameRunning;
            if (gameRunning) {
                gameLoop = setInterval(updateGame, speed);
            } else {
                clearInterval(gameLoop);
            }
        };
        
        // Event listeners
        if (startButton) startButton.addEventListener('click', startGame);
        if (pauseButton) pauseButton.addEventListener('click', pauseGame);
        
        if (speedSelect) {
            speedSelect.addEventListener('change', () => {
                speed = parseInt(speedSelect.value);
                if (gameRunning) {
                    clearInterval(gameLoop);
                    gameLoop = setInterval(updateGame, speed);
                }
            });
        }
        
        if (backButton) {
            backButton.addEventListener('click', () => {
                clearInterval(gameLoop);
                this.showGameMenu();
            });
        }
        
        // Keyboard controls
        const keyHandler = (e) => {
            if (!gameRunning) return;
            
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (dy === 0) { dx = 0; dy = -1; }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (dy === 0) { dx = 0; dy = 1; }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (dx === 0) { dx = -1; dy = 0; }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (dx === 0) { dx = 1; dy = 0; }
                    break;
            }
        };
        
        document.addEventListener('keydown', keyHandler);
        
        // Store cleanup function
        this.snakeCleanup = () => {
            clearInterval(gameLoop);
            document.removeEventListener('keydown', keyHandler);
        };
        
        // Initial draw
        drawGame();
    }

    renderMemory() {
        return `
            <div class="game-container">
                <div class="game-header">
                    <button class="back-button">
                        <i class="ri-arrow-left-line"></i>
                        Back to Games
                    </button>
                    <h3>Memory Match</h3>
                    <div class="game-info">
                        <span>Time: <span class="game-timer">0:00</span></span>
                        <span>Moves: <span class="move-counter">0</span></span>
                    </div>
                </div>
                
                <div class="memory-game">
                    <div class="game-controls">
                        <button class="control-btn" data-action="start">New Game</button>
                        <select class="difficulty-select">
                            <option value="4">Easy (4x4)</option>
                            <option value="6" selected>Medium (6x6)</option>
                            <option value="8">Hard (8x8)</option>
                        </select>
                    </div>
                    
                    <div class="memory-board">
                        <!-- Cards will be generated here -->
                    </div>
                    
                    <div class="game-status">Click cards to find matching pairs!</div>
                </div>
            </div>
        `;
    }

    initMemory() {
        const window = document.getElementById(this.windowId);
        const board = window.querySelector('.memory-board');
        const startButton = window.querySelector('[data-action="start"]');
        const difficultySelect = window.querySelector('.difficulty-select');
        const timerElement = window.querySelector('.game-timer');
        const moveCounter = window.querySelector('.move-counter');
        const statusElement = window.querySelector('.game-status');
        const backButton = window.querySelector('.back-button');
        
        if (!board) return;
        
        let cards = [];
        let flippedCards = [];
        let matchedPairs = 0;
        let moves = 0;
        let startTime = null;
        let gameTimer = null;
        let boardSize = 6;
        
        const symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎵', '🎸', '🎺', '🎻', '🎹', '🎤', '🎧', '🎬', '🎞️', '🎪', '🎨', '🎭', '🎪', '🎵', '🎸', '🎺', '🎻', '🎹', '🎤', '🎧', '🎬', '🎞️', '🚀', '🛸', '🌟', '⭐'];
        
        const updateTimer = () => {
            if (!startTime) return;
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };
        
        const createBoard = () => {
            const totalCards = boardSize * boardSize;
            const pairs = totalCards / 2;
            const gameSymbols = symbols.slice(0, pairs);
            const cardSymbols = [...gameSymbols, ...gameSymbols];
            
            // Shuffle cards
            for (let i = cardSymbols.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cardSymbols[i], cardSymbols[j]] = [cardSymbols[j], cardSymbols[i]];
            }
            
            board.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
            board.innerHTML = cardSymbols.map((symbol, index) => `
                <div class="memory-card" data-index="${index}" data-symbol="${symbol}">
                    <div class="card-front">?</div>
                    <div class="card-back">${symbol}</div>
                </div>
            `).join('');
            
            cards = window.querySelectorAll('.memory-card');
            cards.forEach(card => {
                card.addEventListener('click', handleCardClick);
            });
        };
        
        const handleCardClick = (e) => {
            const card = e.currentTarget;
            
            if (card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length >= 2) {
                return;
            }
            
            if (!startTime) {
                startTime = Date.now();
                gameTimer = setInterval(updateTimer, 1000);
            }
            
            card.classList.add('flipped');
            flippedCards.push(card);
            
            if (flippedCards.length === 2) {
                moves++;
                moveCounter.textContent = moves;
                
                setTimeout(checkMatch, 1000);
            }
        };
        
        const checkMatch = () => {
            const [card1, card2] = flippedCards;
            
            if (card1.dataset.symbol === card2.dataset.symbol) {
                card1.classList.add('matched');
                card2.classList.add('matched');
                matchedPairs++;
                
                if (matchedPairs === (boardSize * boardSize) / 2) {
                    gameComplete();
                }
            } else {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }
            
            flippedCards = [];
        };
        
        const gameComplete = () => {
            clearInterval(gameTimer);
            const finalTime = timerElement.textContent;
            
            statusElement.textContent = `Congratulations! Completed in ${finalTime} with ${moves} moves!`;
            
            // Check for best time
            const currentTime = Date.now() - startTime;
            if (!this.highScores.memory || currentTime < this.highScores.memory) {
                this.highScores.memory = finalTime;
                this.saveHighScores();
                
                if (window.retroOS && window.retroOS.notifications) {
                    window.retroOS.notifications.show('New Best Time!', `Memory: ${finalTime}`, 'success');
                }
            }
        };
        
        const startNewGame = () => {
            boardSize = parseInt(difficultySelect.value);
            flippedCards = [];
            matchedPairs = 0;
            moves = 0;
            startTime = null;
            
            clearInterval(gameTimer);
            timerElement.textContent = '0:00';
            moveCounter.textContent = '0';
            statusElement.textContent = 'Click cards to find matching pairs!';
            const terminalContent = window.querySelector('.terminal-content');
            if (terminalContent) {
                terminalContent.scrollTop = terminalContent.scrollHeight;
            }
        };
        
        if (startButton) startButton.addEventListener('click', startNewGame);
        if (backButton) {
            backButton.addEventListener('click', () => {
                clearInterval(gameTimer);
                this.showGameMenu();
            });
        }
        
        // Initialize game
        startNewGame();
    }

    showGameMenu() {
        const content = document.querySelector(`#${this.windowId} .games-content`);
        if (content) {
            content.innerHTML = this.render().match(/<div class="games-content">([\s\S]*)<\/div>/)[1];
            this.setupEventListeners();
        }
    }

    loadHighScores() {
        try {
            const saved = localStorage.getItem('retroos-game-scores');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    }

    saveHighScores() {
        try {
            localStorage.setItem('retroos-game-scores', JSON.stringify(this.highScores));
        } catch (error) {
            console.error('Failed to save high scores:', error);
        }
    }

    cleanup() {
        // Clean up any game timers or intervals
        this.saveHighScores();
        if (this.snakeCleanup) {
            this.snakeCleanup();
        }
    }
}

// Add games-specific styles
const gamesStyles = document.createElement('style');
gamesStyles.textContent = `
    .game-container {
        padding: var(--spacing-lg);
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    
    .game-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-xl);
        padding-bottom: var(--spacing-lg);
        border-bottom: 1px solid var(--border-color);
    }
    
    .back-button, .restart-button {
        background: var(--accent-color);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        padding: var(--spacing-sm) var(--spacing-md);
        cursor: pointer;
        transition: all var(--transition-fast);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: 0.875rem;
    }
    
    .back-button:hover, .restart-button:hover {
        background: var(--accent-hover);
    }
    
    .game-info {
        display: flex;
        gap: var(--spacing-lg);
        font-size: 0.875rem;
        color: var(--text-secondary);
    }
    
    .tic-tac-toe-game {
        text-align: center;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    
    .tic-tac-toe-board {
        display: grid;
        grid-template-columns: repeat(3, 80px);
        grid-template-rows: repeat(3, 80px);
        gap: 4px;
        margin: var(--spacing-xl) 0;
        background: var(--border-color);
        padding: 4px;
        border-radius: var(--radius-lg);
    }
    
    .tic-tac-toe-cell {
        background: white;
        border-radius: var(--radius-md);
        font-size: 2rem;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-fast);
        color: var(--accent-color);
    }
    
    .tic-tac-toe-cell:hover:not(.disabled) {
        background: #f1f5f9;
        transform: scale(1.05);
    }
    
    .tic-tac-toe-cell.disabled {
        cursor: not-allowed;
    }
    
    .tic-tac-toe-cell.winner {
        background: var(--accent-color);
        color: white;
        animation: pulse 0.5s ease-out;
    }
    
    .game-status {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-lg);
    }
    
    .game-score {
        display: flex;
        gap: var(--spacing-xl);
        margin-top: var(--spacing-xl);
    }
    
    .score-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: 0.875rem;
    }
    
    .score-item span:last-child {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--accent-color);
    }
    
    .snake-game {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .game-controls {
        display: flex;
        gap: var(--spacing-lg);
        align-items: center;
        margin-bottom: var(--spacing-lg);
    }
    
    .control-btn {
        background: var(--accent-color);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        padding: var(--spacing-sm) var(--spacing-lg);
        cursor: pointer;
        transition: all var(--transition-fast);
        font-weight: 500;
    }
    
    .control-btn:hover {
        background: var(--accent-hover);
    }
    
    .speed-control {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: 0.875rem;
    }
    
    .speed-select, .difficulty-select {
        padding: var(--spacing-xs) var(--spacing-sm);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background: white;
        font-size: 0.875rem;
    }
    
    .snake-canvas {
        border: 2px solid var(--border-color);
        border-radius: var(--radius-lg);
        background: #1e293b;
        margin-bottom: var(--spacing-lg);
    }
    
    .game-instructions {
        text-align: center;
        color: var(--text-secondary);
        font-size: 0.875rem;
        line-height: 1.5;
    }
    
    .game-instructions p {
        margin-bottom: var(--spacing-xs);
    }
    
    .memory-game {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    
    .memory-board {
        display: grid;
        gap: var(--spacing-sm);
        margin: var(--spacing-lg) 0;
        justify-content: center;
        flex: 1;
    }
    
    .memory-card {
        width: 60px;
        height: 60px;
        position: relative;
        cursor: pointer;
        perspective: 1000px;
    }
    
    .card-front, .card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: bold;
        transition: transform 0.6s;
        border: 2px solid var(--border-color);
    }
    
    .card-front {
        background: var(--accent-color);
        color: white;
        transform: rotateY(0deg);
    }
    
    .card-back {
        background: white;
        color: var(--text-primary);
        transform: rotateY(-180deg);
    }
    
    .memory-card.flipped .card-front {
        transform: rotateY(180deg);
    }
    
    .memory-card.flipped .card-back {
        transform: rotateY(0deg);
    }
    
    .memory-card.matched {
        opacity: 0.6;
        pointer-events: none;
    }
    
    .memory-card.matched .card-front,
    .memory-card.matched .card-back {
        background: #10b981;
        color: white;
        border-color: #059669;
    }
    
    @media (max-width: 768px) {
        .games-grid {
            grid-template-columns: 1fr;
        }
        
        .game-header {
            flex-direction: column;
            gap: var(--spacing-md);
            align-items: stretch;
        }
        
        .game-info {
            justify-content: center;
        }
        
        .tic-tac-toe-board {
            grid-template-columns: repeat(3, 60px);
            grid-template-rows: repeat(3, 60px);
        }
        
        .snake-canvas {
            width: 300px;
            height: 300px;
        }
        
        .memory-card {
            width: 50px;
            height: 50px;
        }
        
        .card-front, .card-back {
            font-size: 1.25rem;
        }
    }
`;
document.head.appendChild(gamesStyles);