const player1 = {
    canvas: document.getElementById('tetris1'),
    context: document.getElementById('tetris1').getContext('2d'),
    left: 65,
    right: 68,
    down: 83,
    rotateL: 16,
    rotateR: 17
}

const player2 = {
    canvas: document.getElementById('tetris2'),
    context: document.getElementById('tetris2').getContext('2d'),
    left: 37,
    right: 39,
    down: 40,
    rotateL: 188,
    rotateR: 190
}

function player(playerNum, idNum) {
    playerNum.context.scale(20, 20);


    function createBoard(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    }
    
    function collision(board, player) {
        const m = player.matrix;
        const o = player.pos;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (board[y + o.y] &&
                        board[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function clearRow() {
        let rowCount = 1;
        outer: for (let y = board.length - 1; y > 0; --y) {
            for (let x = 0; x < board[y].length; ++x) {
                if (board[y][x] === 0) {
                    continue outer;
                }
            }

            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            ++y;

            player.score += rowCount * 10;
            rowCount *= 2;
        }
    }

    function createPiece(type) {
        if (type === 'I') {
            return [
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
            ];
        } else if (type === 'L') {
            return [
                [0, 2, 0],
                [0, 2, 0],
                [0, 2, 2],
            ];
        } else if (type === 'J') {
            return [
                [0, 3, 0],
                [0, 3, 0],
                [3, 3, 0],
            ];
        } else if (type === 'O') {
            return [
                [4, 4],
                [4, 4],
            ];
        } else if (type === 'Z') {
            return [
                [5, 5, 0],
                [0, 5, 5],
                [0, 0, 0],
            ];
        } else if (type === 'S') {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        } else if (type === 'T') {
            return [
                [0, 7, 0],
                [7, 7, 7],
                [0, 0, 0],
            ];
        }
    }

    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    playerNum.context.fillStyle = colors[value];
                    playerNum.context.fillRect(x + offset.x,
                        y + offset.y,
                        1, 1);
                }
            });
        });
    }

    function draw() {
        playerNum.context.fillStyle = '#000';
        playerNum.context.fillRect(0, 0, playerNum.canvas.width, playerNum.canvas.height);

        drawMatrix(board, { x: 0, y: 0 });
        drawMatrix(player.matrix, player.pos);
    }

    function merge(board, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x],
                ] = [
                        matrix[y][x],
                        matrix[x][y],
                    ];
            }
        }

        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    function playerDrop() {
        player.pos.y++;
        if (collision(board, player)) {
            player.pos.y--;
            merge(board, player);
            resetGame();
            clearRow();
            updateScore();
        }
        dropCounter = 0;
    }

    function movePiece(offset) {
        player.pos.x += offset;
        if (collision(board, player)) {
            player.pos.x -= offset;
        }
    }

    function resetGame() {
        const pieces = 'TJLOSZI';
        player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
        player.pos.y = 0;
        player.pos.x = (board[0].length / 2 | 0) -
            (player.matrix[0].length / 2 | 0);
        if (collision(board, player)) {
            board.forEach(row => row.fill(0));
            player.score = 0;
            updateScore();
        }
    }

    function rotatePiece(dir) {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, dir);
        while (collision(board, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix, -dir);
                player.pos.x = pos;
                return;
            }
        }
    }

    let dropCounter = 0;
    let dropInterval = 1000;

    let lastTime = 0;
    function update(time = 0) {
        const deltaTime = time - lastTime;

        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }

        lastTime = time;

        draw();
        requestAnimationFrame(update);
    }

    function updateScore() {
        document.getElementById(`score${idNum}`).innerText = player.score;
    }

    document.addEventListener('keydown', event => {
        if (event.keyCode === playerNum.left) {
            movePiece(-1);
        } else if (event.keyCode === playerNum.right) {
            movePiece(1);
        } else if (event.keyCode === playerNum.down) {
            playerDrop();
        } else if (event.keyCode === playerNum.rotateL) {
            rotatePiece(-1);
        } else if (event.keyCode === playerNum.rotateR) {
            rotatePiece(1);
        }
    });

    const colors = [
        null,
        '#f4ee42',
        '#5ff441',
        '#dd0f0f',
        '#dd760f',
        '#0fc4dd',
        '#2f0be2',
        '#e20abe',
    ];

    const board = createBoard(12, 20);

    const player = {
        pos: { x: 0, y: 0 },
        matrix: null,
        score: 0,
    };

    resetGame();
    updateScore();
    update();
    
}

player(player1, 1);
player(player2, 2);