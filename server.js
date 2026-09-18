const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { WebcastPushConnection } = require("tiktok-live-connector");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

const state = {
  guessNumber: {
    enabled: true,
    min: 1,
    max: 100,
    secret: 42,
    winner: null,
    lastGuess: null
  }
};

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/state", (req, res) => res.json(state));

app.get("/overlay", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "overlay.html"))
);

function broadcast() {
  io.emit("state", state);
}

function setGame(patch) {
  Object.assign(state.guessNumber, patch);
  broadcast();
}

function checkGuess(username, guess) {
  const g = state.guessNumber;
  if (!g.enabled || !Number.isFinite(guess)) return;

  g.lastGuess = { username, guess, at: Date.now() };

  if (guess === g.secret && !g.winner) {
    g.winner = { username, guess, at: Date.now() };
  }
  broadcast();
}

app.post("/api/guess-number", (req, res) => {
  const { enabled, min, max, secret, action } = req.body || {};

  if (action === "new-round") {
    const lo = Number.isFinite(Number(min)) ? Number(min) : state.guessNumber.min;
    const hi = Number.isFinite(Number(max)) ? Number(max) : state.guessNumber.max;
    if (lo >= hi) return res.status(400).json({ error: "Minimum must be lower than maximum." });

    state.guessNumber.min = lo;
    state.guessNumber.max = hi;
    state.guessNumber.secret = Number.isFinite(Number(secret))
      ? Number(secret)
      : Math.floor(Math.random() * (hi - lo + 1)) + lo;
    state.guessNumber.winner = null;
    state.guessNumber.lastGuess = null;
    state.guessNumber.enabled = true;
    broadcast();
    return res.json(state.guessNumber);
  }

  if (typeof enabled === "boolean") state.guessNumber.enabled = enabled;
  if (Number.isFinite(Number(min))) state.guessNumber.min = Number(min);
  if (Number.isFinite(Number(max))) state.guessNumber.max = Number(max);
  if (Number.isFinite(Number(secret))) state.guessNumber.secret = Number(secret);
  broadcast();
  res.json(state.guessNumber);
});

io.on("connection", socket => {
  socket.emit("state", state);
});

const username = process.env.TIKTOK_USERNAME;
if (username) {
  const connection = new WebcastPushConnection(username, {
    processInitialData: false
  });

  connection.connect()
    .then(() => console.log(`TikTok connected: @${username}`))
    .catch(err => console.error("TikTok connection failed:", err.message));

  connection.on("chat", data => {
    const message = String(data.comment || "").trim();
    const match = message.match(/\b\d{1,6}\b/);
    if (!match) return;

    const guess = Number(match[0]);
    if (guess < state.guessNumber.min || guess > state.guessNumber.max) return;

    checkGuess(
      data.uniqueId || data.nickname || "viewer",
      guess
    );
  });
} else {
  console.log("TIKTOK_USERNAME is not set. The dashboard and overlay still work in demo mode.");
}

server.listen(PORT, () => {
  console.log(`Zeets Deets Overlays running on port ${PORT}`);
});