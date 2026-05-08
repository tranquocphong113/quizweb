import { appState } from "../model/state.js";
import { api } from "../model/api.js";

const screens = document.querySelectorAll(".screen");

function showScreen(screenId) {
  screens.forEach((screen) => screen.classList.remove("active"));

  const screen = document.getElementById(screenId);

  if (screen) {
    screen.classList.add("active");
  }
}

document.querySelectorAll("[data-screen]").forEach((button) => {
  button.addEventListener("click", function () {
    if (this.dataset.screen === "screen-dashboard") {
      stopPlayerPolling();
      stopLeaderboardPolling();
      stopQuizTimer();
    }

    showScreen(this.dataset.screen);
  });
});

function updateUserName() {
  const userNameText = document.getElementById("userNameText");

  if (userNameText && appState.currentUser) {
    userNameText.textContent = "Xin chào, " + appState.currentUser.name;
  }
}

/* Đổi tab đăng nhập / đăng ký */
const showLoginTab = document.getElementById("showLoginTab");
const showRegisterTab = document.getElementById("showRegisterTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

if (showLoginTab && showRegisterTab && loginForm && registerForm) {
  showLoginTab.addEventListener("click", function () {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");

    showLoginTab.classList.add("active");
    showRegisterTab.classList.remove("active");
  });

  showRegisterTab.addEventListener("click", function () {
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

    showRegisterTab.classList.add("active");
    showLoginTab.classList.remove("active");
  });
}

/* Đăng ký */
if (registerForm) {
  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (name === "" || email === "" || password === "") {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const result = await api.register(name, email, password);

      if (!result.success) {
        alert(result.message);
        return;
      }

      alert(result.message || "Đăng ký thành công");
      showLoginTab.click();
    } catch (error) {
      console.log("Lỗi đăng ký:", error);
      alert(
        "Không thể đăng ký. Vui lòng kiểm tra file api/auth.php hoặc kết nối MySQL.",
      );
    }
  });
}

/* Đăng nhập */
if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (email === "" || password === "") {
      alert("Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      const result = await api.login(email, password);

      if (!result.success) {
        alert(result.message);
        return;
      }

      appState.currentUser = result.user;

      updateUserName();
      showScreen("screen-dashboard");
    } catch (error) {
      console.log("Lỗi đăng nhập:", error);
      alert(
        "Không thể đăng nhập. Vui lòng kiểm tra file api/auth.php hoặc kết nối MySQL.",
      );
    }
  });
}

/* Đăng xuất */
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    appState.currentUser = null;
    showScreen("screen-auth");
  });
}

/* Thêm câu hỏi */
const addQuestionBtn = document.getElementById("addQuestionBtn");

if (addQuestionBtn) {
  addQuestionBtn.addEventListener("click", function () {
    const questionText = document.getElementById("questionText").value.trim();
    const optionA = document.getElementById("optionA").value.trim();
    const optionB = document.getElementById("optionB").value.trim();
    const optionC = document.getElementById("optionC").value.trim();
    const optionD = document.getElementById("optionD").value.trim();
    const correctAnswer = Number(
      document.getElementById("correctAnswer").value,
    );

    if (
      questionText === "" ||
      optionA === "" ||
      optionB === "" ||
      optionC === "" ||
      optionD === ""
    ) {
      alert("Vui lòng nhập đầy đủ câu hỏi và đáp án");
      return;
    }

    appState.currentQuiz.questions.push({
      question: questionText,
      options: [optionA, optionB, optionC, optionD],
      correctAnswer,
    });

    clearQuestionForm();
    renderQuestionList();
  });
}

function clearQuestionForm() {
  document.getElementById("questionText").value = "";
  document.getElementById("optionA").value = "";
  document.getElementById("optionB").value = "";
  document.getElementById("optionC").value = "";
  document.getElementById("optionD").value = "";
  document.getElementById("correctAnswer").value = "0";
}

function renderQuestionList() {
  const questionList = document.getElementById("questionList");

  if (!questionList) return;

  questionList.innerHTML = "";

  appState.currentQuiz.questions.forEach((item, index) => {
    const div = document.createElement("div");

    div.className = "question-item";
    div.innerHTML = `
      <strong>Câu ${index + 1}:</strong> ${item.question}
      <br>
      <small>Đáp án đúng: ${["A", "B", "C", "D"][item.correctAnswer]}</small>
    `;

    questionList.appendChild(div);
  });
}

/* Tạo phòng */
const createRoomBtn = document.getElementById("createRoomBtn");

