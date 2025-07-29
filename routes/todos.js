const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const auth = require("../middlewares/auth");

const router = express.Router();
const DATA_FILE = path.join(__dirname, "../data/todos.json");

let todosByUser = {};

const loadTodos = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    todosByUser = JSON.parse(data);
  } catch {
    todosByUser = {};
  }
};

const saveTodos = async () => {
  await fs.writeFile(DATA_FILE, JSON.stringify(todosByUser, null, 2));
};

loadTodos();

// ✅ 인증 미들웨어 전역 적용
router.use(auth);

// ✅ GET /todos
router.get("/", (req, res) => {
  const username = req.user.username;
  res.json(todosByUser[username] || []);
});

// ✅ POST /todos
router.post("/", async (req, res) => {
  const { title, completed = false } = req.body;
  const username = req.user.username;

  if (!title) return res.status(400).json({ message: "할 일을 입력하세요." });

  const newTodo = {
    id: Date.now(),
    title,
    completed
  };

  if (!todosByUser[username]) {
    todosByUser[username] = [];
  }

  todosByUser[username].unshift(newTodo);
  await saveTodos();
  res.status(201).json(newTodo);
});

// ✅ PUT /todos/:id
router.put("/:id", async (req, res) => {
  const username = req.user.username;
  const id = Number(req.params.id);
  const { title, completed } = req.body;

  if (!todosByUser[username]) return res.sendStatus(404);

  todosByUser[username] = todosByUser[username].map((todo) =>
    todo.id === id
      ? {
          ...todo,
          ...(title !== undefined && { title }),
          ...(completed !== undefined && { completed })
        }
      : todo
  );

  await saveTodos();
  res.sendStatus(200);
});

// ✅ DELETE /todos/:id
router.delete("/:id", async (req, res) => {
  const username = req.user.username;
  const id = Number(req.params.id);

  if (!todosByUser[username]) return res.sendStatus(404);

  todosByUser[username] = todosByUser[username].filter(
    (todo) => todo.id !== id
  );
  await saveTodos();
  res.sendStatus(200);
});

module.exports = router;
