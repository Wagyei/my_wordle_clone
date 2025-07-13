let secretWord = "";
let numCols = 5;
const numRows = 6;
let currentRow = 0;
let currentGuess = "";
let gameReady = false;
let guessCount = 0; // NEW: tracks valid guesses

function startGame() {
  const length = parseInt(document.getElementById("word-length").value);
  numCols = length;
  currentRow = 0;
  currentGuess = "";
  secretWord = "";
  gameReady = false;
  guessCount = 0; // Reset on new game

  document.getElementById("board").innerHTML = "";
  document.getElementById("answer").textContent = "";

  fetch(`/get-word?length=${length}`)
    .then(res => {
      if (!res.ok) throw new Error("No word found for this length.");
      return res.json();
    })
    .then(data => {
      if (!data.word || data.word.length !== length) {
        throw new Error("Fetched word is invalid.");
      }

      secretWord = data.word.toLowerCase();
      console.log("Secret word:", secretWord);
      initBoard();
      gameReady = true;
    })
    .catch(err => {
      alert("⚠️ Couldn't fetch a word. Try another length.");
      console.error(err);
    });
}

function initBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${numCols}, 60px)`;

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.id = `tile-${r}-${c}`;
      board.appendChild(tile);
    }
  }
}

document.addEventListener("keydown", function (e) {
  if (!gameReady || !secretWord || currentRow >= numRows) return;

  const key = e.key;

  if (key === "Backspace") {
    if (currentGuess.length > 0) {
      currentGuess = currentGuess.slice(0, -1);
      const tile = document.getElementById(`tile-${currentRow}-${currentGuess.length}`);
      tile.textContent = "";
    }
  } else if (key === "Enter") {
    if (currentGuess.length === numCols) {
      checkGuess();
    } else {
      shakeRow(currentRow);
    }
  } else if (/^[a-zA-Z]$/.test(key)) {
    if (currentGuess.length < numCols) {
      const tile = document.getElementById(`tile-${currentRow}-${currentGuess.length}`);
      tile.textContent = key.toUpperCase();
      currentGuess += key.toLowerCase();
    }
  }
});

function checkGuess() {
  fetch(`/check-word?word=${currentGuess}`)
    .then(res => res.json())
    .then(data => {
      if (!data.valid) {
        shakeRow(currentRow); // Shake if the word is not valid
        showMessage("❌ Word not in list"); // NEW: message for invalid word
        return;
      }

      guessCount++; // NEW: count valid guesses

      const results = Array(numCols).fill("absent");
      const secretUsed = Array(numCols).fill(false);
      const guessUsed = Array(numCols).fill(false);

      for (let i = 0; i < numCols; i++) {
        if (currentGuess[i] === secretWord[i]) {
          results[i] = "correct";
          secretUsed[i] = true;
          guessUsed[i] = true;
        }
      }

      for (let i = 0; i < numCols; i++) {
        if (!guessUsed[i]) {
          for (let j = 0; j < numCols; j++) {
            if (!secretUsed[j] && currentGuess[i] === secretWord[j]) {
              results[i] = "present";
              secretUsed[j] = true;
              break;
            }
          }
        }
      }

      for (let i = 0; i < numCols; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        tile.classList.remove("correct", "present", "absent");
        tile.classList.add(results[i]);
      }

      if (currentGuess === secretWord) {
        document.getElementById("answer").textContent = "🎉 You guessed it!";
        gameReady = false;
      } else {
        currentRow++;
        currentGuess = "";

        // NEW: Offer hint after 3 valid guesses
        if (guessCount === 3 && gameReady && currentRow < numRows) {
          const wantHint = confirm("Would you like a hint?");
          if (wantHint) {
            alert("💡 Hint: " + generateHint(secretWord));
          }
        }

        if (currentRow === numRows) {
          document.getElementById("answer").textContent = `😢 Game over! The word was: ${secretWord.toUpperCase()}`;
          gameReady = false;
        }
      }
    });
}

function generateHint(word) {
  const first = word[0];
  const last = word[word.length - 1];
  if (word.length <= 4) {
    return `${first} _ _ ${last}`;
  } else {
    const middle = word[Math.floor(word.length / 2)];
    return `${first} _ _ ${middle} _ _ ${last}`;
  }
}

function shakeRow(row) {
  for (let c = 0; c < numCols; c++) {
    const tile = document.getElementById(`tile-${row}-${c}`);
    tile.classList.add("shake");
    setTimeout(() => tile.classList.remove("shake"), 400);
  }
}

// NEW: Show message below board (you can style this in CSS)
function showMessage(msg) {
  let msgBox = document.getElementById("message");
  if (!msgBox) {
    msgBox = document.createElement("div");
    msgBox.id = "message";
    msgBox.style.textAlign = "center";
    msgBox.style.marginTop = "10px";
    msgBox.style.fontWeight = "bold";
    document.getElementById("board").after(msgBox);
  }

  msgBox.textContent = msg;
  msgBox.style.opacity = 1;
  setTimeout(() => {
    msgBox.style.opacity = 0;
  }, 2000);
}

window.startGame = startGame;
