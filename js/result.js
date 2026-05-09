import { appState } from "../model/state.js";
import { api } from "../model/api.js";
import { showScreen } from "./ui.js";
import { stopQuizTimer } from "./gameplay.js";
import { stopPlayerPolling, stopRoomStatusPolling } from "./room.js";

/* Leaderboard polling */
let leaderboardPollInterval = null;

export function startLeaderboardPolling() {
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

export function stopLeaderboardPolling() {
  if (leaderboardPollInterval !== null) {
    clearInterval(leaderboardPollInterval);
    leaderboardPollInterval = null;
  }
}

export async function showResult(message = "") {
  if (appState.game.isFinished) return;

  appState.game.isFinished = true;

  stopQuizTimer();
  stopRoomStatusPolling();
  stopPlayerPolling();

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

export function setupResult() {
  const openHistoryBtn = document.getElementById("openHistoryBtn");

  if (openHistoryBtn) {
    openHistoryBtn.addEventListener("click", async function () {
      await renderHistory();
      showScreen("screen-history");
    });
  }
}
