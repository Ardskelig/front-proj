<template>
  <div class="block-main">
    <!-- <div class="head-wrap">
      <span class="title">扫一扫</span>
    </div> -->

    <!-- <div class="qr-container">
      <qrcode-stream
        constraints="selectedConstraints"
        @detect="onDecode"
        @camera-on="onCameraReady"
        @error="onError"
      />
    </div> -->

    <div class="qr-container">
        <div class="scan-wrapper"> <!-- 新增包裹层 -->
            <qrcode-stream
                class="custom-stream" 
                :paint-size="300"     
                constraints="selectedConstraints"
                @detect="onDecode"
                @camera-on="onCameraReady"
                @error="onError"
                />
            <!-- 可添加扫描框装饰 -->
            <div class="scan-border"></div>
        </div>
    </div>
  
  </div>
</template>

<script>
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { QrcodeStream } from "vue-qrcode-reader";
import { showSuccessToast, showFailToast } from 'vant';
import instance from "@/utils/request.js"
import { showToast } from "vant";
export default {
  components: {
    QrcodeStream,
    showToast,
  },
  setup() {
    const testVice = reactive([]);
    const router = useRouter();
    const sendToBackend=async (qrString)=>{
      try{
        console.log("发送至后端：",qrString)
        // const formData={
        //   key:qrString.key,
        //   url:qrString.url,
        //   timestamp:qrString.timestamp
        // }
        const formData=qrString
        console.log("formData",formData)
        const response =await instance.post("/api/did/verifyQrcode",formData,{
          headers:{
            "Content-Type":"application/json"
          }
        })
        if(response.data.code==1){
          showSuccessToast(response.data.msg);
        }else{
          showFailToast(response.data.msg);
        }
      }catch{
        showFailToast("二维码有误！");
      }
    }
    // 扫码成功后的回调
    const onDecode = (detectedCodes) => {
      // alert("成功扫描到二维码")
      const qrString = detectedCodes[0].rawValue
      // alert(`扫描结果：${qrString}`)
      console.log("扫描结果",qrString)
      sendToBackend(qrString)


      // 接下来处理逻辑
    };
    const onCameraReady = (res) => {
      console.log("摄像头准备好了");
    };
    const onError = (error) => {
      if (error.name === "NotAllowedError") {
        // user denied camera access permission
        showToast("用户拒绝相机访问权限");
      } else if (error.name === "NotFoundError") {
        // no suitable camera device installed
        showToast("未安装合适的摄像设备");
      } else if (error.name === "NotSupportedError") {
        // page is not served over HTTPS (or localhost)
         showToast("当前网页没有通过 HTTPS 或 localhost 安全协议提供服务");
      } else if (error.name === "NotReadableError") {
        // maybe camera is already in use
        showToast("相机被占用了)");
      } else if (error.name === "OverconstrainedError") {
        // did you request the front camera although there is none?
         showToast("尝试使用前置摄像头)");
      } else if (error.name === "StreamApiNotSupportedError") {
        showToast("浏览器似乎缺少功能)");
        // browser seems to be lacking features
      }
    };
    onMounted(() => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          devices.forEach((device) => {
            if (device.kind === "videoinput") {
              console.log(
                "Video input device: ",
                device.label,
                device.deviceId
              );
            }
          });
        })
        .catch((error) => {
          console.error("Error enumerating devices: ", error);
          showToast("Error enumerating devices");
        });
    });
    const goback = () => {
      router.go(-1);
    };
    return {
      testVice,
      onCameraReady,
      goback,
      onDecode,
      onError,
    };
  },
};


// 用于选择相机
// environment后置摄像头，user前置摄像头
const selectedConstraints = ref({ facingMode: 'environment' })


</script>

<style lang="scss" scoped>
.block-main {
  height: 100%;
  background: #fff;
  overflow: hidden;
  font-size: 16px;
  .head-wrap {
    height: 0.96rem;
    background: #31be7c;
    font-family: Microsoft YaHei UI;
    font-weight: 400;
    color: #fff;
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    right: 0;
    .btn-back {
      margin-left: 0.4rem;
      width: 0.22rem;
      height: 0.38rem;
    }
    .title {
      font-size: 0.36rem;
      text-align: center;
      flex: 1;
    }
  }
  // .qr-container {
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     height: calc(100vh - 0.96rem); // 减去头部的高度
//     margin-top: 0.96rem;
//   }

    /* 样式修改 */
    .qr-container {
    // 修改容器高度为自动
    height: auto;
    margin-top: 0.96rem;
    padding: 20px; /* 增加内边距 */

    .scan-wrapper {
        position: relative;
        width: 60vw;  /* 设置扫描区域宽度为视窗70% */
        max-width: 400px; /* 最大宽度限制 */
        aspect-ratio: 1; /* 保持1:1正方形 */
        margin: 0 auto; /* 居中 */
        
        /* 自定义扫码组件样式 */
        .custom-stream {
        width: 100% !important;
        height: 100% !important;
        border-radius: 12px; /* 圆角 */
        overflow: hidden; /* 隐藏溢出部分 */
        
        /* 视频流样式 */
        video {
            object-fit: cover; /* 保持视频比例填充 */
        }
        }

        /* 扫描框装饰样式 */
        .scan-border {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 2px solid #31be7c;
        box-shadow: 0 0 15px rgba(49, 190, 124, 0.3);
        pointer-events: none; /* 防止遮挡点击 */
        }
    }
    }

}
</style>
