/**
 * 已监听的评论列表
 * @param oid 评论区id
 */
const oidCommentMap = {};
const socketConnection = {
    state: false,
};

module.exports = { oidCommentMap, socketConnection };
