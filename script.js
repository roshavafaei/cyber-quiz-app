"use strict";

/* QUESTIONS */
const questions = [
  {
    question:
      "Which type of attack intercepts communication between two parties without the knowledge?",
    choices: [
      "Phishing attack",
      "Man-in-the-Middle attack",
      "SQL Injection atack",
      "Denial of Service attack",
    ],
    answer: "Man-in-the-Middle attack",
  },
  {
    question: "What does XSS stand for in web security?",
    choices: [
      "Cross-Site Scripting",
      "Cross-Server Security",
      "External Script Sourcing",
      "Cross-System Syntax",
    ],
    answer: "Cross-Site Scripting",
  },
  {
    question:
      "Which hashing algorithm is considered cryptographically broken and should NOT be used for passwords?",
    choices: ["bcrypt", "SHA-256", "MD5", "Argon2"],
    answer: "MD5",
  },
  {
    question: "What is the primary purpose of a firewall in network security?",
    choices: [
      "Encrypt all outgoing traffic",
      "Scan files for viruses",
      "Monitor and control incoming and outgoing network traffic",
      "Authenticate user login sessions",
    ],
    answer: "Monitor and control incoming and outgoing network traffic",
  },
  {
    question:
      "Which SQL injection payload is commonly used to test if a login form is vulnerable?",
    choices: [
      "<script>alert(1)</script>",
      "' OR '1'='1",
      "../../../etc/password",
      "{{7*7}}",
    ],
    answer: "' OR '1'='1",
  },
  {
    question:
      'What does the principle of "least privilege" mean in cybersecurity?',
    choices: [
      "Users should have no privileges at all",
      "Admins should share one privileged account",
      "Users are granted only the minimum access needed to do their job",
      "All employees should have equal access to all systems",
    ],
    answer: "Users are granted only the minimum access needed to do their job",
  },
  {
    question:
      "Which HTTP header helps prevent Cross-Site Scripting by restricting where resources can be loaded from?",
    choices: [
      "X-Frame-Options",
      "Script-Transport-Security",
      "Content-Security-Policy",
      "X-Content-Type-Options",
    ],
    answer: "Content-Security-Policy",
  },
  {
    question:
      "What type of malware encrypts a victim's files and demands payment to restore access?",
    choices: ["Spyware", "Adware", "Ransomware", "Rootkit"],
    answer: "Ransomware",
  },
  {
    question: 'In HTTPS, what does "S" stand for and what does it provide?',
    choices: [
      "Speed - faster data transmission",
      "Secure - encrypted communication via TLS",
      "Static - prevents content from changing",
      "Signed - verifies the author of each page",
    ],
    answer: "Secure - encrypted communication via TLS",
  },
  {
    question:
      "Which vulnerability allows an attacker to inject malicious commands into a system by manipulating input passed to a shell?",
    choices: [
      "Cross-Site Request Forgery (CSRF)",
      "Buffer Overflow",
      "OS Command Injection",
      "Directory Traversal",
    ],
    answer: "OS Command Injection",
  },
];

/* CONFIG */
const SECONDS_PER_QUESTION = 30;
const TOTAL_QUESTIONS = questions.length;
const LETTERS = ["A", "B", "C", "D"];

const TIMER_CIRCUMFERENCE = 2 * Math.PI * 18;

const SCORE_CIRCUMFERENCE = 2 * Math.PI * 50;

const WARNING_THRESHOLD = 12;
const DANGER_THRESHOLD = 5;

/* STATE */
const state = {
  questionIndex: 0,
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  timeoutCount: 0,
  hasAnswered: false,
  timerId: null,
  secondsLeft: SECONDS_PER_QUESTION,
};

/* DOM REFRENCES */
const dom = {
  // Screens
  startScreen: document.getElementById("start-screen"),
  quizScreen: document.getElementById("quiz-screen"),
  resultScreen: document.getElementById("result-screen"),

  // start screen
  startBtn: document.getElementById("start-btn"),

  // Quiz header
  progressFill: document.getElementById("progress-bar-fill"),
  counter: document.getElementById("question-counter"),
  timerEl: document.getElementById("timer"),
  timerArc: document.getElementById("timer-arc"),
  timerLabel: document.getElementById("timer-label"),

  // Quiz body
  liveScore: document.getElementById("live-score-value"),
  questionTag: document.getElementById("question-tag"),
  questionText: document.getElementById("question-text"),
  optionsGrid: document.getElementById("options-grid"),
  feedback: document.getElementById("feedback"),
  nextBtn: document.getElementById("next-btn"),

  // Result screen
  resultBadge: document.getElementById("result-badge"),
  finalScore: document.getElementById("final-score"),
  scoreRingArc: document.getElementById("score-ring-arc"),
  resultMessage: document.getElementById("result-message"),
  correctCount: document.getElementById("correct-count"),
  timeoutCount: document.getElementById("timeout-count"),
  restartBtn: document.getElementById("restart-btn"),
};

