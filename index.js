document.addEventListener("DOMContentLoaded", function() {
    const connect4 = new Connect4('#connect4');

    connect4.onPlayerMove = function() {
        document.getElementById('player').textContent = connect4.player;
    };
    
    document.getElementById('restart').addEventListener('click', function() {
        connect4.restart();
        connect4.updateEventListeners();
    });
});

class Connect4 {
    constructor(selector) {
        this.ROWS = 6;
        this.COLS = 7;
        this.player = 'Rouge';
        this.selector = selector;
        this.isGameOver = false;
        this.RougeWins = 0; // compteur de victoire Rouge
        this.JauneWins = 0; // compteur de victoire Jaune
        this.draws = 0; // Compteur d'égalité
        this.onPlayerMove = function() {};
        this.createGrid();
        this.setupEventListeners();
    }

    // Créer la grid
    createGrid() {
        const board = document.querySelector(this.selector);
        board.innerHTML = '';
        this.isGameOver = false;
        this.player = 'Rouge';
        for (let row = 0; row < this.ROWS; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');
            for (let col = 0; col < this.COLS; col++) {
                const colDiv = document.createElement('div');
                colDiv.classList.add('col', 'empty');
            colDiv.setAttribute('data-col', col);
            colDiv.setAttribute('data-row', row);
            rowDiv.appendChild(colDiv);
            }
        board.appendChild(rowDiv);
        }
    this.board = board;
    }


    setupEventListeners() {
        const that = this;
        const board = document.querySelector(this.selector);
        const findLastEmptyCell = function(col) {
        const cells = document.querySelectorAll(`.col[data-col='${col}']`);
            
        for (let i = cells.length - 1; i >= 0; i--) {
                const cell = cells[i];
                    if (cell.classList.contains('empty')) {
                        return cell;
                    }
                }
        return null;
    };


    function isBoardFull() {
        const cols = document.querySelectorAll('.col');
            
        for (const col of cols) {
                if (col.classList.contains('empty')) {
                    return false;
                }
            }
        return true;
    }

    function updateScores() {
        document.getElementById('scores').textContent = `Jaune: ${that.JauneWins} | Rouge: ${that.RougeWins} | Egalité: ${that.draws}`;
    }

    // Gestion de l'hover
    function handleMouseEnter(event) {
        if (that.isGameOver) return;
        
        const col = event.target.getAttribute('data-col');
        const lastEmptyCell = findLastEmptyCell(col);
        
        if (lastEmptyCell) {
            lastEmptyCell.classList.add(`next-${that.player}`);
        }
    }
    
    function handleMouseLeave(event) {
        if (that.isGameOver) return;
        const col = event.target.getAttribute('data-col');
        const lastEmptyCell = findLastEmptyCell(col);
        
        if (lastEmptyCell) {
            lastEmptyCell.classList.remove(`next-${that.player}`);
        }
    }  
    
    // Ajoute les pions et vérifie s'il y a une victoire
    function handleCellClick(event) {
        if (that.isGameOver) return;
        const col = event.target.getAttribute('data-col');
        const lastEmptyCell = findLastEmptyCell(col);
        
        if (lastEmptyCell) {
            lastEmptyCell.classList.remove('empty', `next-${that.player}`);
            lastEmptyCell.classList.add(that.player);
            lastEmptyCell.setAttribute('data-player', that.player);

        const winner = that.checkForWinner(
            parseInt(lastEmptyCell.getAttribute('data-row')),
            parseInt(lastEmptyCell.getAttribute('data-col'))
        );

        if (winner) {
            that.isGameOver = true;
            if (winner === 'Rouge') {
                that.RougeWins++;
            } else if (winner === 'Jaune') {
                that.JauneWins++;
            } else if (winner === 'Draw') {
                that.draws++;
            }

            updateScores();
            alert(`Partie terminée ! Joueur ${winner} a gagné !`);
            const emptyCells = document.querySelectorAll('.col.empty');
            
            for (const cell of emptyCells) {
                cell.classList.remove('empty');
            }
            return;
        }

        if (isBoardFull()) {
            that.isGameOver = true;
            that.draws++;
            updateScores();
            alert('Partie terminée : égalité.');
            return;
        }

        that.player = that.player === 'Rouge' ? 'Jaune' : 'Rouge';
        that.onPlayerMove();
        board.dispatchEvent(new Event('mouseenter'));
        }
    };

    const emptyCols = document.querySelectorAll('.col.empty');
    
    emptyCols.forEach(col => {
        col.addEventListener('mouseenter', handleMouseEnter);
        col.addEventListener('mouseleave', handleMouseLeave);
        col.addEventListener('click', handleCellClick);
    });
}
    
    removeEventListeners() {
        const emptyCols = document.querySelectorAll('.col.empty');
        
        emptyCols.forEach(col => {
            col.removeEventListener('mouseenter', this.handleMouseEnter);
            col.removeEventListener('mouseleave', this.handleMouseLeave);
            col.removeEventListener('click',this.handleCellClick);
        });
    }

    checkForWinner(row, col) {
        const that = this;
        let winner = null;

    function checkDirection(direction) {
        let total = 0;
        let i = row + direction.i;
        let j = col + direction.j;
        let nextCell = getCell(i, j);

        while (
            i >= 0 &&
            i < that.ROWS &&
            j >= 0 &&
            j < that.COLS &&
            nextCell.getAttribute('data-player') === that.player
        ) {
            total++;
            i += direction.i;
            j += direction.j;
            nextCell = getCell(i, j);
        }
        return total;
    }

    // Vérifie s'il y a 4 pions alignés avec les directions
    function checkWin(directionA, directionB) {
        const total = 1 + checkDirection(directionA) + checkDirection(directionB);
        
        if (total >= 4) {
            return that.player;
        } else {
            return null;
        }
    }

    // Vérifie la diagonal gauche a droite
    function checkdiagonalLeft() {
        return checkWin({ i: 1, j: -1 }, { i: -1, j: 1 });
    }
    
    // Vérifie la diagonal droite à gauche
    function checkdiagonalRight() {
        return checkWin({ i: 1, j: 1 }, { i: -1, j: -1 });
    }

    // Vérifie la vertical
    function checkVerticals() {
        return checkWin({ i: -1, j: 0 }, { i: 1, j: 0 });
    }
    
    // Vérifie l'horizontal
    function checkHorizontals() {
        return checkWin({ i: 0, j: -1 }, { i: 0, j: 1 });
    }
    
    //Récupère la cellule
    function getCell(i, j) {
        return document.querySelector(`.col[data-row='${i}'][data-col='${j}']`);
    }

    winner = (
        checkVerticals() ||
        checkHorizontals() ||
        checkdiagonalLeft() ||
        checkdiagonalRight()
    );

    return winner;
    }

    restart() {
        this.removeEventListeners(); // Enlève les vieux event listenner avant de récréer la grid
        this.createGrid();
        this.setupEventListeners(); // Remet les event listenners a la récréation de la grid
        this.onPlayerMove();
    }
}    