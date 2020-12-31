function loadImage(src) {
    var x = new Image();
    x.src = src;
    return x;
};

let images =  {
    w : {
        pawn : loadImage("images/wpawn.png"),
        bishop : loadImage("images/wbishop.png"),
        knight : loadImage("images/wknight.png"),
        rook : loadImage("images/wrook.png"),
        king : loadImage("images/wking.png"),
        queen : loadImage("images/wqueen.png")
    },
    
    b : {
        pawn : loadImage("images/bpawn.png"),
        bishop : loadImage("images/bbishop.png"),
        knight : loadImage("images/bknight.png"),
        rook : loadImage("images/brook.png"),
        king : loadImage("images/bking.png"),
        queen : loadImage("images/bqueen.png")
    }
};

let pieceValues = {
    pawn : 1,
    knight : 3,
    bishop : 3,
    rook : 5,
    queen : 9,
    king : 200
};

class Move {
    constructor(x, y, piece) {
        this.x = x;
        this.y = y;
        this.X = piece.x;
        this.Y = piece.y;
        this.piece = piece;
    };

    draw() {
        ctx.strokeStyle = this.piece.isWhite ? '#00f' : '#f00';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(this.piece.x * game.board.squaresize + game.board.squaresize/2, (7-this.piece.y) * game.board.squaresize + game.board.squaresize/2);
        ctx.lineTo(this.x * game.board.squaresize + game.board.squaresize/2, (7-this.y) * game.board.squaresize + game.board.squaresize/2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x * game.board.squaresize + game.board.squaresize/2, (7-this.y) * game.board.squaresize + game.board.squaresize/2, 15, 0, 2 * Math.PI);
        ctx.stroke();
    }
};

class Piece {
    constructor(x, y, board, id, isWhite, img, value) {
        this.x = x;
        this.y = y;
        this.board = board;
        this.id = id;
        this.isWhite = isWhite;
        this.player = isWhite ? this.board.white : this.board.black;
        this.enemy = isWhite ? this.board.black : this.board.white;
        this.img = img;
        this.value = value;

        this.firstMove = true;
        this.moves = [];
        this.attacking = [];

        this.board.map[7-this.y][this.x] = this;
    };

    putDown(x, y) {
        if (x == this.x && y == this.y) {
            game.holding = false;
            game.board.draw();
            return;
        };
        this.recalculateMoves();
        for (let move of this.moves) {
            if (move.x == x && move.y == y) {
                this.firstMove = false;
                game.board.apply(move);
                game.holding = false;
                game.board.draw();
                game.board.recalculateMoves();
                game.isWhitesTurn = false;
                if (game.players == 1) {
                    game.board.draw();
                    AIMove();
                    game.updateState();
                };
            };
        };
    };

    capture() {
        this.player.pieces = this.player.pieces.filter(x => x != this);
        this.board.pieces = this.board.pieces.filter(x => x != this);
        for (let move of this.player.attacking) {
            if (move.piece == this) {
                this.player.attacking.filter(x => x != move);
            };
        };

        for (let move of this.player.moves) {
            if (move.piece == this) {
                this.player.moves.filter(x => x != move);
            };
        };

        if (this.enemy.king) {
            this.enemy.king.recalculateMoves();
        };
    };

    forwards(steps = 1) {
        return this.isWhite ? steps : -steps;
    };

    draw() {
        ctx.drawImage(this.img, this.x * game.board.squaresize, (7-this.y) * game.board.squaresize, game.board.squaresize, game.board.squaresize);
    };

    drawAt(x, y) {
        ctx.drawImage(this.img, x - game.board.squaresize / 2, y - game.board.squaresize / 2, game.board.squaresize, game.board.squaresize);
    };

    recalculateMoves(checkCheck = true) {
        this.moves = [];
        this.attacking = [];

        for (let direction of this.attackDirections) {
            let x, y, pieceAt;
            for (let i = 1; i < 8; i++) {
                x = direction[0]*i + this.x;
                y = direction[1]*i + this.y;
                if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                    pieceAt = this.board.getPieceAt(x, y)
                    if (!pieceAt) {
                        this.moves.push(new Move(x, y, this));
                        this.attacking.push(new Move(x, y, this));
                    } else if (pieceAt.isWhite != this.isWhite) {
                        this.moves.push(new Move(x, y, this));
                        this.attacking.push(new Move(x, y, this));
                        if (pieceAt.id != King) {
                            break;
                        };
                    } else {
                        this.attacking.push(new Move(x, y, this));
                        break;
                    };
                } else {
                    break;
                };
            };
        };

        if (checkCheck) {
            this.checkFilter();
        };

        this.player.moves = this.player.moves.concat(this.moves);
        this.player.attacking = this.player.attacking.concat(this.attacking);
    };

    checkFilter() {
        if (this.player.king.isCheck.length) {
            for (let piece of this.player.king.isCheck) {
                for (let move of this.moves) {
                    let testBoard = game.board.newBoardFromMove(move);
                    let testPlayer = this.isWhite ? testBoard.white : testBoard.black;
                    let threataningPiece = testBoard.getPieceAt(piece.x, piece.y);
                    if (!threataningPiece) {
                        return;
                    };
                    threataningPiece.recalculateMoves();
                    testPlayer.king.recalculateMoves();
                    if (testPlayer.king.isCheck.length) {
                        this.moves = this.moves.filter(x => x != move);
                    };
                };
            };
        };
    };
};

