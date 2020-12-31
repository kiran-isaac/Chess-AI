game.board.setupPieces();

images.b.queen.onload = () => {
    game.board.draw();
    game.board.recalculateMoves();
};

function AIMove() {
    move = minimax(game.board, false, 2, -Infinity, Infinity)[1];
    game.board.apply(move);
    game.isWhitesTurn = !game.isWhitesTurn;
    game.board.draw();
};

document.onmousemove = function(e) {
    if (game.holding) {
        game.board.draw();
        game.holding.drawAt(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
        for (let move of game.holding.moves) {
            move.draw();
        };
        return;
    };

    game.board.draw();

    let x = Math.floor((e.clientX - canvas.getBoundingClientRect().left) / game.board.squaresize);
    let y = 7 - Math.floor((e.clientY - canvas.getBoundingClientRect().top) / game.board.squaresize);

    let pieceAt = game.board.getPieceAt(x, y);
    if (pieceAt) {
        game.board.recalculateMoves();
        for (let move of pieceAt.moves) {
            if (move.piece.isWhite == game.isWhitesTurn) move.draw();
        };
    };
};

document.onmousedown = function(e) {
    game.board.draw();

    let x = Math.floor((e.clientX - canvas.getBoundingClientRect().left) / game.board.squaresize);
    let y = 7 - Math.floor((e.clientY - canvas.getBoundingClientRect().top) / game.board.squaresize);

    if (game.holding) {
        game.holding.drawAt(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
        game.holding.putDown(x, y);
        if (game.players == 1) {
            AIMove();
        };
        return;
    };

    game.board.recalculateMoves();

    let pieceAt = game.board.getPieceAt(x, y);
    if (pieceAt) {
        if (pieceAt.isWhite == game.isWhitesTurn) {
            pieceAt.recalculateMoves();
            for (let move of pieceAt.moves) {
                move.draw();
            };
        };

        pieceAt.recalculateMoves();
        if ((game.players == 1 && pieceAt.isWhite && game.isWhitesTurn || game.players == 2 && pieceAt.isWhite == game.isWhitesTurn) && pieceAt.moves.length != 0) {
            game.holding = pieceAt;
            game.board.recalculateMoves();
        };
    };
};