<template>
  <div>
    <div class="container">
      <div class="title">{{ $t("i18nCommon.compareCode.title") }}</div>
      <div class="flex flex-wrap td-compare-box">
        <TDTextarea
          :placeHolder="$t('i18nCommon.compareCode.firstFile')"
          v-model="firstCodeFile"
          :label="oldTitle"
          isLabelTop
          height="400px"
          width="500px"
        ></TDTextarea>
        <TDTextarea
          :placeHolder="$t('i18nCommon.compareCode.secondFile')"
          v-model="secondCodeFile"
          :label="newTitle"
          isLabelTop
          height="400px"
          width="500px"
        ></TDTextarea>
      </div>
      <TDCheckbox
        v-model="isCompareSideBySide"
        :label="$t('i18nCommon.compareCode.compareStyle')"
        @input="compare"
        class="td-checkbox-sibe-by-side"
      ></TDCheckbox>
      <div class="flex">
        <TDButton @click="compare" :label="$t('i18nCommon.compareCode.compare')"></TDButton>
        <TDButton
          @click="applyMock"
          :type="$tdEnum.buttonType.secondary"
          :label="$t('i18nCommon.compareCode.example')"
        ></TDButton>
      </div>
    </div>
    <div class="diff-output" v-html="diffOutputHtml"></div>
  </div>
</template>
<script>
import * as Diff2Html from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";
import { createTwoFilesPatch } from "diff";
export default {
  name: "TDCompareCode",
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
      const { TDMockCompareCode } = await import(
        /* webpackChunkName: "mock-compare-code" */
        "@/common/mock/TDMockCompareCode.js"
      );
      this.$tdUtility.applyMock(this, TDMockCompareCode);
    },
    compare() {
      let me = this;
      if (me.firstCodeFile && me.secondCodeFile) {
        let diff = createTwoFilesPatch(
          me.oldTitle,
          me.newTitle,
          me.firstCodeFile,
          me.secondCodeFile
        );
        me.diffOutputHtml = Diff2Html.html(diff, {
          inputFormat: "diff",
          showFiles: true,
          matching: "lines",
          outputFormat: me.isCompareSideBySide
            ? "side-by-side"
            : "line-by-line",
        });
      }
    },
  },
  data() {
    return {
      firstCodeFile: null,
      secondCodeFile: null,
      diffOutputHtml: null,
      isCompareSideBySide: true,
      oldTitle: "old.txt",
      newTitle: "new.txt",
    };
  },
};
</script>
<style scoped>
.container {
  width: 100%;
  padding: 2rem;
  border-radius: 0;
  box-shadow: none;
}
.td-checkbox-sibe-by-side {
  display: flex;
  align-items: center;
  justify-content: center;
}
.td-compare-box {
  column-gap: var(--padding);
}
.diff-output {
  display: block;
  width: 100%;
}
</style>
