const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();

const DATA_FILE = path.join(__dirname, "../data/todos.json");
let todos = [];

// 📦 데이터 로딩 및 저장 함수
const loadTodos = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    todos = JSON.parse(data);
  } catch {
    todos = [];
  }
};

const saveTodos = async () => {
  await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
};

// ✅ GET /todos
router.get("/", async (req, res) => {
  res.json(todos);
});

// ✅ POST /todos
router.post("/", async (req, res) => {
  const newTodo = {
    id: Date.now(),
    title: req.body.title,
    completed: false
  };
  todos.unshift(newTodo);
  await saveTodos();
  res.status(201).json(newTodo);
});

// ✅ DELETE /todos/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  todos = todos.filter((todo) => todo.id !== id);
  await saveTodos();
  res.sendStatus(204);
});

// ✅ PUT /todos/:id
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { title } = req.body;
  todos = todos.map((todo) => (todo.id === id ? { ...todo, title } : todo));
  await saveTodos();
  res.sendStatus(200);
});

// 최초 1회 로드
loadTodos();

module.exports = router;
