const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const config = require("./config/config");
require("./db");
const jToken = require("./config/jwt_token");
const indexRouter = require("./router/index.js");
const filesRouter = require("./router/files.js");

const app = express();

const corsOptions = {
  origin: ["http://localhost:9000"],
  credentials: true,
  maxAge: "1728000",
};

const PORT = 7001;
const server = app.listen(PORT, () => {
  console.log(`服务器启动成功,浏览器打开:localhost:${PORT}`);
});

const socketio = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["get", "post"],
  },
});

require('./dao/socket')(socketio);


app.use(bodyParser.urlencoded({
  limit: "50mb",
  extended: false,
}));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/data")));
app.use(cors());

// token验证
app.use((req, res, next) => {
  if (req.headers['authorization']) {
    let token = req.headers['authorization'];
    jToken.VerifyToken(token, (err, data) => {
      if (err) {
        res.send({ status: 500, msg: 'token解析失败' });
        return;
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

// 路由
app.use("/v1/index", indexRouter);
app.use("/v1/files", filesRouter);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({
    code: 500,
    msg: err.message,
  });
});

// 测试用 GET 路由
router.get('/', (req, res) => {
  res.send('Index router is working!');
});

module.exports = router;
