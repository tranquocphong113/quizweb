import { appState } from "../model/state.js";

const screens = document.querySelectorAll(".screen");

export function showScreen(screenId) {
  screens.forEach((screen) => screen.classList.remove("active"));

  const screen = document.getElementById(screenId);

  if (screen) {
    screen.classList.add("active");
  }
}

export function updateUserName() {
  const userNameText = document.getElementById("userNameText");

  if (userNameText && appState.currentUser) {
    userNameText.textContent = "Xin chào, " + appState.currentUser.name;
  }
}

export function setupNavigation(cleanupAll) {
  document.querySelectorAll("[data-screen]").forEach((button) => {
    button.addEventListener("click", function () {
      if (this.dataset.screen === "screen-dashboard") {
        cleanupAll();
      }

      showScreen(this.dataset.screen);
    });
  });
}
