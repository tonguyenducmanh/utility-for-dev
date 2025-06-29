<template>
  <div class="container">
    <div class="title">
      {{ $t("i18nCommon.jsonMapping.title") }}
    </div>
    <div class="td-mapping-container">
      <div class="flex flex-wrap td-mapping-group">
        <TDTextarea
          :placeHolder="$t('i18nCommon.jsonMapping.sourcePlaceholder')"
          :label="$t('i18nCommon.jsonMapping.sourceLabel')"
          isLabelTop
          v-model="originalObjectText"
          height="300px"
          width="500px"
        ></TDTextarea>
        <TDTextarea
          :label="$t('i18nCommon.jsonMapping.targetLabel')"
          :placeHolder="$t('i18nCommon.jsonMapping.targetPlaceholder')"
          isLabelTop
          v-model="targetObjectText"
          height="300px"
          width="500px"
        ></TDTextarea>
      </div>
      <div class="flex flex-wrap td-mapping-group">
        <TDTextarea
          :placeHolder="$t('i18nCommon.jsonMapping.resultPlaceholder')"
          :label="$t('i18nCommon.jsonMapping.resultLabel')"
          isLabelTop
          v-model="replacedObjectText"
          height="300px"
          :readOnly="true"
          width="500px"
        ></TDTextarea>
        <TDTextarea
          :placeHolder="$t('i18nCommon.jsonMapping.errorPlaceholder')"
          :label="$t('i18nCommon.jsonMapping.errorLabel')"
          isLabelTop
          v-model="errorListText"
          height="300px"
          :readOnly="true"
          width="500px"
        ></TDTextarea>
      </div>
      <div class="flex">
        <TDButton
          @click="mappingNow"
          :label="$t('i18nCommon.jsonMapping.mappingButton')"
        ></TDButton>
        <TDButton
          @click="formatResult"
          :type="$tdEnum.buttonType.secondary"
          :label="$t('i18nCommon.jsonMapping.formatButton')"
        ></TDButton>
        <TDButton
          @click="haddleCopyEvent(replacedObjectText)"
          :type="$tdEnum.buttonType.secondary"
          :label="$t('i18nCommon.jsonMapping.copyResultButton')"
        ></TDButton>
        <TDButton
          @click="haddleCopyEvent(errorListText)"
          :type="$tdEnum.buttonType.secondary"
          :label="$t('i18nCommon.jsonMapping.copyErrorButton')"
        ></TDButton>
        <TDButton
          @click="applyMock"
          :type="$tdEnum.buttonType.secondary"
          :label="$t('i18nCommon.jsonMapping.example')"
        ></TDButton>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "TDMappingJSON",
  created() {
    let me = this;
  },
  beforeUnmount() {
    let me = this;
  },
  mounted() {},
  data() {
    return {
      // danh sách lỗi
      errorList: {},
      errorListText: null,
      // object json input cần copy value
      originalObject: {},
      originalObjectText: null,
      // object json input cần paste value
      targetObject: {},
      targetObjectText: null,
      // object json tùy chỉnh
      customObject: {},
      customObjectText: null,
      // object json output sau khi copy
      replacedObject: {},
      replacedObjectText: null,
    };
  },
  methods: {
    async applyMock() {
      // Lazy-load module
      const { TDMockMappingJSON } = await import(
        /* webpackChunkName: "mock-mapping-json" */
        "@/common/mock/TDMockMappingJSON.js"
      );
      this.$tdUtility.applyMock(this, TDMockMappingJSON);
    },
    haddleCopyEvent(value) {
      let me = this;
      me.$tdUtility.copyToClipboard(value);
    },
    // region xử lý file
    mappingNow() {
      let me = this;
      //reset error
      me.errorList = {};
      me.prepareData();
      if (me.originalObject && me.targetObject && me.customObject) {
        // thay thế các value của object B bằng value của object A
        let replaceLanguageText = me.doMappingKeyValuePairRecusive(
          me.originalObject,
          me.targetObject,
          me.customObject
        );

        me.replacedObject = replaceLanguageText;

        // hiển thị cho user xem
        me.replacedObjectText = JSON.stringify(me.replacedObject);
        me.errorListText = JSON.stringify(me.errorList);
      }
      me.$tdToast.success(null, me.$t("i18nCommon.toastMessage.success"));
    },
    formatResult() {
      let me = this;
      me.replacedObjectText = JSON.stringify(me.replacedObject, null, " ");
      me.errorListText = JSON.stringify(me.errorList, null, " ");
      me.$tdToast.success(null, me.$t("i18nCommon.toastMessage.success"));
    },
    /**
     * chuẩn bị dữ liệu
     */
    prepareData() {
      let me = this;
      // lấy ra các object đầu vào
      me.originalObject = me.parseJSONNotSafeObject(me.originalObjectText);
      me.targetObject = me.parseJSONNotSafeObject(me.targetObjectText);
      me.customObject = me.parseJSONNotSafeObject(me.customObjectText);
    },

    /**
     *
     * @param value dữ liệu sẽ parse sang object
     */
    parseJSONNotSafeObject(value) {
      let me = this;
      let result = {};
      if (value && typeof value == "string") {
        try {
          result = JSON.parse(value);
        } catch (error) {
          result = me.parseNonStandardJSONObject(value);
        }
      }
      return result;
    },
    parseNonStandardJSONObject(value) {
      let me = this;
      if (!value || typeof value !== "string") {
        return {};
      }

      try {
        const trimmedValue = value.trim();
        if (!trimmedValue.startsWith("{") || !trimmedValue.endsWith("}")) {
          console.warn(
            "Không phải là object JSON hợp lệ (thiếu dấu ngoặc nhọn)."
          );
          return {};
        }

        const content = trimmedValue.slice(1, -1).trim();
        const result = {};
        let key = "";
        let val = "";
        let inString = null; // null, single quote, double quote, backtick
        let braceCount = 0;

        for (let i = 0; i < content.length; i++) {
          const char = content[i];

          if (inString) {
            val += char;
            if (char === inString && content[i - 1] !== "\\") {
              // Check for closing quote (ignore escaped quotes)
              inString = null;
            }
            continue;
          }

          if (char === "'" || char === '"' || char === "`") {
            inString = char;
            val += char;
            continue;
          }

          if (char === "{") {
            braceCount++;
            val += char;
            continue;
          }

          if (char === "}") {
            braceCount--;
            val += char;
            continue;
          }

          if (char === ":" && braceCount === 0) {
            key = val.trim();
            val = "";
            continue;
          }

          if (char === "," && braceCount === 0) {
            const processedKey = me.unquote(key);
            const processedVal = me.unquoteAndCast(val.trim());
            result[processedKey] =
              typeof processedVal === "string" &&
              processedVal.startsWith("{") &&
              processedVal.endsWith("}")
                ? me.parseNonStandardJSONObject(processedVal)
                : processedVal;
            key = "";
            val = "";
            continue;
          }

          val += char;
        }

        // Xử lý cặp key-value cuối cùng
        if (key) {
          const processedKey = me.unquote(key);
          const processedVal = me.unquoteAndCast(val.trim());
          result[processedKey] =
            typeof processedVal === "string" &&
            processedVal.startsWith("{") &&
            processedVal.endsWith("}")
              ? me.parseNonStandardJSONObject(processedVal)
              : processedVal;
        }

        return result;
      } catch (ex) {
        console.error(ex);
      }
    },
    unquote(str) {
      let me = this;
      const trimmed = str.trim();
      if (
        (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("`") && trimmed.endsWith("`"))
      ) {
        return trimmed.slice(1, -1);
      }
      return trimmed;
    },
    unquoteAndCast(str) {
      let me = this;
      const unquoted = me.unquote(str);
      if (!isNaN(Number(unquoted))) {
        return Number(unquoted);
      }
      if (unquoted === "true") {
        return true;
      }
      if (unquoted === "false") {
        return false;
      }
      return unquoted;
    },
    /**
     * Thực hiện mapping key value đệ quy
     */
    doMappingKeyValuePairRecusive(originalObject, targetObject, customObject) {
      let me = this;
      let result = originalObject;

      for (const key in result) {
        if (Object.hasOwnProperty.call(result, key)) {
          const element = result[key];

          if (typeof element == "string") {
            //bo sung check neu trung value thi cung them vao error list
            me.checkValueIsSameByKey(originalObject, targetObject, key);

            if (
              targetObject &&
              targetObject.hasOwnProperty(key) &&
              targetObject[key]
            ) {
              result[key] = targetObject[key];
            } else if (
              customObject &&
              customObject.hasOwnProperty(key) &&
              customObject[key]
            ) {
              result[key] = customObject[key];
            } else {
              // thêm vào mảng lỗi để user biết là không mapping được
              me.errorList[key] = result[key];
            }
          }
          // nếu key hiện tại có value là object thì gọi đệ quy
          if (typeof element == "object") {
            let targetLang = null;
            if (
              targetObject &&
              targetObject.hasOwnProperty(key) &&
              targetObject[key]
            ) {
              targetLang = targetObject[key];
            }
            result[key] = me.doMappingKeyValuePairRecusive(
              result[key],
              targetLang,
              customObject
            );
          }
        }
      }
      return result;
    },

    /**
     * bo sung check neu trung value thi cung them vao error list
     */
    checkValueIsSameByKey(originalObject, targetObject, key) {
      let me = this;
      if (
        key &&
        originalObject &&
        originalObject.hasOwnProperty(key) &&
        targetObject &&
        targetObject.hasOwnProperty(key) &&
        originalObject[key] == targetObject[key]
      ) {
        me.errorList[key] = originalObject[key];
      }
    },
  },
};
</script>
<style scoped>
.container {
  width: 100%;
  height: 100%;
  padding: 2rem;
  border-radius: 0;

  box-shadow: none;
}
.td-mapping-group {
  column-gap: var(--padding-large);
  margin-bottom: var(--padding-large);
}
</style>