if (createRoomBtn) {
  createRoomBtn.addEventListener("click", async function () {
    const quizTitle = document.getElementById("quizTitle").value.trim();
    const timeLimit = Number(document.getElementById("quizTimeLimit").value);

    if (!appState.currentUser) {
      alert("Bạn cần đăng nhập trước");
      return;
    }

    if (quizTitle === "") {
      alert("Vui lòng nhập tên quiz");
      return;
    }

    if (!timeLimit || timeLimit <= 0) {
      alert("Thời gian làm bài phải lớn hơn 0");
      return;
    }

    if (appState.currentQuiz.questions.length === 0) {
      alert("Vui lòng thêm ít nhất 1 câu hỏi");
      return;
    }

    appState.currentQuiz.title = quizTitle;
    appState.currentQuiz.timeLimit = timeLimit;

    try {
      const quizResult = await api.createQuiz(
        appState.currentQuiz,
        appState.currentUser.id,
      );

      if (!quizResult.success) {
        alert(quizResult.message);
        return;
      }

      appState.currentQuiz.id = quizResult.quiz.id;

      const roomResult = await api.createRoom(
        appState.currentQuiz,
        appState.currentUser.name,
      );
      if (!roomResult.success) {
        alert(roomResult.message);
        return;
      }
      appState.currentRoom = roomResult.room;
      appState.currentQuiz = roomResult.room.quiz;

      renderWaitingRoom();
      showScreen("screen-waiting-room");
      startPlayerPolling();
    } catch (error) {
      console.log("Lỗi tạo phòng:", error);
      alert("Đã xảy ra lỗi khi tạo phòng");
    }
  });
}

function isCurrentUserHost() {
  if (!appState.currentUser || !appState.currentRoom) {
    return false;
  }

  return appState.currentUser.name === appState.currentRoom.hostName;
}

function updateStartButtonByRole() {
  const startQuizBtn = document.getElementById("startQuizBtn");

  if (!startQuizBtn) return;

  if (isCurrentUserHost()) {
    startQuizBtn.classList.remove("hidden");
    startQuizBtn.disabled = false;
  } else {
    startQuizBtn.classList.add("hidden");
    startQuizBtn.disabled = true;
  }
}

function renderWaitingRoom() {
  const roomCodeText = document.getElementById("roomCodeText");
  const playerList = document.getElementById("playerList");

  if (!roomCodeText || !playerList) return;

  roomCodeText.textContent = appState.currentRoom.code;

  playerList.innerHTML = "";

  appState.currentRoom.players.forEach((player) => {
    const div = document.createElement("div");

    div.className = "player-item";
    div.textContent = player;

    playerList.appendChild(div);
  });

  const playerCountText = document.getElementById("playerCountText");
  if (playerCountText) {
    playerCountText.textContent = `${appState.currentRoom.players.length} người đã tham gia`;
  }
  updateStartButtonByRole();
}
let playerPollInterval = null;
function startPlayerPolling() {
  stopPlayerPolling();

  playerPollInterval = setInterval(async function () {
    if (!appState.currentRoom || !appState.currentRoom.id) return;

    try {
      const result = await api.pollPlayers(appState.currentRoom.id);

      if (result.success) {
        appState.currentRoom.players = result.players;
        renderWaitingRoom();
      }
    } catch (error) {
      console.log("Lỗi polling players:", error);
    }
  }, 1000);
}

function stopPlayerPolling() {
  if (playerPollInterval !== null) {
    clearInterval(playerPollInterval);
    playerPollInterval = null;
  }
}
/* ===== POLLING: Cập nhật leaderboard theo thời gian thực ===== */
let leaderboardPollInterval = null;
function startLeaderboardPolling() {
  stopLeaderboardPolling();

  leaderboardPollInterval = setInterval(async function () {
    if (!appState.currentRoom || !appState.currentRoom.id) return;

    try {
      await renderResultLeaderboard();
    } catch (error) {
      console.log("Lỗi cập nhật bảng xếp hạng:", error);
    }
  }, 1000);
}

function stopLeaderboardPolling() {
  if (leaderboardPollInterval !== null) {
    clearInterval(leaderboardPollInterval);
    leaderboardPollInterval = null;
  }
}

/* Tham gia phòng */
const joinRoomBtn = document.getElementById("joinRoomBtn");

if (joinRoomBtn) {
  joinRoomBtn.addEventListener("click", async function () {
    const code = document
      .getElementById("joinRoomCode")
      .value.trim()
      .toUpperCase();

    if (!appState.currentUser) {
      alert("Bạn cần đăng nhập trước");
      return;
    }

    if (code === "") {
      alert("Vui lòng nhập mã phòng");
      return;
    }

    const result = await api.joinRoom(code, appState.currentUser.name);

    if (!result.success) {
      alert(result.message);
      return;
    }

    appState.currentRoom = result.room;
    appState.currentQuiz = result.room.quiz;

    renderWaitingRoom();
    showScreen("screen-waiting-room");
    startPlayerPolling();
  });
}

/* Timer toàn bài */
function startQuizTimer() {
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
      showResult("Hết thời gian làm bài!");
    }
  }, 1000);
}

