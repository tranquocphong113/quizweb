import { appState } from "../model/state.js";
import { api } from "../model/api.js";
import { showScreen } from "./ui.js";
import { goToPlayQuiz } from "./gameplay.js";

export function isCurrentUserHost() {
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

export function renderWaitingRoom() {
  const roomCodeText = document.getElementById("roomCodeText");
  const playerList = document.getElementById("playerList");

  if (!roomCodeText || !playerList || !appState.currentRoom) return;

  roomCodeText.textContent = appState.currentRoom.code;

  playerList.innerHTML = "";

  const players = appState.currentRoom.players || [];

  players.forEach((player) => {
    const div = document.createElement("div");

    div.className = "player-item";
    div.textContent = player;

    playerList.appendChild(div);
  });

  const playerCountText = document.getElementById("playerCountText");

  if (playerCountText) {
    playerCountText.textContent = `${players.length} người đã tham gia`;
  }

  updateStartButtonByRole();
}

/* Polling danh sách người chơi + trạng thái phòng */
let playerPollInterval = null;

export function startPlayerPolling() {
  stopPlayerPolling();

  playerPollInterval = setInterval(async function () {
    if (!appState.currentRoom || !appState.currentRoom.id) return;

    try {
      const result = await api.pollPlayers(appState.currentRoom.id);

      console.log("poll players result:", result);

      if (result.success) {
        appState.currentRoom.players = result.players || [];

        if (result.status) {
          appState.currentRoom.status = String(result.status)
            .trim()
            .toLowerCase();
        }

        renderWaitingRoom();

        const currentScreen = document.querySelector(".screen.active");
        const isInWaitingRoom =
          currentScreen && currentScreen.id === "screen-waiting-room";

        if (isInWaitingRoom && appState.currentRoom.status === "started") {
          goToPlayQuiz();
        }
      }
    } catch (error) {
      console.log("Lỗi polling players:", error);
    }
  }, 1000);
}

export function stopPlayerPolling() {
  if (playerPollInterval !== null) {
    clearInterval(playerPollInterval);
    playerPollInterval = null;
  }
}

/* Polling trạng thái phòng */
let roomStatusPollInterval = null;

export function startRoomStatusPolling() {
  stopRoomStatusPolling();

  roomStatusPollInterval = setInterval(async function () {
    if (!appState.currentRoom || !appState.currentRoom.id) return;

    try {
      const result = await api.pollRoomStatus(appState.currentRoom.id);

      console.log("poll room status:", result);

      if (result.success && result.status) {
        appState.currentRoom.status = String(result.status)
          .trim()
          .toLowerCase();

        const currentScreen = document.querySelector(".screen.active");
        const isInWaitingRoom =
          currentScreen && currentScreen.id === "screen-waiting-room";

        if (isInWaitingRoom && appState.currentRoom.status === "started") {
          goToPlayQuiz();
        }
      }
    } catch (error) {
      console.log("Lỗi polling trạng thái phòng:", error);
    }
  }, 1000);
}

export function stopRoomStatusPolling() {
  if (roomStatusPollInterval !== null) {
    clearInterval(roomStatusPollInterval);
    roomStatusPollInterval = null;
  }
}

export function setupRoom() {
  const joinRoomBtn = document.getElementById("joinRoomBtn");
  const startQuizBtn = document.getElementById("startQuizBtn");

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

      try {
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

        if (!isCurrentUserHost()) {
          startRoomStatusPolling();
        }
      } catch (error) {
        console.log("Lỗi tham gia phòng:", error);
        alert("Đã xảy ra lỗi khi tham gia phòng");
      }
    });
  }

  if (startQuizBtn) {
    startQuizBtn.addEventListener("click", async function () {
      if (!isCurrentUserHost()) {
        alert("Chỉ host mới được bắt đầu phòng quiz");
        return;
      }

      if (!appState.currentRoom || !appState.currentRoom.id) {
        alert("Không tìm thấy thông tin phòng");
        return;
      }

      try {
        const result = await api.startRoom(appState.currentRoom.id);

        console.log("start room result:", result);

        if (!result.success) {
          alert(result.message || "Không thể bắt đầu phòng");
          return;
        }
      } catch (error) {
        console.log("Lỗi bắt đầu phòng:", error);
        alert("Lỗi kết nối khi bắt đầu phòng");
        return;
      }

      goToPlayQuiz();
    });
  }
}
