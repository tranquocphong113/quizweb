import { appState } from "../model/state.js";
import { showScreen } from "./ui.js";
import { stopPlayerPolling, stopRoomStatusPolling } from "./room.js";

let showResultHandler = null;

export function setupGame(showResultCallback) {
  showResultHandler = showResultCallback;

  const nextQuestionBtn = document.getElementById("nextQuestionBtn");

  if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener("click", function () {
      const isLastQuestion =
        appState.game.currentQuestionIndex ===
        appState.currentQuiz.questions.length - 1;

      if (isLastQuestion) {
        showResultHandler();
        return;
      }

      appState.game.currentQuestionIndex++;
      appState.game.selected = false;

      renderQuestion();
    });
  }
}

export function goToPlayQuiz() {
  stopPlayerPolling();
  stopRoomStatusPolling();

  appState.game.currentQuestionIndex = 0;
  appState.game.score = 0;
  appState.game.selected = false;
  appState.game.isFinished = false;

  renderQuestion();
  showScreen("screen-play-quiz");
  startQuizTimer();
}

export function renderQuestion() {
  const index = appState.game.currentQuestionIndex;
  const question = appState.currentQuiz.questions[index];

  if (!question) {
    if (showResultHandler) {
      showResultHandler();
    }
    return;
  }

  document.getElementById("questionNumberText").textContent =
    `Câu ${index + 1}/${appState.currentQuiz.questions.length}`;

  document.getElementById("scoreText").textContent =
    `Điểm: ${appState.game.score}`;

  document.getElementById("playQuestionText").textContent = question.question;

  const optionBox = document.getElementById("optionBox");
  optionBox.innerHTML = "";

  question.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");

    button.className = "option-btn";
    button.textContent = `${["A", "B", "C", "D"][optionIndex]}. ${option}`;

    button.addEventListener("click", function () {
      chooseAnswer(optionIndex);
    });

    optionBox.appendChild(button);
  });

  const nextQuestionBtn = document.getElementById("nextQuestionBtn");

  nextQuestionBtn.classList.add("hidden");

  if (index === appState.currentQuiz.questions.length - 1) {
    nextQuestionBtn.textContent = "Nộp bài";
  } else {
    nextQuestionBtn.textContent = "Câu tiếp theo";
  }
}

function chooseAnswer(optionIndex) {
  if (appState.game.selected) return;

  appState.game.selected = true;

  const index = appState.game.currentQuestionIndex;
  const question = appState.currentQuiz.questions[index];

  const allOptions = document.querySelectorAll(".option-btn");

  allOptions.forEach((btn, i) => {
    btn.disabled = true;

    if (i === question.correctAnswer) {
      btn.classList.add("correct");
    }

    if (i === optionIndex && i !== question.correctAnswer) {
      btn.classList.add("wrong");
    }
  });

  if (optionIndex === question.correctAnswer) {
    appState.game.score++;
  }

  document.getElementById("scoreText").textContent =
    `Điểm: ${appState.game.score}`;

  document.getElementById("nextQuestionBtn").classList.remove("hidden");
}

/* Timer toàn bài */
export function startQuizTimer() {
  stopQuizTimer();

  let timeLimit = Number(appState.currentQuiz.timeLimit);

  if (!timeLimit || timeLimit <= 0) {
    timeLimit = 5;
  }

  appState.game.timeLeft = timeLimit * 60;
  appState.game.isFinished = false;

  updateTimerText();

  appState.game.timerId = setInterval(function () {
    appState.game.timeLeft--;

    updateTimerText();

    if (appState.game.timeLeft <= 0) {
      if (showResultHandler) {
        showResultHandler("Hết thời gian làm bài!");
      }
    }
  }, 1000);
}

export function stopQuizTimer() {
  if (appState.game.timerId !== null) {
    clearInterval(appState.game.timerId);
    appState.game.timerId = null;
  }
}

function updateTimerText() {
  const timerText = document.getElementById("timerText");

  if (!timerText) return;

  const minutes = Math.floor(appState.game.timeLeft / 60);
  const seconds = appState.game.timeLeft % 60;

  const minuteText = String(minutes).padStart(2, "0");
  const secondText = String(seconds).padStart(2, "0");

  timerText.textContent = `Thời gian: ${minuteText}:${secondText}`;

  if (appState.game.timeLeft <= 30) {
    timerText.classList.add("warning");
  } else {
    timerText.classList.remove("warning");
  }
}
