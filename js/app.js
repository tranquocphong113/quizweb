import { showScreen, setupNavigation } from "./ui.js";
import { setupAuth } from "./auth.js";
import { setupQuizCreate } from "./quiz-create.js";
import { setupRoom, stopPlayerPolling, stopRoomStatusPolling } from "./room.js";
import { setupGame, stopQuizTimer } from "./gameplay.js";
import { setupResult, showResult, stopLeaderboardPolling } from "./result.js";

function cleanupAll() {
  stopPlayerPolling();
  stopRoomStatusPolling();
  stopLeaderboardPolling();
  stopQuizTimer();
}

setupNavigation(cleanupAll);
setupAuth(cleanupAll);
setupQuizCreate();
setupRoom();
setupGame(showResult);
setupResult();

showScreen("screen-auth");
