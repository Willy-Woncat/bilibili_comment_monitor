const { getCommentList } = require("./api");
const { oidCommentMap } = require("./commentSet");

const cronJob = require("cron").CronJob;

/**
 * 每20秒获取一次评论列表
 * @param {socket} socket socket.io实例
 */
const createJob = (socket) => {
    const job = new cronJob(
        "*/25 * * * * *",
        async function () {
            // 从oidCommentMap中获取所有已监听的评论区id
            const oidList = Object.keys(oidCommentMap);
            for (const oid of oidList) {
                const data = await getCommentList(1, oid);
                const commentSet = oidCommentMap[oid];
                if (!data) {
                    continue;
                }
                // 没发送过的数据
                const canSendData = [];
                for (const reply of data.dataList) {
                    if (!commentSet[reply.rpid]) {
                        canSendData.push(reply);
                        commentSet[reply.rpid] = reply;
                    }
                }
                // 发送数据
                socket.broadcast.emit("sendData", {
                    ...data,
                    oid,
                    dataList: canSendData,
                });
                // 将前端展示过的数据的rpid返回，以便后续不再展示
                // 因为效果不好，所以暂时不使用
                // socket.on("showEnd", (rpidList) => {
                //     for (const reply of data.dataList) {
                //         for (const rpid of rpidList.rpidList) {
                //             if (reply.rpid === rpid) {
                //                 commentSet[rpid] = reply;
                //                 break;
                //             }
                //         }
                //     }
                // });
                console.log(oid, canSendData.map((reply) => reply.content.message));
            }
        },
        null,
        true,
        "Asia/Shanghai"
    );
    job.start();
};

module.exports = { createJob };