function stopQuizTimer() {
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

/* Bắt đầu quiz */
const startQuizBtn = document.getElementById("startQuizBtn");

if (startQuizBtn) {
  startQuizBtn.addEventListener("click", function () {
    if (!isCurrentUserHost()) {
      alert("Chỉ host mới được bắt đầu phòng quiz");
      return;
    }

    appState.game.currentQuestionIndex = 0;
    appState.game.score = 0;
    appState.game.selected = false;
    appState.game.isFinished = false;

    stopPlayerPolling();

    renderQuestion();
    showScreen("screen-play-quiz");
    startQuizTimer();
  });
}

function renderQuestion() {
  const index = appState.game.currentQuestionIndex;
  const question = appState.currentQuiz.questions[index];

  if (!question) {
    showResult();
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

/* Câu tiếp theo / Nộp bài */
const nextQuestionBtn = document.getElementById("nextQuestionBtn");

if (nextQuestionBtn) {
  nextQuestionBtn.addEventListener("click", function () {
    const isLastQuestion =
      appState.game.currentQuestionIndex ===
      appState.currentQuiz.questions.length - 1;

    if (isLastQuestion) {
      showResult();
      return;
    }

    appState.game.currentQuestionIndex++;
    appState.game.selected = false;

    renderQuestion();
  });
}

async function showResult(message = "") {
  if (appState.game.isFinished) return;

  appState.game.isFinished = true;

  stopQuizTimer();

  const total = appState.currentQuiz.questions.length;
  const score = appState.game.score;

  const percent = total > 0 ? (score / total) * 100 : 0;
  const percentText = percent.toFixed(1);

  let resultTitle = "";

  if (message !== "") {
    resultTitle = `<p><strong>${message}</strong></p>`;
  }

  const resultText = document.getElementById("resultText");

  if (resultText) {
    resultText.innerHTML = `
      ${resultTitle}
      <p>Số câu đúng: <strong>${score}/${total}</strong></p>
      <p>Tỉ lệ đúng: <strong>${percentText}%</strong></p>
    `;
  }

  try {
    await api.saveScore({
      roomId: appState.currentRoom ? appState.currentRoom.id : 0,
      name: appState.currentUser ? appState.currentUser.name : "Khách",
      email: appState.currentUser ? appState.currentUser.email : "guest",
      quizTitle: appState.currentQuiz
        ? appState.currentQuiz.title
        : "Quiz chưa đặt tên",
      score: score,
      total: total,
    });
  } catch (error) {
    console.log("Lỗi lưu điểm:", error);
  }

  showScreen("screen-result");

  await renderResultLeaderboard();
  startLeaderboardPolling();
}

/* Lịch sử quiz */
const openHistoryBtn = document.getElementById("openHistoryBtn");

if (openHistoryBtn) {
  openHistoryBtn.addEventListener("click", async function () {
    await renderHistory();
    showScreen("screen-history");
  });
}

async function renderResultLeaderboard() {
  const leaderboardBody = document.getElementById("resultLeaderboardBody");

  if (!leaderboardBody) return;

  leaderboardBody.innerHTML = "";

  if (!appState.currentRoom || !appState.currentRoom.code) {
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="4">Chưa có dữ liệu phòng hiện tại</td>
      </tr>
    `;
    return;
  }

  const roomId = appState.currentRoom.id;
  const result = await api.getScoresByRoom(roomId);

  if (!result.success) {
    console.log("Lỗi lấy bảng xếp hạng:", result.message);
    return;
  }

  const scores = result.scores;

  scores.sort((a, b) => {
    if (b.percent !== a.percent) {
      return b.percent - a.percent;
    }

    return b.score - a.score;
  });

  if (scores.length === 0) {
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="4">Chưa có dữ liệu bảng xếp hạng</td>
      </tr>
    `;
    return;
  }

  scores.forEach((item, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td>${item.score}/${item.total}</td>
      <td>${item.percent}%</td>
    `;

    leaderboardBody.appendChild(tr);
  });
}

async function renderHistory() {
  const historyBody = document.getElementById("historyBody");

  if (!historyBody) return;

  historyBody.innerHTML = "";

  if (!appState.currentUser || !appState.currentUser.email) {
    historyBody.innerHTML = `
      <tr>
        <td colspan="6">Bạn chưa đăng nhập</td>
      </tr>
    `;
    return;
  }

  const email = appState.currentUser.email;
  const result = await api.getHistoryByUser(email);

  if (!result.success) {
    console.log("Lỗi lấy lịch sử:", result.message);
    return;
  }

  const history = result.history;

  if (history.length === 0) {
    historyBody.innerHTML = `
      <tr>
        <td colspan="6">Bạn chưa làm quiz nào</td>
      </tr>
    `;
    return;
  }

  history.forEach((item, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.quizTitle}</td>
      <td>${item.roomCode}</td>
      <td>${item.score}/${item.total}</td>
      <td>${item.percent}%</td>
      <td>${item.time}</td>
    `;

    historyBody.appendChild(tr);
  });
}