class Rook extends Piece {
    constructor(x, y, board, isWhite) {
        super(x, y, board, Rook, isWhite, (isWhite ? images.w : images.b).rook, pieceValues.rook)
    
        this.attackDirections = [
            [1, 0],
            [0, 1],
            [-1, 0],
            [0, -1]
        ];
    }
};

class Queen extends Piece {
    constructor(x, y, board, isWhite) {
        super(x, y, board, Queen, isWhite, (isWhite ? images.w : images.b).queen, pieceValues.queen)
    
        this.attackDirections = [
            [1, 0],
            [0, 1],
            [-1, 0],
            [0, -1],
            [1, 1],
            [-1, 1],
            [1, -1],
            [-1, -1]
        ];
    }
};

class Bishop extends Piece {
    constructor(x, y, board, isWhite) {
        super(x, y, board, Bishop, isWhite, (isWhite ? images.w : images.b).bishop, pieceValues.bishop)
    
        this.attackDirections = [
            [1, 1],
            [-1, 1],
            [1, -1],
            [-1, -1]
        ];
    }
};

class Knight extends Piece {
    constructor(x, y, board, isWhite) {
        super(x, y, board, Knight, isWhite, (isWhite ? images.w : images.b).knight, pieceValues.knight);

        this.attackVectors = [
            [2, 1],
            [1, 2],
            [-2, 1],
            [-1, 2],
            [2, -1],
            [1, -2],
            [-2, -1],
            [-1, -2],
        ];
    };

    recalculateMoves(checkCheck = true) {
        this.moves = [];
        this.attacking = [];

        let x, y, pieceAt;
        for (let vector of this.attackVectors) {
            x = this.x + vector[0];
            y = this.y + vector[1];
            pieceAt = this.board.getPieceAt(x, y);

            if (x >= 0 && y >= 0 && x < 8 && y < 8 && (!pieceAt || pieceAt.isWhite != this.isWhite)) {
                this.moves.push(new Move(x, y, this));
            };

            if (Board.inBounds(x, y)) {
                this.attacking.push(new Move(x, y, this));
            };
        };

        if (checkCheck) {
            this.checkFilter();
        };

        this.player.moves = this.player.moves.concat(this.moves);
        this.player.attacking = this.player.attacking.concat(this.attacking);
    };
};

class Pawn extends Piece {
    constructor(x, y, board, isWhite) {
        super(x, y, board, Pawn, isWhite, (isWhite ? images.w : images.b).pawn, pieceValues.pawn);
    };

    recalculateMoves(checkCheck = true) {
        this.moves = [];
        this.attacking = [];

        let pieceAt = this.board.getPieceAt(this.x - 1, this.y + this.forwards());
        if (pieceAt && pieceAt.isWhite != this.isWhite) {
            this.moves.push(new Move(this.x - 1, this.y + this.forwards(), this));
        };
        
        pieceAt = this.board.getPieceAt(this.x + 1, this.y + this.forwards());
        if (pieceAt && pieceAt.isWhite != this.isWhite) {
            this.moves.push(new Move(this.x + 1, this.y + this.forwards(), this));
        };

        if (Board.inBounds(this.x + 1, this.y + this.forwards())) {
            this.attacking.push(new Move(this.x + 1, this.y + this.forwards(), this));
        };

        if (Board.inBounds(this.x - 1, this.y + this.forwards())) {
            this.attacking.push(new Move(this.x - 1, this.y + this.forwards(), this));
        };

        if (!this.board.getPieceAt(this.x, this.y + this.forwards())) {
            this.moves.push(new Move(this.x, this.y + this.forwards(), this));
            if (!this.board.getPieceAt(this.x, this.y + this.forwards(2)) && this.firstMove) {
                this.moves.push(new Move(this.x, this.y + this.forwards(2), this));
            };
        };

        if (checkCheck) {
            this.checkFilter();
        };

        this.player.moves = this.player.moves.concat(this.moves);
        this.player.attacking = this.player.attacking.concat(this.attacking);
    };
};

class King extends Piece {
    constructor(x, y, board, isWhite) {
        super(x, y, board, King, isWhite, (isWhite ? images.w : images.b).king, pieceValues.king);

        this.player.king = this;

        this.isCheck = [];

        this.attackVectors = [
            [1, 0],
            [0, 1],
            [-1, 0],
            [0, -1],
            [1, 1],
            [-1, 1],
            [1, -1],
            [-1, -1]
        ];
    };

    recalculateMoves() {
        this.moves = [];
        this.attacking = [];

        let x, y, pieceAt;

        let enemyAttackList = this.isWhite ? this.board.black.attacking : this.board.white.attacking;

        this.isCheck = [];
        for (let attack of enemyAttackList) {
            if (this.x == attack.x && this.y == attack.y) {
                this.isCheck.push(attack.piece);
            };
        };

        for (let vector of this.attackVectors) {
            x = this.x + vector[0];
            y = this.y + vector[1];
            pieceAt = this.board.getPieceAt(x, y);

            if (x >= 0 && y >= 0 && x < 8 && y < 8 && (!pieceAt || pieceAt.isWhite != this.isWhite)) {
                let attacked = false;

                for (let attack of enemyAttackList) {
                    if (attack.x == x && attack.y == y) {
                        attacked = true;
                    };
                };

                if (!attacked) {
                    this.moves.push(new Move(x, y, this));
                    this.attacking.push(new Move(x, y, this));
                }
            };
        };

        this.player.moves = this.player.moves.concat(this.moves);
        this.player.attacking = this.player.attacking.concat(this.attacking);
    };
};