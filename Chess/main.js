gamestate.board = new Board();

let messager = document.getElementById("message");

messager.innerHTML = "Your Turn";

//function isMate():

//for each piece every turn, create an array of captureable spaces for black and white. If every square the king is on/can move to is in this list,
//look at the pieces that can capture these squares. If any of these pieces can be captured then remove their capturable spaces, and see if all of the
//kings available moves are taken

let wKing;
let bKing;

canvas.onmousemove = function(e) {
    if (gamestate.carryingPiece) {
        gamestate.board.draw();
        let mouseX = Math.floor((e.clientX - canvas.getBoundingClientRect().left)/squaresize);
        let mouseY = 7 - Math.floor((e.clientY - canvas.getBoundingClientRect().top)/squaresize);

        gamestate.carryingPiece.drawAt(e.clientX - canvas.getBoundingClientRect().left - squaresize/2, e.clientY - canvas.getBoundingClientRect().top - squaresize/2);

        if (mouseX == gamestate.carryingPiece.x && mouseY == gamestate.carryingPiece.y) {
            messager.innerHTML = "";
        } else if (gamestate.carryingPiece.validateMove(mouseX, mouseY)) {
            messager.innerHTML = "Valid move";
        } else {
            messager.innerHTML = "Invalid move";
        };
    };
};

canvas.onmousedown = function(e) {
    let mouseX = Math.floor((e.clientX - canvas.getBoundingClientRect().left)/squaresize);
    let mouseY = 7 - Math.floor((e.clientY - canvas.getBoundingClientRect().top)/squaresize);

    let pieceAtLoc = gamestate.board.getPieceAt(mouseX, mouseY);
    
    if (!gamestate.carryingPiece) {
        if (!pieceAtLoc || !(pieceAtLoc.isWhite == pieceAtLoc.isWhite)) {
            return;
        };
        gamestate.carryingPiece = pieceAtLoc;
    };
};

function AImove() {
    let move = minimax(gamestate.board, false, 4, -Infinity, Infinity)[1];
    let pieceAtLoc = gamestate.board.getPieceAt(move.from[0], move.from[1]);
    temp = new Move(move.x, move.y, pieceAtLoc);
    temp.from = move.from;
    gamestate.moveLog.push(temp);
    console.log(gamestate.moveLog);
    gamestate.board.apply(temp);
    //console.log("################################ NEW TURN #############################");
    gamestate.board.draw();
    messager.innerHTML = "Your Turn";
};  

canvas.onmouseup = function(e) {
    let mouseX = Math.floor((e.clientX - canvas.getBoundingClientRect().left)/squaresize);
    let mouseY = 7 - Math.floor((e.clientY - canvas.getBoundingClientRect().top)/squaresize);
    if (gamestate.carryingPiece) {
        gamestate.carryingPiece.putDown(mouseX, mouseY);
    };
};

gamestate.board.setupPieces();

images.b.queen.onload = (() => {
    gamestate.board.draw();
});