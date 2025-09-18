// 引入express第三方模块
const express = require("express");
// 引入body-parser中间件
const bodyParser = require("body-parser");
// 引入自带path模块
const path = require("path");
// 创建web服务器
const app = express();
// 跨域
const cors = require("cors");
// 引入配置文件
const config = require("./config/config");
// 连接数据库
require("./db");
// token
const jToken = require("./config/jwt_token");
// 引入路由
const indexRouter = require("./router/index.js");
const filesRouter = require("./router/files.js");

// 跨域配置项
const corsOptions = {
  origin: ["http://localhost:9000"],
  credentials: true,
  maxAge: "1728000",
};

// 设置端口并启动服务器
const serve = app.listen(config.port, () => {
  console.log(`服务器启动成功, 浏览器打开: http://localhost:${config.port}`);
});

// 初始化socket.io
const socketio = require("socket.io")(serve, {
  cors: {
    origin: "*",
    methods: ["get", "post"],
  },
});
require('./dao/socket')(socketio);

// 使用body-parser中间件将所有post请求的数据解析为对象
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: false, // 不使用第三方查询字符串模块
  })
);
app.use(bodyParser.json({ limit: '50mb' }));

// 托管静态资源
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/data")));
app.use(cors()); // 启用跨域

// token验证中间件
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

// 使用路由
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
