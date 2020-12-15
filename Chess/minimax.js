function minimax(inputBoard, isMaximising, depth, alpha, beta) {
    if (depth == 0) {
        let eval = inputBoard.evaluate();
        return [eval, false];
    };

    if (isMaximising) {
        let bestValue = -Infinity;
        let moves = inputBoard.getMoves(true);
        let bestMove = moves[Math.floor(Math.random() * moves.length)];
        for (var move of moves) {
            move.from = [move.piece.x, move.y];
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
        return [bestValue, bestMove]
    } else {
        let bestValue = Infinity;
        let moves = inputBoard.getMoves(false);
        let bestMove = moves[Math.floor((Math.random()*moves.length))];
        for (var move of moves) {
            move.from = [move.piece.x, move.piece.y];
            
            let newBoard = inputBoard.newBoardFromMove(move);
            let newBoardValue = minimax(newBoard, true, depth - 1, alpha, beta)[0];
            //console.log(newBoardValue, move)
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