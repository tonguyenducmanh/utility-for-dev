<template>
  <div class="container">
    <div class="title">QRCode To Text tool!</div>
    <div class="qr-section">
      <div class="flex">
        <img class="td-img" src="@/assets/qrcodeupload.png" />
      </div>
      <div>
        Note: thứ tự upload dựa vào thứ tự sắp xếp trên máy tính, vui lòng chọn
        sắp xếp theo ngày tăng dần để nối chuỗi đúng file
      </div>
      <br />
      <TDUpload
        ref="uploadArea"
        class="upload-area"
        maxHeight="200px"
        :label="'Chọn ảnh QR code'"
        multiple
      ></TDUpload>
      <div class="flex button-generate">
        <TDButton @click="convertQRCode" label="Chuyển đổi"></TDButton>
        <TDButton
          @click="copyResult"
          :type="$tdEnum.buttonType.secondary"
          label="Copy"
        ></TDButton>
      </div>
      <TDTextarea
        class="input-area"
        placeHolder="Kết quả sẽ xuất hiện sau khi paste ảnh"
        v-model="textOutput"
        :readOnly="true"
        height="200px"
      ></TDTextarea>
    </div>
  </div>
</template>
<script>
import jsQR from "jsqr";
export default {
  name: "TDQRCodeToText",
  created() {
    let me = this;
  },
  beforeUnmount() {
    let me = this;
  },
  mounted() {},
  methods: {
    /**
     * Tạo QR code từ text
     */
    async convertQRCode() {
      let me = this;
      if (
        me.$refs.uploadArea &&
        typeof me.$refs.uploadArea.getFileSelected === "function"
      ) {
        let allFiles = me.$refs.uploadArea.getFileSelected();
        let decodePromises = Array.from(allFiles).map((file) => {
          return new Promise((resolve) => {
            let reader = new FileReader();
            reader.onload = function (event) {
              let imageData = event.target.result;
              let img = new Image();
              img.onload = function () {
                let canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                let imageDataObj = ctx.getImageData(
                  0,
                  0,
                  img.width,
                  img.height
                );
                let code = jsQR(
                  imageDataObj.data,
                  imageDataObj.width,
                  imageDataObj.height
                );
                resolve(code ? code.data : null);
              };
              img.src = imageData;
            };
            reader.readAsDataURL(file);
          });
        });

        // Đợi tất cả ảnh xử lý xong
        let results = await Promise.all(decodePromises);
        // Lọc kết quả hợp lệ
        me.textOutput = results.filter(Boolean).join("");
      }
    },

    /**
     * copy kết quả
     */
    copyResult() {
      let me = this;
      me.$tdUtility.copyToClipboard(me.textOutput);
    },
  },
  data() {
    return {
      textOutput: null,
      isRemoveEmpty: false,
      historyItems: [],
      qrCodeItems: [],
    };
  },
};
</script>
<style scoped>
.qr-section {
  padding: var(--padding);
}

.td-img {
  width: 100%;
  max-width: 1000px;
  height: auto;
  padding: var(--padding);
}
</style>
