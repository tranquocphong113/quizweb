const USER_KEY = "quiz_users";
const ROOM_KEY = "quiz_room";
const SCORE_KEY = "quiz_scores";

function readStorage(key, defaultValue) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function postJSON(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await response.json();
}

export const api = {
  async register(name, email, password) {
    return await postJSON("api/auth.php", {
      action: "register",
      fullname: name,
      email: email,
      password: password,
    });
  },

  async login(email, password) {
    return await postJSON("api/auth.php", {
      action: "login",
      email: email,
      password: password,
    });
  },
  async createQuiz(quiz, userId) {
    return await postJSON("api/quiz.php", {
      action: "create",
      user_id: userId,
      title: quiz.title,
      time_limit: quiz.timeLimit,
      questions: quiz.questions,
    });
  },

  async createRoom(quiz, hostName) {
    return await postJSON("api/room.php", {
      action: "create",
      quiz_id: quiz.id,
      host_name: hostName,
    });
  },

  async joinRoom(code, playerName) {
    return await postJSON("api/room.php", {
      action: "join",
      room_code: code,
      player_name: playerName,
    });
  },

  async saveScore(data) {
    return await postJSON("api/score.php", {
      action: "save",
      room_id: data.roomId,
      player_name: data.name,
      player_email: data.email,
      quiz_title: data.quizTitle,
      score: data.score,
      total: data.total,
    });
  },

  async getScoresByRoom(roomId) {
    return await postJSON("api/score.php", {
      action: "leaderboard",
      room_id: roomId,
    });
  },

  async getHistoryByUser(email) {
    return await postJSON("api/score.php", {
      action: "history",
      email: email,
    });
  },

  async pollPlayers(roomId) {
    return await postJSON("api/room.php", {
      action: "poll_players",
      room_id: roomId,
    });
  },

  async pollLeaderboard(roomId) {
    return await postJSON("api/score.php", {
      action: "leaderboard",
      room_id: roomId,
    });
  },
};
