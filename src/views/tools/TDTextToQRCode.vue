<template>
  <div class="container">
    <div class="title">{{ $t("i18nCommon.textToQRCode.title") }}</div>
    <div class="flex">
      <TDHistory
        ref="history"
        :applyFunction="generateQRCode"
        :cacheKey="$tdEnum.cacheConfig.QRHistory"
      ></TDHistory>
    </div>

    <div class="flex flex-col input-section">
      <TDTextarea
        class="input-area"
        :placeHolder="$t('i18nCommon.textToQRCode.input.placeholder')"
        v-model="textGenQR"
      ></TDTextarea>
      <div class="flex button-generate">
        <TDButton
          :readOnly="!textGenQR"
          @click="generateQRCode(null)"
          :label="$t('i18nCommon.textToQRCode.buttons.generate')"
        ></TDButton>
        <TDButton
          @click="downloadAllQRCodes"
          :type="$tdEnum.buttonType.secondary"
          :readOnly="!qrCodeItems || !qrCodeItems.length"
          :label="$t('i18nCommon.textToQRCode.buttons.downloadAll')"
          class="download-all-btn"
        ></TDButton>
        <TDButton
          @click="applyMock"
          :type="$tdEnum.buttonType.secondary"
          :label="$t('i18nCommon.textToQRCode.buttons.example')"
        ></TDButton>
        <TDInput
          v-model="maxLengthUserConfig"
          :inputType="'number'"
          class="max-length-input"
          :placeHolder="$t('i18nCommon.textToQRCode.input.maxLength')"
        />
        <TDCheckbox
          v-model="isCompressText"
          :label="$t('i18nCommon.textToQRCode.compressText')"
          @input="toggleCompressText"
        ></TDCheckbox>
      </div>
    </div>
    <div v-if="textGenQR" class="qrcode-section">
      <div class="qrcode-box">
        <template v-for="(item, index) in qrCodeItems">
          <div class="qr-container">
            <div class="qr-header">
              <span>{{
                $t("i18nCommon.textToQRCode.part", [
                  index + 1,
                  qrCodeItems.length,
                ])
              }}</span>
              <TDButton
                @click="copyQRCode(item.src, index)"
                :type="$tdEnum.buttonType.secondary"
                :label="$t('i18nCommon.textToQRCode.buttons.copyImage')"
                class="download-btn"
              ></TDButton>
              <TDButton
                @click="downloadQRCode(item.src, index)"
                :type="$tdEnum.buttonType.secondary"
                :label="$t('i18nCommon.textToQRCode.buttons.download')"
                class="download-btn"
              ></TDButton>
            </div>
            <img :src="item.src" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import QRCode from "qrcode";
import JSZip from "jszip";
import TDCompress from "@/common/compress/TDCompress.js";