/* SCREENS */
function showScreen(screenEl) {
  [dom.startScreen, dom.quizScreen, dom.resultScreen].forEach((screen) => {
    screen.classList.remove("screen--active");
  });
  screenEl.classList.add("screen--active");
}

/* QUIZ FLOW */
function startQuiz() {
  state.questionIndex = 0;
  state.score = 0;
  state.correctCount = 0;
  state.wrongCount = 0;
  state.timeoutCount = 0;
  state.hasAnswered = false;

  dom.liveScore.textContent = "0";

  showScreen(dom.quizScreen);
  showQuestion();
}

// render the current question amd its choices
function showQuestion() {
  if (state.questionIndex >= TOTAL_QUESTIONS) {
    showResults();
    return;
  }

  const question = questions[state.questionIndex];
  const number = state.questionIndex + 1;

  // reset per question
  state.hasAnswered = false;
  dom.feedback.textContent = "";
  dom.feedback.className = "feedback";
  dom.nextBtn.classList.add("btn--hidden");

  //update header
  setProgressBar(number);
  dom.counter.textContent = `${pad(number)} / ${pad(TOTAL_QUESTIONS)}`;

  // update question card
  dom.questionTag.textContent = `Q${number}`;
  dom.questionText.textContent = question.question;

  // animate the question text in
  dom.questionText.classList.remove("u-fade-up");
  void dom.questionText.offsetWidth;
  dom.questionText.classList.add("u-fade-up");

  // Build the option button
  buildOptions(question.choices);

  //start the countdown
  startTimer();
}

/** zero pad a number to 2 digits */
function pad(n) {
  return String(n).padStart(2, "0");
}

/** set the progress bar fill width based on current question number */
function setProgressBar(questionNumber) {
  const percent = ((questionNumber - 1) / TOTAL_QUESTIONS) * 100;
  dom.progressFill.style.width = `${percent}%`;
}

/** Clear the options grid and inject one button per choice.  */
function buildOptions(choices) {
  dom.optionsGrid.innerHTML = "";

  choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = " card option u-fade-up";
    button.style.animationDelay = `${index * 60}ms`;
    button.setAttribute("role", "listitem");
    button.dataset.choice = choice;

    // letter badge
    const letter = document.createElement("span");
    letter.className = "option__letter";
    letter.textContent = LETTERS[index];
    letter.setAttribute("aria-hidden", "true");

    //answer text
    const text = document.createElement("span");
    text.textContent = choice;

    button.appendChild(letter);
    button.appendChild(text);

    button.addEventListener("click", () => handleAnswer(choice, button));

    dom.optionsGrid.appendChild(button);
  });
}

/** Handle a user clicking an answer option. */
function handleAnswer(selectedChoice, clickedButton) {
  if (state.hasAnswered) return;
  state.hasAnswered = true;

  stopTimer();

  const correctAnswer = questions[state.questionIndex].answer;
  const isCorrect = selectedChoice === correctAnswer;

  if (isCorrect) {
    state.score++;
    state.correctCount++;
    dom.liveScore.textContent = state.score;
  } else state.wrongCount++;

  highlightOptions(clickedButton, correctAnswer, selectedChoice);
  showFeedback(isCorrect ? "correct" : "wrong");

  dom.nextBtn.classList.remove("btn--hidden");
}

/** reveals the correct answer */
function highlightOptions(clickedButton, correctAnswer, selectedChoice) {
  const buttons = dom.optionsGrid.querySelectorAll(".option");

  buttons.forEach((button) => {
    button.disabled = true;

    if (button.dataset.choice === correctAnswer)
      button.classList.add("option--correct");
    if (button === clickedButton && selectedChoice !== correctAnswer)
      button.classList.add("option--wrong");
  });
}

/** Show the feedback message with the right color */
function showFeedback(type) {
  const messages = {
    correct: ["Got it! ✓", "Correct! ✓", "That's right! ✓", "Perfect! ✓"],
    wrong: ["Not quite. ✗", "Wrong answer. ✗", "Incorrect! ✗"],
    timeout: ["Time's up! The correct answer is highlighted above."],
  };

  const pool = messages[type];
  const picked = pool[Math.floor(Math.random() * pool.length)];

  dom.feedback.textContent = picked;
  dom.feedback.className = `feedback feedback--${type}`;
}

