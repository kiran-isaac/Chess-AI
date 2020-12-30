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

class Move {
    constructor(x, y, piece) {
        this.x = x;
        this.y = y;
        this.piece = piece
    };

    draw() {
        ctx.strokeStyle = '#ff0000';
        ctx.linewidth = 20;
        ctx.beginPath();
        ctx.moveTo(this.piece.x*squaresize + squaresize/2, (7-this.piece.y)*squaresize + squaresize/2);
        ctx.lineTo(this.x*squaresize + squaresize/2, (7-this.y)*squaresize + squaresize/2);
        ctx.stroke();
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

class Piece {
    constructor(x, y, id, isWhite, img, value) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.isWhite = isWhite;
        this.img = img;
        this.value = value;
        this.availableMoves = [];
        this.movecount = 0;
    };

    getAllMoves(inputBoard = gamestate.board) {
        var out = [];
        for (let vector of this.vectors) {
            if (this.validateMove(this.x + vector[0], this.y + vector[1], inputBoard)) {
                out.push(new Move(this.x + vector[0], this.y + vector[1], this));
            };
        };
        return out;
    };

    draw() {
        ctx.drawImage(this.img, this.x * squaresize, (7-this.y) * squaresize, squaresize, squaresize);
    };

    drawAt(x, y) {
        ctx.drawImage(this.img, x, y, squaresize, squaresize);
    };

    capture(b) {
        if (this.isWhite) {
            b.whitepieces = b.whitepieces.filter((x) => x != this);
        } else {
            b.blackpieces = b.blackpieces.filter((x) => x != this);
        };
    };

    putDown(x, y) {
        if (x == this.x && y == this.y) {
            gamestate.carryingPiece = false;
            gamestate.board.draw();
        };
        if (this.validateMove(x, y)) {
            var move = new Move(x, y, this);
            gamestate.carryingPiece = false;
            gamestate.isWhitesTurn = !this.isWhite;
            gamestate.board.apply(move);
            gamestate.board.draw();
            messager.innerHTML = "Calculating...";
            gamestate.moveLog.push(move);
            console.log(gamestate.moveLog)
            setTimeout(AImove, 10)
        } else {
            gamestate.carryingPiece = false;
            gamestate.board.draw();
        };
    };
};

class Pawn extends Piece {
    constructor(x, y, isWhite) {
        super(x, y, Pawn, isWhite, (isWhite ? images.w : images.b).pawn, 1)
        this.movecount = 0;

        this.value = pieceValues.pawn;
        
        this.vectors = [
            [-1, this.direction()],
            [1, this.direction()],
            [0, this.direction()],
            [0, this.direction(2)],
        ];
    };

    getMobility(inputBoard = gamestate.board) {
        let mobility = 0;
        if (inputBoard.getPieceAt(this.x, this.y+this.direction())) mobility += 1;
        if (inputBoard.getPieceAt(this.x, this.y+this.direction(2))) mobility += 1;
        return mobility;
    };

    direction(x = 1) {
        if (this.isWhite) {
            return 1 * x;
        } else {
            return -1 * x;
        };
    };

    validateMove(x, y, inputBoard = gamestate.board) {
        if ((x > 7) || (x < 0) || (y > 7) || (y < 0)) {
            return;
        };

        let pieceAtLoc = inputBoard.getPieceAt(x, y);

        let delta = {
            x: x - this.x,
            y: y - this.y
        };

        let possible = false;
        for (let vector of this.vectors) {
            if (vector[0] == delta.x && vector[1] == delta.y) {
                possible = true;
                break;
            };
        };

        if (!possible) {
            return false;
        };

        if (delta.x == 0) {
            if (pieceAtLoc || (delta.y == 2 && inputBoard.getPieceAt(x, y - 1))) {
                return false;
            } else {
                return true;
            }
        } else {
            if (!pieceAtLoc || (pieceAtLoc.isWhite == this.isWhite)) {
                return false;
            } else {
                return true;
            }
        }
    };
};

class Rook extends Piece {
    constructor(x, y, isWhite) {
        super(x, y, Rook, isWhite, (isWhite ? images.w : images.b).rook, 5);
        this.vectors = []

        this.value = pieceValues.rook;

        this.movecount = 0
        
        for (var i = 1; i < 8; i++) {
            this.vectors.push([0, i]);
            this.vectors.push([0, -i]);
            this.vectors.push([i, 0]);
            this.vectors.push([-i, 0]);
        };
    };

