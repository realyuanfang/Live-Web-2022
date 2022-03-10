let input = ''
document.addEventListener("keydown", dealWithKeyboard, false);
let leftness = 0;
let winCounterSpace = 0;
let winCounterOther = 0;
function dealWithKeyboard(input) {
    let rope = document.getElementById("rope");
    let replay = document.getElementById("replay");
    if (input.keyCode === 65) {
        leftness = leftness + 10;
        rope.style.left = leftness + "px";
        console.log(rope.offsetLeft)
    } else {
        leftness = leftness - 10;
        rope.style.left = leftness + "px";
        console.log(rope.offsetLeft)
    }
    if (rope.offsetLeft > 0.705 * window.innerWidth) {
        alert("Player 2 wins!")
        replay.style.display = "block";
        winCounterSpace = winCounterSpace + 1;
        document.getElementById("spacewins").innerHTML = `<strong> Player 2 wins: </strong> ${winCounterSpace}`

    } else if (rope.offsetLeft < 0.215 * window.innerWidth) {
        alert("Player 1 wins!")
        replay.style.display = "block";
        winCounterOther = winCounterOther + 1;
        document.getElementById("otherwins").innerHTML = `<strong> Player 1 wins: </strong> ${winCounterOther}`
    }

}
document.getElementById("spacewins").innerHTML = `<strong>Player 2 wins: </strong> ${winCounterSpace}`
document.getElementById("otherwins").innerHTML = `<strong>Player 1 wins: </strong> ${winCounterOther}`
function replay() {
    document.getElementById("rope").style.left = 0;
    leftness = 0;
}