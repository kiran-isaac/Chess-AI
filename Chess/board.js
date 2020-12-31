const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var game = {
    showMoves : true,
    players : 2,
    isWhitesTurn : false,
    holding : false,
    updateState : function() {
        let wasJustMovedAgainst = this.isWhitesTurn ? this.board.black : this.board.white;
        if (wasJustMovedAgainst.king.isCheck) {
            if (wasJustMovedAgainst.moves.length == 0) {
                assistance.innerHTML = this.isWhitesTurn ? "Checkmate, black wins!" : "Checkmate, white wins!";
            } else {
                assistance.innerHTML = "Check";
            };
        } else {
            assistance.innerHTML = "";
        };
    }
};

class Player {
    constructor() {
        this.pieces = [];
        this.moves = [];
        this.attacking = [];
    };
};

class Board {
    constructor() {
        this.squaresize = canvas.width/8;

        this.pieces = [];
        this.map = [];

        for (let i = 0; i < 8; i++) {
            let row = [];
            for (let j = 0; j < 8; j++) {
                row.push(false);
            };
            this.map.push(row);
        };

        this.white = new Player();
        this.black = new Player();
    };

    setMapPos(x, y, value) {
        this.map[7-y][x] = value;
    }

    getPieceAt(x, y) {
        try {
            return this.map[7-y][x];
        } catch {
            return false;
        }
    };

    evaluate() {
        //this.recalculateMoves();
        let wVal = 0;
        let bVal = 0;
        for (let piece of this.white.pieces) {
            wVal += piece.value;
        };
        for (let piece of this.black.pieces) {
            bVal += piece.value;
        };
        //let wMob = this.white.moves.length;
        //let bMob = this.black.moves.length;
        return (wVal - bVal);// + 0.5 * (wMob - bMob);
    };

    apply(move) {
        let piece = this.getPieceAt(move.X, move.Y);
        let pieceAtDestination = this.getPieceAt(move.x, move.y);
        if (pieceAtDestination) {
            pieceAtDestination.capture();
        };
        this.setMapPos(move.X, move.Y, false);
        this.setMapPos(move.x, move.y, piece);
        piece.x = move.x;
        piece.y = move.y;
    };

    showPieces() {
        for (let piece of this.pieces) {
            if (game.holding == piece) {
                continue;
            }
            piece.draw();
        };
    };

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for (let x = 0; x < canvas.height; x += this.squaresize) {
            for (let y = 0; y < canvas.height; y += this.squaresize) {
                if (!((x % 2) && (y % 2) || (!(x % 2) && !(y % 2)))) {
                    ctx.fillRect(x, y, this.squaresize, this.squaresize);
                };
            };
        };
        this.showPieces();
    };

    newBoardFromMove(move) {
        let newBoard = new Board();

        let pieceAt;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                pieceAt = this.getPieceAt(i, j);
                if (pieceAt) {
                    if (move.piece == pieceAt) {
                        continue;
                    } else if (pieceAt.id == King) {
                        let newKing = new King(i, j, newBoard, pieceAt.isWhite);
                        if (pieceAt.isWhite) {
                            newBoard.white.king = newKing;
                        } else {
                            newBoard.black.king = newKing;
                        };
                    } else {
                        if (pieceAt.isWhite) {
                            newBoard.white.pieces.push(new (pieceAt.id)(i, j, newBoard, pieceAt.isWhite));
                        } else {
                            newBoard.black.pieces.push(new (pieceAt.id)(i, j, newBoard, pieceAt.isWhite));
                        };
                    };
                };
            };
        };

        let pieceToCapture = newBoard.getPieceAt(move.x, move.y);
        if (pieceToCapture) {
            pieceToCapture.capture();
        };
        let x = new (move.piece.id)(move.x, move.y, newBoard, move.piece.isWhite);

        this.pieces = this.white.pieces.concat(this.black.pieces);
        this.pieces.push(this.white.king, this.black.king);

        return newBoard;
    };

    setupPieces() {
        this.white.pieces = [
            new Rook(0, 0, this, true),
            new Knight(1, 0, this, true),
            new Bishop(2, 0, this, true),
            new Queen(3, 0, this, true),
            new Bishop(5, 0, this, true),
            new Knight(6, 0, this, true),
            new Rook(7, 0, this, true),

            //new Pawn(0, 1, this, true),
            //new Pawn(1, 1, this, true),
            new Pawn(2, 1, this, true),
            //new Pawn(3, 1, this, true),
            //new Pawn(4, 1, this, true),
            //new Pawn(5, 1, this, true),
            //new Pawn(6, 1, this, true),
            //new Pawn(7, 1, this, true),
        ];

        this.white.king = new King(4, 0, this, true);

        this.black.pieces = [
            new Rook(0, 7, this, false),
            new Knight(1, 7, this, false),
            new Bishop(2, 7, this, false),
            new Queen(3, 7, this, false),
            new Bishop(5, 7, this, false),
            new Knight(6, 7, this, false),
            new Rook(7, 7, this, false),

            // new Pawn(0, 6, this, false),
            // new Pawn(1, 6, this, false),
            // new Pawn(2, 6, this, false),
            // new Pawn(3, 6, this, false),
            // new Pawn(4, 6, this, false),
            // new Pawn(5, 6, this, false),
            // new Pawn(6, 6, this, false),
            // new Pawn(7, 6, this, false), 
        ];

        this.black.king = new King(4, 7, this, false);

        this.pieces = this.white.pieces.concat(this.black.pieces);
        this.pieces.push(this.white.king, this.black.king);
    };

    recalculateMoves(returnMoves = 0) {
        this.white.moves = [];
        this.white.attacking = [];
        this.black.moves = [];
        this.black.attacking = [];
        for (let piece of this.pieces) {
            piece.recalculateMoves();
        };
        try {
            this.white.king.recalculateMoves();
            this.black.king.recalculateMoves();
        } catch {
            let x = 1+ 1
        }
        
    };

    getWhiteMoves() {
        this.white.moves = [];
        this.white.attacking = [];

        for (let piece of this.white.pieces) {
            piece.recalculateMoves();
            let x = piece;
        };
        this.white.king.recalculateMoves();

        return this.white.moves;
    };

    getBlackMoves() {
        this.black.moves = [];
        this.black.attacking = [];

        for (let piece of this.black.pieces) {
            piece.recalculateMoves();
            let x = piece;
        };
        this.black.king.recalculateMoves();

        return this.black.moves;
    };
};

game.board = new Board();