    validateMove(x, y, inputBoard = gamestate.board) {
        if ((x > 7) || (x < 0) || (y > 7) || (y < 0)) {
            return;
        };

        var pieceAtLoc = inputBoard.getPieceAt(x, y);

        let delta = {
            x: Math.abs(x - this.x),
            y: Math.abs(y - this.y)
        };

        if (!((delta.x == 0 && delta.y != 0) || (delta.x != 0 && delta.y == 0))) {
            return
        }

        var direction = this.getDirection(x, y);

        var path = this.getPath(x, y, direction);

        for (var space of path) {
            if (inputBoard.getPieceAt(space[0], space[1])) {
                return;
            };
        };
        if ((this.x == x && this.y != y) || (this.x != x && this.y == y)) {
            if (pieceAtLoc) {
                if ((this.isWhite && !pieceAtLoc.isWhite) || (!this.isWhite && pieceAtLoc.isWhite)) {
                    return true;
                }
            } else {
                return true;
            };
        };
        return false;
    };

    getDirection(x, y) {
        var deltax = 0;
        var deltay = 0;

        if (x > this.x) {
            deltax = 1
        } else if (x < this.x) {
            deltax = -1
        };

        if (y > this.y) {
            deltay = 1
        } else if (y < this.y) {
            deltay = -1
        };

        return [deltax, deltay];
    }

    getPath(x, y, direction) {
        var path = []

        var X = this.x;
        var Y = this.y;

        while (X != x || Y != y) {
            X += direction[0];
            Y += direction[1];

            path.push([X, Y])
        };

        path.pop()

        return path
    };
};

class Knight extends Piece {
    constructor(x, y, isWhite) {
        super(x, y, Knight, isWhite, (isWhite ? images.w : images.b).knight, 3);

        this.movecount = 0

        this.value = pieceValues.knight;

        this.vectors = [
            [1, 2],
            [2, 1],
            [-1, 2],
            [-2, 1],
            [1, -2],
            [2, -1],
            [-1, -2],
            [-2, -1],
        ]
    };

    validateMove(x, y, inputBoard = gamestate.board) {
        if ((x > 7) || (x < 0) || (y > 7) || (y < 0)) {
            return;
        };

        var pieceAtLoc = inputBoard.getPieceAt(x, y);

        var delta = [Math.abs(x - this.x), Math.abs(y - this.y)];
    
        if (!(delta[0] == 1 && delta[1] == 2 || delta[0] == 2 && delta[1] == 1)) {
            return;
        };

        if (pieceAtLoc) {
            if ((this.isWhite && !pieceAtLoc.isWhite) || (!this.isWhite && pieceAtLoc.isWhite)) {
    
                return true;
            }
        } else {
            return true;
        };
    };
};

class Bishop extends Piece {
    constructor(x, y, isWhite) {
        super(x, y, Bishop, isWhite, (isWhite ? images.w : images.b).bishop, 3);

        this.movecount = 0

        this.value = pieceValues.bishop;

        this.vectors = []
        
        for (var i = 1; i < 8; i++) {
            this.vectors.push([i, i]);
            this.vectors.push([i, -i]);
            this.vectors.push([-i, i]);
            this.vectors.push([-i, -i]);
        };
    };

    validateMove(x, y, inputBoard = gamestate.board) {
        if ((x > 7) || (x < 0) || (y > 7) || (y < 0)) {
            return;
        };

        var pieceAtLoc = inputBoard.getPieceAt(x, y);

        var delta = [Math.abs(x - this.x), Math.abs(y - this.y)]

        if (delta[0] != delta[1]) {
            return
        }

        var direction = this.getDirection(x, y);

        var path = this.getPath(x, y, direction);

        for (var space of path) {
            if (inputBoard.getPieceAt(space[0], space[1])) {
                return;
            }
        };

        if (pieceAtLoc) {
            if ((this.isWhite && !pieceAtLoc.isWhite) || (!this.isWhite && pieceAtLoc.isWhite)) {
                return true;
            }
        } else {
            return true;
        };

        return false;
    };

