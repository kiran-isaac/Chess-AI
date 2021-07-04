function minimax(inputBoard, isMaximising, depth, alpha, beta) {
    if (depth == 0) {
        let eval = inputBoard.evaluate();
        return [eval, false];
    };

    if (isMaximising) {
        let bestValue = -Infinity;
        let bestMove;
        let moves = inputBoard.getWhiteMoves();
        for (let move of moves) {
            let newBoard = inputBoard.newBoardFromMove(move);
            let newBoardValue = minimax(newBoard, false, depth - 1, alpha, beta)[0];
            if (newBoardValue > bestValue) {
                bestValue = newBoardValue
                bestMove = move;
            };
            alpha = Math.max(alpha, bestValue);
            if (alpha >= beta) {
                break
            };
        };
        return [bestValue, bestMove];
    } else {
        let bestValue = Infinity;
        let bestMove;
        let moves = inputBoard.getBlackMoves();
        for (let move of moves) {
            let newBoard = inputBoard.newBoardFromMove(move);
            let newBoardValue = minimax(newBoard, true, depth - 1, alpha, beta)[0];
            if (newBoardValue < bestValue) {
                bestValue = newBoardValue
                bestMove = move;
            };
            beta = Math.min(beta, bestValue);
            if (alpha >= beta) {
                break
            };
        };
        return [bestValue, bestMove];
    };
};
function AIMove() {
    move = minimax(game.board, false, 3, -Infinity, Infinity)[1];

    move.piece.firstMove = false;

    game.board.apply(move);
    game.board.draw();

    game.board.recalculateMoves();
    game.isWhitesTurn = true;
};