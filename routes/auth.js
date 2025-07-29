const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const router = express.Router();
const USERS_FILE = path.join(__dirname, "../data/users.json");
const SECRET = "my-vue-jwt-secret"; // JWT 서명용 비밀 키

// 유저 목록 불러오기
function getUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(data);
}

// 🔐 회원가입
router.post("/register", (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();

  const exists = users.find((u) => u.username === username);
  if (exists) {
    return res.status(400).json({ message: "이미 존재하는 아이디입니다." });
  }

  users.push({ username, password });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.status(201).json({ message: "회원가입 완료" });
});

// 🔐 로그인 + JWT 발급
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();

  const found = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!found) {
    return res
      .status(401)
      .json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }

  const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
  res.json({ token, username });
});

module.exports = router;
