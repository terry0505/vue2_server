const express = require("express");
const cors = require("cors");
const todosRouter = require("./routes/todos");
const authRouter = require("./routes/auth");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ✅ RESTful router 등록
app.use("/todos", todosRouter);
app.use("/auth", authRouter); // /auth/register, /auth/login

app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
