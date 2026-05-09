import { appState } from "../model/state.js";
import { api } from "../model/api.js";
import { showScreen } from "./ui.js";
import { renderWaitingRoom, startPlayerPolling } from "./room.js";

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

export function setupQuizCreate() {
  const addQuestionBtn = document.getElementById("addQuestionBtn");
  const createRoomBtn = document.getElementById("createRoomBtn");

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
}
