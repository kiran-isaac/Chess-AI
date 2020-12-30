let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const squaresize = canvas.width / 8;

let gamestate = {
    carryingPiece : false,
    isWhitesTurn : true,
    whiteAttacking : [],
    blackAttacking : [],
    moveLog : []
};

class Board {
    constructor() {
        this.whitepieces = [];
        this.blackpieces = [];
        this.whitepawns = [];
        this.blackpawns = [];
    };

    static isMate() {
        return false;
    };

    evaluate() {
        let wVal = 0;
        let bVal = 0;
        for (let piece of this.whitepieces) {
            wVal += piece.value;
        };
        for (let piece of this.blackpieces) {
            bVal += piece.value;
        };
        let wMob = this.getMoves(true).length;
        let bMob = this.getMoves(false).length;
        return (wVal - bVal) + 0.5 * (wMob - bMob);
    };

    newBoardFromMove(move) {
        let newBoard = new Board();
        for (let piece of this.whitepieces) {
            let newPiece = new (piece.id)(piece.x, piece.y, true);
            if (piece.id == Pawn) {
                this.whitepawns.push(newPiece);
            };
            if (move.piece == piece) {
                move.piece = newPiece;
            };
            newBoard.whitepieces.push(newPiece);
        };
        for (let piece of this.blackpieces) {
            let newPiece = new (piece.id)(piece.x, piece.y, false);
            if (move.piece == piece) {
                move.piece = newPiece;
            };
            if (piece.id == Pawn) {
                this.blackpawns.push(newPiece);
            };
            newBoard.blackpieces.push(newPiece);
        };
        newBoard.apply(move);
        return newBoard;
    };

    recalculateAttacking() {
        gamestate.whiteAttacking = [];
        gamestate.blackAttacking = [];
        for (let piece of this.whitepieces) {
            gamestate.whiteAttacking = gamestate.whiteAttacking.concat(piece.calculateAttacking());
        };
        for (let piece of this.blackpieces) {
            gamestate.blackAttacking = gamestate.blackAttacking.concat(piece.calculateAttacking());
        };
    };

    apply(move) {
        let pieceAtLoc = this.getPieceAt(move.x, move.y);
        if (pieceAtLoc) {
            pieceAtLoc.capture(this);
        };
        move.piece.movecount += 1;
        move.piece.x = move.x;
        move.piece.y = move.y;
    };

    setupPieces() {
        this.whitepieces.push(
            new Rook(0, 0, true),
            new Knight(1, 0, true),
            new Bishop(2, 0, true),
            new Queen(3, 0, true),
            new King(4, 0, true),
            new Bishop(5, 0, true),
            new Knight(6, 0, true),
            new Rook(7, 0, true),

            new Pawn(0, 1, true),
            new Pawn(1, 1, true),
            new Pawn(2, 1, true),
            new Pawn(3, 1, true),
            new Pawn(4, 1, true),
            new Pawn(5, 1, true),
            new Pawn(6, 1, true),
            new Pawn(7, 1, true)
        );

        this.blackpieces.push(
            new Rook(0, 7, false),
            new Knight(1, 7, false),
            new Bishop(2, 7, false),
            new Queen(3, 7, false),
            new King(4, 7, false),
            new Bishop(5, 7, false),
            new Knight(6, 7, false),
            new Rook(7, 7, false),

            new Pawn(0, 6, false),
            new Pawn(1, 6, false),
            new Pawn(2, 6, false),
            new Pawn(3, 6, false),
            new Pawn(4, 6, false),
            new Pawn(5, 6, false),
            new Pawn(6, 6, false),
            new Pawn(7, 6, false)
        );
    };

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for (let x = 0; x < canvas.height; x += squaresize) {
            for (let y = 0; y < canvas.height; y += squaresize) {
                if (!((x % 2) && (y % 2) || (!(x % 2) && !(y % 2)))) {
                    ctx.fillRect(x, y, squaresize, squaresize);
                };
            };
        };
        this.showPieces()
    };

    getPieceAt(x, y) {
        for (let piece of this.whitepieces) {
            if (piece.x == x && piece.y == y) {
                return piece
            };
        };
        for (let piece of this.blackpieces) {
            if (piece.x == x && piece.y == y) {
                return piece
            };
        };
        return false;
    };

    getMoves(isWhite) {
        let out = [];
        if (isWhite) {
            for (let piece of this.whitepieces) {
                out = out.concat(piece.getAllMoves(this));
            };
        } else {
            for (let piece of this.blackpieces) {
                out = out.concat(piece.getAllMoves(this));
            };
        };
        return out;
    };

    showPieces() {
        for (let piece of this.whitepieces) {
            piece.draw();
        };
        for (let piece of this.blackpieces) {
            piece.draw();
        };
    };
};
