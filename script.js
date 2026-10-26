const WORDS = [
      { word: "sunflower", category: "Nature", hint: "A tall, sunny flower that follows the light." },
      { word: "pancakes", category: "Yummy things", hint: "A fluffy breakfast stack, usually with syrup." },
      { word: "dinosaur", category: "Wild things", hint: "A giant creature from a very long time ago." },
      { word: "stargazing", category: "Little adventures", hint: "Looking up at the night sky for fun." },
      { word: "watermelon", category: "Yummy things", hint: "A juicy summer fruit with a green rind." },
      { word: "backpack", category: "Everyday stuff", hint: "A bag you carry on your shoulders." },
      { word: "butterfly", category: "Nature", hint: "A colorful insect with delicate wings." },
      { word: "jellyfish", category: "Ocean life", hint: "A wobbly sea creature with trailing tentacles." },
      { word: "campfire", category: "Little adventures", hint: "A cozy outdoor fire for stories and s'mores." },
      { word: "rainbow", category: "Nature", hint: "A colorful arc that might appear after rain." },
      { word: "pineapple", category: "Yummy things", hint: "A tropical fruit with a spiky crown." },
      { word: "snowflake", category: "Nature", hint: "A tiny, one-of-a-kind bit of frozen weather." },
      { word: "marshmallow", category: "Yummy things", hint: "A soft, sweet treat that's great toasted." },
      { word: "treasure", category: "Little adventures", hint: "Something valuable you might find on a map." },
      { word: "penguin", category: "Ocean life", hint: "A tuxedo-wearing bird that loves chilly places." },
      { word: "moonlight", category: "Little adventures", hint: "The soft glow you see on a clear night." }
    ];
    const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const MAX_MISSES = 7;
    const PARTS = [...document.querySelectorAll("[data-part]")];
    const wordEl = document.getElementById("word");
    const keyboardEl = document.getElementById("keyboard");
    const messageEl = document.getElementById("message");
    const categoryEl = document.getElementById("category");
    const livesEl = document.getElementById("lives");
    const sceneCaption = document.getElementById("scene-caption");
    const hintButton = document.getElementById("hint-button");
    const hintCountEl = document.getElementById("hint-count");
    const overlay = document.getElementById("result-overlay");
    let current;
    let guessed = new Set();
    let misses = 0;
    let hintsLeft = 2;
    let streak = 0;
    let roundOver = false;

    function chooseWord() {
      const available = WORDS.filter(item => !current || item.word !== current.word);
      return available[Math.floor(Math.random() * available.length)];
    }

    function startGame() {
      current = chooseWord();
      guessed = new Set();
      misses = 0;
      hintsLeft = 2;
      roundOver = false;
      categoryEl.textContent = current.category;
      messageEl.textContent = "Pick a letter to get started!";
      messageEl.className = "message";
      hintButton.disabled = false;
      hintCountEl.textContent = "(2)";
      overlay.classList.remove("show");
      renderWord();
      renderKeyboard();
      renderLives();
      renderDrawing();
    }

    function renderWord() {
      wordEl.replaceChildren();
      [...current.word].forEach(letter => {
        const slot = document.createElement("span");
        slot.className = "letter-slot";
        const show = guessed.has(letter) || roundOver;
        slot.textContent = show ? letter : "";
        slot.setAttribute("aria-label", show ? letter : "blank");
        if (guessed.has(letter)) slot.classList.add("revealed");
        if (roundOver && !guessed.has(letter)) slot.classList.add("missed");
        wordEl.appendChild(slot);
      });
      wordEl.setAttribute("aria-label", `${current.word.length} letter word`);
    }

    function renderKeyboard() {
      keyboardEl.replaceChildren();
      for (const letter of ALPHABET) {
        const key = document.createElement("button");
        key.type = "button";
        key.className = "key";
        key.textContent = letter;
        key.setAttribute("aria-label", `Guess ${letter}`);
        key.disabled = guessed.has(letter.toLowerCase()) || roundOver;
        if (guessed.has(letter.toLowerCase())) key.classList.add(current.word.includes(letter.toLowerCase()) ? "correct" : "wrong");
        key.addEventListener("click", () => guess(letter.toLowerCase()));
        keyboardEl.appendChild(key);
      }
    }

    function renderLives() {
      livesEl.replaceChildren();
      for (let i = 0; i < MAX_MISSES; i++) {
        const heart = document.createElement("span");
        heart.className = `life${i < misses ? " lost" : ""}`;
        heart.textContent = "♥";
        heart.setAttribute("aria-hidden", "true");
        livesEl.appendChild(heart);
      }
      livesEl.setAttribute("aria-label", `${MAX_MISSES - misses} ${MAX_MISSES - misses === 1 ? "chance" : "chances"} left`);
      sceneCaption.innerHTML = misses === 0
        ? `You have <strong>${MAX_MISSES} chances</strong>. Make them count!`
        : `<strong>${MAX_MISSES - misses}</strong> ${MAX_MISSES - misses === 1 ? "chance" : "chances"} left — you’ve got this!`;
    }

    function renderDrawing() {
      PARTS.forEach((part, index) => part.classList.toggle("visible", index < misses));
    }

    function guess(letter) {
      if (roundOver || guessed.has(letter) || !ALPHABET.toLowerCase().includes(letter)) return;
      guessed.add(letter);
      if (!current.word.includes(letter)) misses++;
      renderWord();
      renderKeyboard();
      renderLives();
      renderDrawing();
      if ([...current.word].every(char => guessed.has(char))) finishGame(true);
      else if (misses >= MAX_MISSES) finishGame(false);
      else if (current.word.includes(letter)) {
        messageEl.textContent = "Nice one! That letter is in there.";
        messageEl.className = "message success";
      } else {
        messageEl.textContent = "Not quite — try another letter!";
        messageEl.className = "message error";
      }
    }

    function finishGame(won) {
      roundOver = true;
      if (won) {
        streak++;
        messageEl.textContent = "You got it! Beautifully done.";
        messageEl.className = "message success";
        document.getElementById("result-emoji").textContent = "🎉";
        document.getElementById("result-title").textContent = "You're a word wizard!";
        document.getElementById("result-copy").textContent = `The word was ${current.word.toUpperCase()}. Your streak is on fire!`;
      } else {
        streak = 0;
        messageEl.textContent = `The word was ${current.word.toUpperCase()} — better luck next time!`;
        messageEl.className = "message error";
        document.getElementById("result-emoji").textContent = "🌱";
        document.getElementById("result-title").textContent = "So close!";
        document.getElementById("result-copy").textContent = `The word was ${current.word.toUpperCase()}. Ready for a fresh start?`;
      }
      document.getElementById("streak").textContent = streak;
      renderWord();
      renderKeyboard();
      overlay.classList.add("show");
      document.getElementById("play-again").focus({ preventScroll: true });
    }

    function useHint() {
      if (roundOver || hintsLeft === 0) return;
      const unrevealed = [...new Set([...current.word].filter(letter => !guessed.has(letter)))];
      if (!unrevealed.length) return;
      const letter = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      hintsLeft--;
      hintCountEl.textContent = `(${hintsLeft})`;
      hintButton.disabled = hintsLeft === 0;
      guess(letter);
      if (!roundOver) {
        messageEl.textContent = `A little hint: ${current.hint}`;
        messageEl.className = "message success";
      }
    }

    document.getElementById("new-game").addEventListener("click", startGame);
    document.getElementById("play-again").addEventListener("click", startGame);
    hintButton.addEventListener("click", useHint);
    document.addEventListener("keydown", event => {
      if (event.ctrlKey || event.altKey || event.metaKey || event.repeat) return;
      const letter = event.key.toLowerCase();
      if (ALPHABET.toLowerCase().includes(letter)) guess(letter);
      if (event.key === "Escape" && roundOver) startGame();
    });

    startGame();
