const assistance = document.getElementById("assistance");

assistance.say = function(message, delay = 1500) {
    clearTimeout(this.currentTimeout);
    this.style.opacity = "100%";
    this.innerHTML = message;
    this.currentTimeout = setTimeout(() => {
        assistance.style.opacity = "0%";
    }, delay);
};

/*const showMovesToggle = document.getElementById("showMoves");

showMovesToggle.onclick = function() {
    game.showMoves = !game.showMoves;
    showMovesToggle.innerHTML = game.showMoves ? "Hide Moves" : "Show Moves";
    if (game.showMoves) {
        assistance.say("Hover over a piece to see its avaialble moves")
    }
};*/