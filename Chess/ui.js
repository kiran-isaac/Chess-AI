const assistance = document.getElementById("assistance");

assistance.say = function(message, delay = 1500) {
    clearTimeout(this.currentTimeout);
    this.style.opacity = "100%";
    this.innerHTML = message;
    this.currentTimeout = setTimeout(() => {
        assistance.style.opacity = "0%";
    }, delay);
};