/** move to the next question */
function nextQuestion() {
  state.questionIndex++;
  showQuestion();
}

/* TIMER */
function startTimer() {
  state.secondsLeft = SECONDS_PER_QUESTION;
  updateTimerDisplay(state.secondsLeft);

  clearInterval(state.timerId);

  state.timerId = setInterval(() => {
    state.secondsLeft--;
    updateTimerDisplay(state.secondsLeft);

    // update ring color
    dom.timerEl.classList.remove("timer--warning", "timer--danger");
    if (state.secondsLeft <= DANGER_THRESHOLD)
      dom.timerEl.classList.add("timer--danger");
    else if (state.secondsLeft <= WARNING_THRESHOLD)
      dom.timerEl.classList.add("timer--warning");

    if (state.secondsLeft <= 0) handleTimeout();
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerId);
  state.timerId = null;
  dom.timerEl.classList.remove("timer--warning", "timer--danger");
}

/** Update the svg and the text label to reflect seconds remaining */
function updateTimerDisplay(seconds) {
  dom.timerLabel.textContent = seconds;

  const fraction = seconds / SECONDS_PER_QUESTION;
  const dashOffset = TIMER_CIRCUMFERENCE * (1 - fraction);
  dom.timerArc.style.strokeDashoffset = dashOffset;
}

/** called when the clock hits zero. Reveals the answer and move on */
function handleTimeout() {
  if (state.hasAnswered) return;
  state.hasAnswered = true;
  state.timeoutCount++;

  stopTimer();

  const correctAnswer = questions[state.questionIndex].answer;
  dom.optionsGrid.querySelectorAll(".option").forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.choice === correctAnswer)
      btn.classList.add("option--correct");
  });

  showFeedback("timeout");
  dom.nextBtn.classList.remove("btn--hidden");
}

/* RESULTS */
function showResults() {
  stopTimer();
  showScreen(dom.resultScreen);

  const percentage = state.score / TOTAL_QUESTIONS;

  let badge, message;

  if (percentage === 1) {
    badge = "🏆 Perfect Score";
    message = "Flawless. Every single answer correct. Truly impressive!";
  } else if (percentage >= 0.8) {
    badge = "🌟 Outstanding";
    message =
      "Excellent work! You clearly know your stuff. Just a couple slipped by.";
  } else if (percentage >= 0.6) {
    badge = "👍 Solid Effort";
    message = "Good performance! A bit more study and you'll be at the top.";
  } else if (percentage >= 0.4) {
    badge = "📚 Keep Studying";
    message = "Not bad for a start. Review what you missed and try again.";
  } else {
    badge = "💡 Just Getting Started";
    message = "Everyone starts somewhere. Study up and come back stronger!";
  }

  // Fill in the result screen
  dom.resultBadge.textContent = badge;
  dom.resultMessage.textContent = message;
  dom.correctCount.textContent = state.correctCount;
  dom.wrongCount.textContent = state.wrongCount;
  dom.timeoutCount.textContent = state.timeoutCount;

  // Animate the number counting up
  animateCount(dom.finalScore, state.score);

  // Animate the score ring filling in
  const targetOffset = SCORE_CIRCUMFERENCE * (1 - percentage);

  requestAnimationFrame(() => {
    dom.scoreRingArc.style.strokeDashoffset = targetOffset;

    // Color the ring based on score
    if (percentage >= 0.8) {
      dom.scoreRingArc.style.stroke = "var(--color-correct)";
    } else if (percentage >= 0.5) {
      dom.scoreRingArc.style.stroke = "var(--color-accent)";
    } else {
      dom.scoreRingArc.style.stroke = "var(--color-wrong)";
    }
  });
}

/**
 * Animate a number counting up from 0 to a target
 * @param {HTMLElement} el - the element where the number is shown
 * @param {number} target - the final number
 */
function animateCount(el, target) {
  if (target === 0) {
    el.textContent = 0;
    return;
  }

  let current = 0;
  const step = 900 / target;

  const tick = setInterval(() => {
    current++;
    el.textContent = current;
    if (current >= target) {
      clearInterval(tick);
      el.textContent = target;
    }
  }, step);
}

/* EVENTS */
dom.startBtn.addEventListener("click", startQuiz);
dom.nextBtn.addEventListener("click", nextQuestion);
dom.restartBtn.addEventListener("click", startQuiz);
