import { appState } from "../model/state.js";
import { api } from "../model/api.js";
import { showScreen, updateUserName } from "./ui.js";

export function setupAuth(cleanupAll) {
  const showLoginTab = document.getElementById("showLoginTab");
  const showRegisterTab = document.getElementById("showRegisterTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const logoutBtn = document.getElementById("logoutBtn");

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

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      cleanupAll();

      appState.currentUser = null;
      showScreen("screen-auth");
    });
  }
}
