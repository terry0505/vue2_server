const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();

const DATA_FILE = path.join(__dirname, "../data/todos.json");
let todosByUser = {};

// 📂 데이터 불러오기
const loadTodos = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    todosByUser = JSON.parse(data);
    console.log("✅ todos.json 로드 완료");
  } catch {
    todosByUser = {};
    console.log("📁 새 todos.json 시작");
  }
};

// 💾 데이터 저장
const saveTodos = async () => {
  await fs.writeFile(DATA_FILE, JSON.stringify(todosByUser, null, 2));
};

// GET /todos?user=abc123
router.get("/", async (req, res) => {
  const userId = req.query.user;
  if (!userId) return res.status(400).json({ message: "userId가 필요합니다" });

  const todos = todosByUser[userId] || [];
  res.json(todos);
});

// POST /todos
router.post("/", async (req, res) => {
  const { title, userId } = req.body;
  if (!title || !userId) {
    return res.status(400).json({ message: "title과 userId가 필요합니다" });
  }

  const newTodo = {
    id: Date.now(),
    title,
    completed: false
  };

  if (!todosByUser[userId]) todosByUser[userId] = [];
  todosByUser[userId].unshift(newTodo);
  await saveTodos();
  res.status(201).json(newTodo);
});

// DELETE /todos/:id?user=abc123
router.delete("/:id", async (req, res) => {
  const userId = req.query.user;
  const id = Number(req.params.id);

  if (!userId || !todosByUser[userId]) return res.sendStatus(204);

  todosByUser[userId] = todosByUser[userId].filter((todo) => todo.id !== id);
  await saveTodos();
  res.sendStatus(204);
});

// PUT /todos/:id
router.put("/:id", async (req, res) => {
  const userId = req.body.userId;
  const id = Number(req.params.id);
  const { title, completed } = req.body;

  if (!userId || !todosByUser[userId]) {
    return res.status(400).json({ message: "잘못된 요청" });
  }

  todosByUser[userId] = todosByUser[userId].map((todo) => {
    if (todo.id !== id) return todo;
    return {
      ...todo,
      ...(title !== undefined && { title }),
      ...(completed !== undefined && { completed })
    };
  });

  await saveTodos(); // ✅ 변경 후 파일 저장
  res.sendStatus(200);
});

// 서버 시작 시 데이터 불러오기
loadTodos();

module.exports = router;
