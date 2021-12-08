"use strict";

const fs = require("fs");
const path = require("path");
// eslint-disable-next-line
const http2 = require("http2");
const helper = require("./helper");

const PORT = process.env.PORT || 8081;
const PUBLIC_PATH = path.join(__dirname, "../public");

const publicFiles = helper.getFiles(PUBLIC_PATH);

//创建HTTP2服务器
const server = http2.createSecureServer(
  {
    cert: fs.readFileSync(path.join(__dirname, "../ssl/cert.pem")),
    key: fs.readFileSync(path.join(__dirname, "../ssl/key.pem")),
  },
  onRequest
);

// Request 事件
function onRequest(req, res) {
  // 路径指向 index.html
  const reqPath = req.url === "/" ? "/index.html" : req.url;
  if (reqPath == "/test.json") {
    let count = 0;
    const timer = setInterval(() => {
      count++;
      if (count > 10) {
        clearInterval(timer);
        res.stream.close();
      } else {
        res.stream.write('{"count":' + count + "}");
      }
    }, 1000);
    return;
  }
  //获取html资源
  const file = publicFiles.get(reqPath);

  // 文件不存在
  if (!file) {
    res.statusCode = 404;
    res.end();
    return;
  }
  res.stream.respondWithFD(file.fileDescriptor, file.headers);
}
const child_process = require("child_process");
server.listen(PORT, (err) => {
  console.log("监听服务器启动=====\n");
  if (err) {
    console.error(err);
    return;
  }

  console.log(`Server listening on ${PORT}`);

  child_process.exec(`open https://localhost:${PORT}`);
});

var http = require("http");

http
  .createServer(function (req, res) {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
    });
    const reqPath = req.url === "/" ? "/index.html" : req.url;
    if (reqPath == "/test.json") {
      let count = 0;
      const timer = setInterval(() => {
        count++;
        if (count > 10) {
          clearInterval(timer);
          res.end();
        } else {
          res.write('{"count":' + count + "}");
        }
      }, 1000);
      return;
    }
  })
  .listen(8082);
