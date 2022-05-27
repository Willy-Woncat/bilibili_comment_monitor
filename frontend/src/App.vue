<template>
  <van-sticky>
    <van-form @submit="onSubmit" style="background: #fff;">
      <van-cell-group inset>
        <van-field v-model="monitorOid" name="monitorOid" label="评论区id" placeholder="B站评论区id(如:511749942)"
          :rules="[{ required: false, message: '请填写评论区oid' }]" />
      </van-cell-group>
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">
          监听
        </van-button>
      </div>
    </van-form>
  </van-sticky>

  <van-tabs v-model:active="active" @change="onChangeTab" @scroll="onScroll" sticky offset-top="104rm">
    <van-tab :title="key" v-for="(value, key, index) in oidCommentListMap">
      <div class="comment" v-for="(data, index) in value">
        <div class="avatar">
          <img :src="data.avatar" width="32">
        </div>
        <div class="content">
          <span class="uname">{{ data.uname }}</span>
          <p>{{ data.message }}</p>
          <p class="ctime">{{ data.ctime }}</p>
        </div>
      </div>
    </van-tab>
  </van-tabs>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.ctime {
  font-size: 12px;
  color: #ccc;
}

.uname {
  line-height: 32px;
}

.comment {
  font-size: 14px;
  text-align: left;
  padding: 15px 10px 0 10px;
  border-bottom: 1px solid #eee;
}

.avatar {
  float: left;
  width: 36px;
  height: 36px;
}

.avatar img {
  border-radius: 50%;
}
</style>

<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref } from 'vue';
import { Toast } from 'vant';
import io from 'socket.io-client';
import moment from 'moment';
import axios from 'axios';

const active = ref(0);
const monitorOid = ref();
const oidCommentListMap = ref({});
const tabHeight = ref({});


/**
 * 表单提交事件
 * @param {Object} values 表单数据
 */
const onSubmit = async (values) => {
  // 如果oid为空，则赋默认值
  if (!values.monitorOid) {
    values.monitorOid = 511749942;
  }
  // 获取并清空输入栏的文本
  const oid = values.monitorOid;
  monitorOid.value = '';
  // 判断oid是否已经存在，如果存在则不进行监听并返回提示
  if (oidCommentListMap.value[oid]) {
    Toast('已有该评论区的监听');
    return;
  }
  // 将oid添加到tab中并返回提示(tips:注意跨域问题)
  const res = await axios.get(`api/add_monitor/${oid}`);
  if (res.data.code === 0) {
    oidCommentListMap.value[oid] = [];
    Toast('监听成功');
  } else {
    Toast(res.data.msg);
  }
};

/**
 * 滚动事件
 */
const onScroll = () => {
  // 本意是想处理一下tab切换的bug的，结果没什么用
  if (document.documentElement.scrollTop !== 60) {
    tabHeight.value[active.value] = document.documentElement.scrollTop;
  }
};

/**
 * tab切换事件
 */
const onChangeTab = (index) => {
  // 获取到当前tab，然后记录当前高度，方便后续直接滚动到该高度继续看(有bug)
  active.value = index;
  window.scroll({ top: tabHeight.value[index], left: 0, behavior: 'smooth' });
};

// 建立socket连接
const socket = io('ws://localhost:3001');
// 得到后端返回的数据并处理，用以展示
socket.on("sendData", async (data) => {
  const oid = data.oid;
  const replyList = data.dataList;
  const dataList = replyList.map((reply) => {
    return {
      rpid: reply.rpid,
      uname: reply.member.uname,
      avatar: reply.member.avatar,
      ctime: moment(reply.ctime * 1000).format("YYYY-MM-DD HH:mm:ss"),
      message: reply.content.message
    };
  });
  // 将处理过的数据添加到oidCommentListMap中，即可在前端展示
  for (let i = dataList.length - 1; i >= 0; i--) {
    oidCommentListMap.value[oid].push(dataList[i]);
  }
  // 如果有数据更新，自动滚动到最底部
  if (dataList?.length > 0) {
    window.scroll({ top: document.body.scrollHeight, left: 0, behavior: 'smooth' });
  }
  // 将前端展示过的数据发送到后端，以便去重
  // 因为效果不好，暂不使用
  // 建议使用，因为后端直接请求到就去重的话有可能丢包(后端已去重，前端未渲染)，最好是解决了这个bug再使用
  // socket.emit("showEnd", {
  //   rpidList: dataList.map(item => item.rpid)
  // });
});

</script>
