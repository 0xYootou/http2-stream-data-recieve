基于 http2 分片传输完整数据给前端

### 安装

```npm
npm install
```

### 启动

```npm
npm start
```

### 前端请求方式

```js
fetch("//localhost:8081/test.json").then((response) => {
  const reader = response.body.getReader();
  const stream = new ReadableStream({
    start(controller) {
      function push() {
        // "done" is a Boolean and value a "Uint8Array"
        reader.read().then(({ done, value }) => {
          // If there is no more data to read
          if (done) {
            console.log("done", done);
            controller.close();
            return;
          }
          // Get the data and send it to the browser via the controller
          controller.enqueue(value);
          // Check chunks by logging to the console
          const text = new TextDecoder("utf-8").decode(value);
          const ele = document.createElement("div");
          document.body.appendChild(ele);
          ele.innerHTML = text;
          push();
        });
      }

      push();
    },
  });
});
```

兼容性：

- ReadableStream >= chrome 43, ie not, safari >= 10.1
- TextDecoder >= chorme 38, ie not, safari >= 10.1

### 后端写入方式

```js
function onRequest(req, res) {
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
}
```
