$(document).ready(function() {
    
    const connect4 = new Connect4('#connect4');
  
    connect4.onPlayerMove = function() {
      $('#player').text(connect4.player);
    };
  
    $('#restart').click(function() {
      connect4.restart();
    });
  });
  
  class Connect4 {
    constructor(selector) {
      this.ROWS = 6;
      this.COLS = 7;
      this.player = 'Red';
      this.selector = selector;
      this.isGameOver = false;
      this.onPlayerMove = function() {};
      this.createGrid();
      this.setupEventListeners();
    }
  
    createGrid() {
      const $board = $(this.selector);
      console.log($board);
      $board.empty();
      this.isGameOver = false;
      this.player = 'Red';
      for (let row = 0; row < this.ROWS; row++) {
        const $row = $('<div>').addClass('row');
        for (let col = 0; col < this.COLS; col++) {
          const $col = $('<div>')
            .addClass('col empty')
            .attr('data-col', col)
            .attr('data-row', row);
          $row.append($col);
        }
        $board.append($row);
      }
    }
  
    setupEventListeners() {
      const $board = $(this.selector);
      const that = this;
  
      function findLastEmptyCell(col) {
        const cells = $(`.col[data-col='${col}']`);
        for (let i = cells.length - 1; i >= 0; i--) {
          const $cell = $(cells[i]);
          if ($cell.hasClass('empty')) {
            return $cell;
          }
        }
        return null;
      }
  
      $board.on('mouseenter', '.col.empty', function() {
        if (that.isGameOver) return;
        const col = $(this).data('col');
        const $lastEmptyCell = findLastEmptyCell(col);
        $lastEmptyCell.addClass(`next-${that.player}`);
      });
  
      $board.on('mouseleave', '.col', function() {
        $('.col').removeClass(`next-${that.player}`);
      });
  
      $board.on('click', '.col.empty', function() {
        if (that.isGameOver) return;
        const col = $(this).data('col');
        const $lastEmptyCell = findLastEmptyCell(col);
        $lastEmptyCell.removeClass(`empty next-${that.player}`);
        $lastEmptyCell.addClass(that.player);
        $lastEmptyCell.data('player', that.player);
  
        const winner = that.checkForWinner(
          $lastEmptyCell.data('row'),
          $lastEmptyCell.data('col')
        );
        if (winner) {
          that.isGameOver = true;
          alert(`Partie terminé ! Joueur ${that.player} a gagné !`);
          $('.col.empty').removeClass('empty');
          return;
        }
  
        that.player = that.player === 'Red' ? 'Yellow' : 'Red';
        that.onPlayerMove();
        $(this).trigger('mouseenter');
      });
    }
  
    checkForWinner(row, col) {
      const that = this;
  
      function $getCell(i, j) {
        return $(`.col[data-row='${i}'][data-col='${j}']`);
      }
  
      function checkDirection(direction) {
        let total = 0;
        let i = row + direction.i;
        let j = col + direction.j;
        let $next = $getCell(i, j);
        while (
          i >= 0 &&
          i < that.ROWS &&
          j >= 0 &&
          j < that.COLS &&
          $next.data('player') === that.player
        ) {
          total++;
          i += direction.i;
          j += direction.j;
          $next = $getCell(i, j);
        }
        return total;
      }
  
      function checkWin(directionA, directionB) {
        const total = 1 + checkDirection(directionA) + checkDirection(directionB);
        if (total >= 4) {
          return that.player;
        } else {
          return null;
        }
      }
  
      function checkDiagonalBLtoTR() {
        return checkWin({ i: 1, j: -1 }, { i: 1, j: 1 });
      }
  
      function checkDiagonalTLtoBR() {
        return checkWin({ i: 1, j: -1 }, { i: 1, j: 1 });
      }
  
      function checkVerticals() {
        return checkWin({ i: -1, j: 0 }, { i: 1, j: 0 });
      }
  
      function checkHorizontals() {
        return checkWin({ i: 0, j: -1 }, { i: 0, j: 1 });
      }
  
      return (
        checkVerticals() ||
        checkHorizontals() ||
        checkDiagonalBLtoTR() ||
        checkDiagonalTLtoBR()
      );
    }
  
    restart() {
      this.createGrid();
      this.onPlayerMove();
    }
  }

  /*
  setGameMode(mode) {
    this.gameMode = mode;
    if (this.gameMode === 'computer') {
      const computerMoveButton = document.getElementById('computerMove');
      computerMoveButton.style.display = 'block';
      computerMoveButton.addEventListener('click', () => {
        this.makeComputerMove();
      });
    } else {
      const computerMoveButton = document.getElementById('computerMove');
      computerMoveButton.style.display = 'none';
    }
  }

  minimax(depth, alpha, beta, maximizingPlayer) {
    if (depth === 0 || this.isGameOver) {
      return {
        score: this.evaluateBoard(),
      };
    }

    if (maximizingPlayer) {
      let maxScore = -Infinity;
      let bestMoveColumn = null;

      for (let col = 0; col < this.COLS; col++) {
        if (!this.isColumnFull(col)) {
          const row = this.findLastEmptyCell(col);
          this.makeMove(row, col, 'Red');

          const result = this.minimax(depth - 1, alpha, beta, false);

          this.undoMove(col);

          if (result.score > maxScore) {
            maxScore = result.score;
            bestMoveColumn = col;
          }

          alpha = Math.max(alpha, maxScore);

          if (beta <= alpha) {
            break;
          }
        }
      }

      return {
        score: maxScore,
        column: bestMoveColumn,
      };
    } else {
      let minScore = Infinity;
      let bestMoveColumn = null;

      for (let col = 0; col < this.COLS; col++) {
        if (!this.isColumnFull(col)) {
          const row = this.findLastEmptyCell(col);
          this.makeMove(row, col, 'Yellow');

          const result = this.minimax(depth - 1, alpha, beta, true);

          this.undoMove(col);

          if (result.score < minScore) {
            minScore = result.score;
            bestMoveColumn = col;
          }

          beta = Math.min(beta, minScore);

          if (beta <= alpha) {
            break;
          }
        }
      }

      return {
        score: minScore,
        column: bestMoveColumn,
      };
    }
  }

  evaluateBoard() {
    // Implement an evaluation function to assign a score to the current board state
    // You can evaluate the board based on the number of potential winning lines, disc positioning, etc.
    // Return a positive score if the board is favorable for the maximizing player (computer), and a negative score otherwise.
    // ...
  }

  playMove(col) {
    if (this.isGameOver) return;
  
    // Find the last empty cell in the chosen column
    const row = this.findLastEmptyCell(col);
    if (row === null) return; // Column is full, move is invalid
  
    const cell = this.getCell(row, col);
    cell.classList.remove('empty', `next-${this.player}`);
    cell.classList.add(this.player);
    cell.setAttribute('data-player', this.player);
  
    const winner = this.checkForWinner(row, col);
    if (winner) {
      this.isGameOver = true;
      if (winner === 'Red') {
        this.redWins++;
      } else if (winner === 'Yellow') {
        this.yellowWins++;
      } else if (winner === 'Draw') {
        this.draws++;
      }
      this.updateScores();
      alert(`Partie terminée ! Joueur ${winner} a gagné !`);
      const emptyCells = document.querySelectorAll('.col.empty');
      for (const cell of emptyCells) {
        cell.classList.remove('empty');
      }
      return;
    }
  
    if (this.isBoardFull()) {
      this.isGameOver = true;
      this.draws++;
      this.updateScores();
      alert('It\'s a draw! The game is over.');
      return;
    }
  
    this.player = this.player === 'Red' ? 'Yellow' : 'Red';
    this.onPlayerMove();
  }
  
  constructor(selector) {
    this.ROWS = 6;
    this.COLS = 7;
    this.player = 'Rouge';
    this.selector = selector;
    this.gameMode = 'player'; // Default game mode is player vs. player
    this.isGameOver = false; // Vérifie si la partie est terminée
    this.RougeWins = 0; // Compteur victoire Jaune
    this.JauneWins = 0; // Compteur victoire Jaune
    this.draws = 0; // Counter for Draws
    this.onPlayerMove = function() {};
    this.createGrid();
    this.setupEventListeners();
}
  */