    getDirection(x, y) {
        var deltax = 0;
        var deltay = 0;

        if (x > this.x) {
            deltax = 1
        } else if (x < this.x) {
            deltax = -1
        };

        if (y > this.y) {
            deltay = 1
        } else if (y < this.y) {
            deltay = -1
        };

        return [deltax, deltay];
    }

    getPath(x, y, direction) {
        var path = []

        var X = this.x;
        var Y = this.y;

        while (X != x || Y != y) {
            X += direction[0];
            Y += direction[1];

            path.push([X, Y])
        };

        path.pop()
        return path
    };
};

class Queen extends Piece {
    constructor(x, y, isWhite) {
        super(x, y, Queen, isWhite, (isWhite ? images.w : images.b).queen, 9);

        this.movecount = 0;

        this.value = pieceValues.queen;

        this.vectors = [];

        for (var i = 1; i < 8; i++) {
            this.vectors.push([i, i]);
            this.vectors.push([i, -i]);
            this.vectors.push([-i, i]);
            this.vectors.push([-i, -i]);

            this.vectors.push([0, i]);
            this.vectors.push([0, -i]);
            this.vectors.push([i, 0]);
            this.vectors.push([-i, 0]);
        };
    };

    validateMove(x, y, inputBoard = gamestate.board) {
        if ((x > 7) || (x < 0) || (y > 7) || (y < 0)) {
            return;
        };

        var pieceAtLoc = inputBoard.getPieceAt(x, y);

        var delta = [Math.abs(x - this.x), Math.abs(y - this.y)]

        if (!((delta[0] == delta[1] || ((delta[0] == 0 && delta[1] != 0) || (delta[0] != 0 && delta[1] == 0))))) {
            return
        }

        var direction = this.getDirection(x, y);

        var path = this.getPath(x, y, direction);

        for (var space of path) {
            if (inputBoard.getPieceAt(space[0], space[1])) {
                return;
            }
        };

        if (pieceAtLoc) {
            if ((this.isWhite && !pieceAtLoc.isWhite) || (!this.isWhite && pieceAtLoc.isWhite)) {
                return true;
            }
        } else {
            return true;
        };
    };

    getDirection(x, y) {
        var deltax = 0;
        var deltay = 0;

        if (x > this.x) {
            deltax = 1
        } else if (x < this.x) {
            deltax = -1
        };

        if (y > this.y) {
            deltay = 1
        } else if (y < this.y) {
            deltay = -1
        };

        return [deltax, deltay];
    }

    getPath(x, y, direction) {
        var path = []

        var X = this.x;
        var Y = this.y;

        while (X != x || Y != y) {
            X += direction[0];
            Y += direction[1];

            path.push([X, Y])
        };

        path.pop()
        return path
    };
};

class King extends Piece {
    constructor(x, y, isWhite) {
        super(x, y, King, isWhite, (isWhite ? images.w : images.b).king, 0);

        this.movecount = 0;

        this.value = pieceValues.king;

        this.vectors = [
            [-1, 1],
            [0, 1],
            [1, 1],
            [-1, 0],
            [1, 0],
            [-1, -1],
            [0, -1],
            [1, -1]
        ];

        if (isWhite) {
            if (!wKing) {
                wKing = this;
            };
        } else {
            if (!bKing) {
                bKing = this;
            };
        };
    };

    validateMove(x, y, inputBoard = gamestate.board) {
        if ((x > 7) || (x < 0) || (y > 7) || (y < 0)) {
            return;
        };

        var pieceAtLoc = inputBoard.getPieceAt(x, y);

        var delta = [Math.abs(x - this.x), Math.abs(y - this.y)]

        if (delta[0] > 1 || delta[1] > 1) {
            return;
        };

        //let enemyMoves = inputBoard.getMoves(!this.isWhite);
        //for (let move of enemyMoves) {
        //    if (move.x == x && move.y == y) {
        //        return false;
        //    };
        //};

        if (pieceAtLoc) {
            if ((this.isWhite && !pieceAtLoc.isWhite) || (!this.isWhite && pieceAtLoc.isWhite)) {
    
                return true;
            }
        } else {
            return true;
        };

        return false;
    }
};