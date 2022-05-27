const axios = require("axios");

/**
 * 获取评论列表
 * @param pageNum 当前页码
 * @param oid 评论区id
 */
const getCommentList = async (pageNum, oid) => {
    if (pageNum < 1 || pageNum === undefined) {
        pageNum = 1;
    }
    const apiUrl = `https://api.bilibili.com/x/v2/reply?oid=${oid}&nohot=1&type=1&ps=15&pn=${pageNum}`;
    const res = await axios.get(apiUrl);
    if (res?.data?.data) {
        const data = res.data.data;
        const { page, replies } = data;
        return {
            total: page.count,
            dataList: replies,
        };
    } else {
        console.log("获取评论列表失败", apiUrl);
        return null;
    }
};

module.exports = { getCommentList };