export default {
  name: "TDTextToQRCode",
  created() {
    let me = this;
  },
  beforeUnmount() {
    let me = this;
  },
  mounted() {},
  methods: {
    async applyMock() {
      // Lazy-load module
      const { TDMockTextToQRCode } = await import(
        /* webpackChunkName: "mock-text-to-qr-code" */
        "@/common/mock/TDMockTextToQRCode.js"
      );
      this.$tdUtility.applyMock(this, TDMockTextToQRCode);
    },
    async toggleCompressText() {
      let me = this;
      if (me.textGenQR) {
        await me.generateQRCode(null);
      }
    },
    /**
     * Tạo QR code từ text
     */
    async generateQRCode(textInput) {
      let me = this;
      let maxTextOneChunk = Number(
        me.maxLengthUserConfig ?? window.__env.textToQRConfig.maxTextOneChunk
      );
      if (!maxTextOneChunk || isNaN(maxTextOneChunk) || maxTextOneChunk <= 0) {
        maxTextOneChunk = 1000; // fallback mặc định
      }

      // Lấy giá trị từ các input
      let text = me.getUserInput(textInput);
      let textBuild = await me.buildTextBeforeGenQR(text);

      // Lưu text vào lịch sử nếu khác với lần lưu trước
      await me.$refs.history.saveToHistory(text);
      // reset
      me.qrCodeItems = [];
      // Nếu độ dài text lớn hơn 1000, chia thành nhiều phần
      let chunks = me.splitTextIntoChunks(textBuild, maxTextOneChunk);
      // Tạo QR code cho từng phần
      chunks.forEach((chunk) => {
        me.generateQRCodeJS(chunk);
      });
      me.$tdToast.success(null, me.$t("i18nCommon.toastMessage.success"));
    },

    /**
     * Chia text thành các phần nhỏ hơn với độ dài cho trước
     * @param {string} text - Text cần chia
     * @param {number} maxLength - Độ dài tối đa của mỗi phần
     * @returns {string[]} Mảng các phần text đã chia
     */
    splitTextIntoChunks(text, maxLength) {
      let chunks = [];
      for (let i = 0; i < text.length; i += maxLength) {
        chunks.push(text.slice(i, i + maxLength));
      }
      return chunks;
    },

    /**
     * Tiền xử lý text trước khi tạo QR code
     */
    async buildTextBeforeGenQR(text) {
      let me = this;
      let textTransformed = text;
      if (me.isCompressText && textTransformed) {
        textTransformed = await TDCompress.compressText(
          text,
          me.$tdEnum.compressType.gzip
        );
      }
      return textTransformed;
    },

    /**
     * lấy giá trị từ input text
     * @returns {string} giá trị text từ input
     */
    getUserInput(textInput) {
      let me = this;
      let inputElement = textInput ? textInput : me.textGenQR.toString();
      if (textInput) {
        me.textGenQR = textInput;
      }
      let text = inputElement ? inputElement.trim() : null;
      return text;
    },

    /**
     * Tạo QR code bằng thư viện qrcode.js
     */
    generateQRCodeJS(textBuild) {
      let me = this;
      let opts = {
        errorCorrectionLevel: "L",
        type: "image/png",
        quality: 1,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        width: 1000,
      };
      let result = {};
      QRCode.toDataURL(textBuild, opts, function (err, url) {
        if (err) throw err;
        result.src = url;
      });
      me.qrCodeItems.push(result);
    },
    /**
     * Chuyển đổi Data URL thành Blob
     * @param {string} dataUrl - Data URL cần chuyển đổi
     * @returns {Blob} Blob data
     */
    dataURLtoBlob(dataUrl) {
      const arr = dataUrl.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    },

    /**
     * Tải xuống tất cả QR codes dưới dạng tệp ZIP
     */
    async downloadAllQRCodes() {
      let me = this;
      const zip = new JSZip();

      // Thêm từng QR code vào ZIP
      this.qrCodeItems.forEach((item, index) => {
        const blob = this.dataURLtoBlob(item.src);
        zip.file(`qrcode-part-${index + 1}.png`, blob);
      });

      // Tạo và tải xuống tệp ZIP
      const content = await zip.generateAsync({ type: "blob" });
      // Tạo blob và mở popup tải file
      me.$tdUtility.createDownloadFileFromBlob(content, "qrcodes.zip");
    },

    /**
     * Tải xuống QR code dưới dạng hình ảnh PNG
     * @param {string} dataUrl - Data URL của QR code
     * @param {number} index - Vị trí của QR code trong danh sách
     */
    downloadQRCode(dataUrl, index) {
      let me = this;
      // Tạo blob và mở popup tải file
      me.$tdUtility.createDownloadFileFromUrl(
        dataUrl,
        `qrcode-part-${index + 1}.png`
      );
    },
    /**
     * Copy ảnh từ url
     * @param {string} dataUrl - Data URL của QR code
     */
    copyQRCode(dataUrl, index) {
      let me = this;
      // Tạo blob và mở popup tải file
      me.$tdUtility.copyImageFromUrl(dataUrl);
    },
  },
  data() {
    return {
      textGenQR: null,
      qrCodeItems: [],
      maxLengthUserConfig: null,
      isCompressText:
        window.__env &&
        window.__env.textToQRConfig &&
        window.__env.textToQRConfig.isCompressText,
    };
  },
};
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.input-section {
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;
}

.input-area {
  min-height: 100px;
  padding: 0.5rem;
  border-radius: 5px;
  resize: vertical;
}
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.checkbox-wrapper input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
.checkbox-wrapper label {
  color: #333;
  cursor: pointer;
}
.button-generate {
  margin-bottom: var(--padding);
}
.qrcode-section {
  margin: var(--padding);
}

.qrcode-box {
  display: grid;
  gap: 3rem;
  justify-content: center;
  align-items: start;
}

/* Grid responsive cho các mã QR */
@media screen and (max-width: 900px) {
  .qrcode-box {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
}

@media screen and (min-width: 901px) and (max-width: 1400px) {
  .qrcode-box {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (min-width: 1401px) and (max-width: 2100px) {
  .qrcode-box {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (min-width: 2101px) {
  .qrcode-box {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Style cho container của từng mã QR */
.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.qr-header {
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.download-btn {
  margin-left: 1rem;
}

.qr-container canvas,
.qr-container img {
  min-width: 100%;
  max-width: 100%;
  height: auto;
}
.title {
  margin-bottom: unset;
}
</style>
