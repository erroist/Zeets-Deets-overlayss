const socket = io();
const enabled = document.getElementById("enabled");
const min = document.getElementById("min");
const max = document.getElementById("max");
const secret = document.getElementById("secret");
const previewNumber = document.getElementById("previewNumber");
const winner = document.getElementById("previewWinner");
const winnerName = document.getElementById("previewWinnerName");
const activity = document.getElementById("activity");
const gameStatus = document.getElementById("gameStatus");

document.getElementById("overlayUrl").textContent = location.origin + "/overlay";
document.getElementById("openOverlay").href = location.origin + "/overlay";

function render(g){
  enabled.checked = g.enabled;
  min.value = g.min; max.value = g.max; secret.value = g.secret;
  gameStatus.textContent = g.enabled ? "ON" : "OFF";
  gameStatus.style.color = g.enabled ? "#39e58c" : "#ff667a";
  previewNumber.textContent = g.winner ? g.secret : "???";
  if(g.winner){
    winner.classList.remove("hidden");
    winnerName.textContent = "@" + g.winner.username.replace(/^@/,"");
  } else winner.classList.add("hidden");
  if(g.lastGuess) addActivity(g.lastGuess);
}
let seen = "";
function addActivity(item){
  const key = item.at + item.username + item.guess;
  if(key === seen) return;
  seen = key;
  const row = document.createElement("div");
  row.className = "guess-row";
  row.innerHTML = `<b>@${item.username.replace(/^@/,"")}</b><span>guessed ${item.guess}</span>`;
  const empty = activity.querySelector(".empty"); if(empty) empty.remove();
  activity.prepend(row);
}
socket.on("state", s => render(s.guessNumber));
socket.on("connect", () => document.getElementById("liveSource").textContent = "Realtime connected");

enabled.addEventListener("change", () => {
  fetch("/api/guess-number",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({enabled:enabled.checked})});
});
document.getElementById("newRound").onclick = async () => {
  await fetch("/api/guess-number",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
    action:"new-round",min:Number(min.value),max:Number(max.value),secret:Number(secret.value)
  })});
};
document.getElementById("test").onclick = async () => {
  const fake = prompt("Enter a viewer username to test:", "viewer123") || "viewer123";
  await fetch("/api/guess-number",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
    enabled:true,min:Number(min.value),max:Number(max.value),secret:Number(secret.value)
  })});
  socket.emit("noop");
  // Demo winner is reflected by temporarily using the public test endpoint below.
  fetch("/api/guess-number",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({secret:Number(secret.value)})});
  alert(`Test ready. Send ${secret.value} in TikTok chat to trigger the real winner.`);
};
document.getElementById("copy").onclick = async () => {
  await navigator.clipboard.writeText(location.origin + "/overlay");
  document.getElementById("copy").textContent = "COPIED!";
  setTimeout(()=>document.getElementById("copy").textContent="COPY",1200);
};
