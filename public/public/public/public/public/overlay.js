const number = document.getElementById("number");
const winner = document.getElementById("winner");
const winnerName = document.getElementById("winnerName");
const winnerNumber = document.getElementById("winnerNumber");
const hint = document.getElementById("hint");

function render(g){
  if(!g.enabled){
    document.querySelector(".overlay").style.display="none";
    return;
  }
  document.querySelector(".overlay").style.display="block";
  if(g.winner){
    number.textContent = g.secret;
    winnerName.textContent = "@" + g.winner.username.replace(/^@/,"");
    winnerNumber.textContent = g.winner.guess;
    winner.classList.remove("hidden");
    hint.textContent = "WE HAVE A WINNER!";
  } else {
    number.textContent = "???";
    winner.classList.add("hidden");
    hint.textContent = "TYPE YOUR GUESS IN THE LIVE CHAT";
  }
}
const socket = io();
socket.on("state", s => render(s.guessNumber));
