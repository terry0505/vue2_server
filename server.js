const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const app = express();
const PORT = 3000;

const DATA_FILE = "./todos.json";

app.use(cors());
app.use(express.json());

let todos = [];

// 📂 서버 시작 시 데이터 로드
const loadTodos = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    todos = JSON.parse(data);
    console.log("✅ todos.json 로드 완료");
  } catch (err) {
    todos = [];
    console.log("⚠️ 초기 데이터 없음. 새로 시작합니다.");
  }
};

// 💾 todos 배열을 파일에 저장
const saveTodos = async () => {
  await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
};

// 📌 GET
app.get("/todos", (req, res) => {
  res.json(todos);
});

// 📌 POST
app.post("/todos", async (req, res) => {
  const newTodo = {
    id: Date.now(),
    title: req.body.title,
    completed: false
  };
  todos.unshift(newTodo);
  await saveTodos();
  res.status(201).json(newTodo);
});

// 📌 DELETE
app.delete("/todos/:id", async (req, res) => {
  const id = Number(req.params.id);
  todos = todos.filter((todo) => todo.id !== id);
  await saveTodos();
  res.sendStatus(204);
});

// 📌 PUT
app.put("/todos/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { title } = req.body;
  todos = todos.map((todo) => (todo.id === id ? { ...todo, title } : todo));
  await saveTodos();
  res.sendStatus(200);
});

// 서버 시작
app.listen(PORT, async () => {
  await loadTodos();
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
