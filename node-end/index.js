const express = require("express");
const { createJob } = require("./cron");
const api = require("./api");
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { oidCommentMap, socketConnection } = require("./commentSet");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
});

// 建立socket连接
io.on("connection", (socket) => {
    if (socketConnection.state) {
        return;
    }
    socketConnection.state = true;
    console.log("连接:", socket.connected);
    socket.on('disconnect', () => {
        socketConnection.state = false;
        for (let key in oidCommentMap) {
            delete oidCommentMap[key];
        }
        console.log('断开:', socket.disconnected, oidCommentMap);
    });
    // 创建定时任务，每20秒获取一次评论列表
    createJob(socket);
});

// 监听端口
server.listen(3001, () => {
    console.log("listening on *:3001");
});

// 获取要监听的评论的列表
app.get("/add_monitor/:oid", async (req, res) => {
    // 获取请求中的oid参数
    const oid = req.params.oid;
    // 如果oid已监听，则直接返回
    if (oidCommentMap[oid]) {
        res.send({ "code": 0, "msg": "该评论区已监听" });
        return;
    }
    // 判断该oid是否存在
    if (!oid || oid === "oid") {
        res.send({ "code": -1, "msg": "oid异常" });
        return;
    }
    // 前置校验，通过后将oid添加到监听列表中
    const data = await api.getCommentList(1, oid);
    if (!data) {
        res.send({ "code": -2, "msg": "该评论区不存在" });
        console.log("该评论区不存在");
        return;
    }
    console.log(`监听评论区: ${oid}`);
    res.send({ "code": 0, "msg": "监听成功" });
    oidCommentMap[oid] = {};
});
