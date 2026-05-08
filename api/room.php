<?php
require_once "db.php";

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode([
        "success" => false,
        "message" => "Không nhận được dữ liệu JSON"
    ]);
    exit;
}

$action = $input["action"] ?? "";

function generateRoomCode() {
    return strtoupper(substr(md5(uniqid(rand(), true)), 0, 6));
}

function getQuizWithQuestions($conn, $quizId) {
    $quizStmt = $conn->prepare("SELECT * FROM quizzes WHERE id = ?");
    $quizStmt->execute([$quizId]);
    $quiz = $quizStmt->fetch(PDO::FETCH_ASSOC);

    if (!$quiz) {
        return null;
    }

    $questionStmt = $conn->prepare("
        SELECT * FROM questions
        WHERE quiz_id = ?
        ORDER BY id ASC
    ");
    $questionStmt->execute([$quizId]);
    $questionRows = $questionStmt->fetchAll(PDO::FETCH_ASSOC);

    $questions = [];

    foreach ($questionRows as $q) {
        $questions[] = [
            "question" => $q["question_text"],
            "options" => [
                $q["option_a"],
                $q["option_b"],
                $q["option_c"],
                $q["option_d"]
            ],
            "correctAnswer" => intval($q["correct_answer"])
        ];
    }

    return [
        "id" => intval($quiz["id"]),
        "title" => $quiz["title"],
        "timeLimit" => intval($quiz["time_limit"]),
        "questions" => $questions
    ];
}

function getPlayersByRoom($conn, $roomId) {
    $stmt = $conn->prepare("
        SELECT player_name
        FROM room_players
        WHERE room_id = ?
        ORDER BY joined_at ASC
    ");
    $stmt->execute([$roomId]);

    $players = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $players[] = $row["player_name"];
    }

    return $players;
}

if ($action === "create") {
    $quizId = intval($input["quiz_id"] ?? 0);
    $hostName = trim($input["host_name"] ?? "");

    if ($quizId <= 0) {
        echo json_encode([
            "success" => false,
            "message" => "Thiếu quiz_id"
        ]);
        exit;
    }

    if ($hostName === "") {
        echo json_encode([
            "success" => false,
            "message" => "Thiếu tên người tạo phòng"
        ]);
        exit;
    }

    try {
        $quiz = getQuizWithQuestions($conn, $quizId);

        if (!$quiz) {
            echo json_encode([
                "success" => false,
                "message" => "Không tìm thấy quiz"
            ]);
            exit;
        }

        do {
            $roomCode = generateRoomCode();

            $check = $conn->prepare("SELECT id FROM rooms WHERE room_code = ?");
            $check->execute([$roomCode]);
        } while ($check->rowCount() > 0);

        $stmt = $conn->prepare("
            INSERT INTO rooms (quiz_id, room_code, host_name)
            VALUES (?, ?, ?)
        ");

        $stmt->execute([$quizId, $roomCode, $hostName]);

        $roomId = $conn->lastInsertId();

        $playerStmt = $conn->prepare("
            INSERT IGNORE INTO room_players (room_id, player_name)
            VALUES (?, ?)
        ");
        $playerStmt->execute([$roomId, $hostName]);

        echo json_encode([
            "success" => true,
            "message" => "Tạo phòng thành công",
            "room" => [
                "id" => intval($roomId),
                "code" => $roomCode,
                "hostName" => $hostName,
                "players" => getPlayersByRoom($conn, $roomId),
                "quiz" => $quiz
            ]
        ]);
        exit;
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Lỗi tạo phòng",
            "error" => $e->getMessage()
        ]);
        exit;
    }
}

if ($action === "join") {
    $roomCode = strtoupper(trim($input["room_code"] ?? ""));
    $playerName = trim($input["player_name"] ?? "");

    if ($roomCode === "") {
        echo json_encode([
            "success" => false,
            "message" => "Vui lòng nhập mã phòng"
        ]);
        exit;
    }

    if ($playerName === "") {
        echo json_encode([
            "success" => false,
            "message" => "Thiếu tên người tham gia"
        ]);
        exit;
    }

    $stmt = $conn->prepare("SELECT * FROM rooms WHERE room_code = ?");
    $stmt->execute([$roomCode]);

    $room = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$room) {
        echo json_encode([
            "success" => false,
            "message" => "Không tìm thấy phòng"
        ]);
        exit;
    }

    $roomId = intval($room["id"]);

    $playerStmt = $conn->prepare("
        INSERT IGNORE INTO room_players (room_id, player_name)
        VALUES (?, ?)
    ");
    $playerStmt->execute([$roomId, $playerName]);

    $quiz = getQuizWithQuestions($conn, intval($room["quiz_id"]));

    echo json_encode([
        "success" => true,
        "message" => "Tham gia phòng thành công",
        "room" => [
            "id" => $roomId,
            "code" => $room["room_code"],
            "hostName" => $room["host_name"],
            "players" => getPlayersByRoom($conn, $roomId),
            "quiz" => $quiz
        ]
    ]);
    exit;
}

if ($action === "poll_players"){
    $roomId = intval($input["room_id"] ?? 0);
    if ($roomId <= 0){
        echo json_encode([
            "success" => false,
            "message" => "Thiếu room_id"
        ]);
        exit;
    }
    $players = getPlayersByRoom($conn, $roomId);
    echo json_encode([
        "success"=>true,
        "players"=>$players,
        "count"=>count($players)
    ]);
    exit;
}

echo json_encode([
    "success" => false,
    "message" => "Action không hợp lệ"
]);
?>