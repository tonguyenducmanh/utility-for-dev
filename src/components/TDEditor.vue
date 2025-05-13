<template>
  <div ref="editorContainer" class="td-editor"></div>
</template>

<script>
import "@/common/editor/monaco.js";
import * as monaco from "monaco-editor";
export default {
  name: "TDEditor",
  created() {},
  mounted() {
    let me = this;

    me.editorInstance = monaco.editor.create(me.$refs.editorContainer, {
      value: me.modelValue ?? me.defaultValue,
      language: me.language,
      theme: me.isDarkMode ? "vs-dark" : "vs-light",
      automaticLayout: true,
    });
  },
  methods: {},
  computed: {},
  props: {
    modelValue: {
      type: String,
      default: null,
    },
    language: {
      type: String,
      default: "javascript",
    },
    isDarkMode: {
      type: Boolean,
      default: false,
    },
    defaultValue: {
      type: String,
      default: "hello from editor",
    },
  },
  data() {
    return {
      value: null,
      editorInstance: null,
    };
  },
  watch: {
    // modelValue(newVal) {
    //   if (this.editorInstance && newVal !== this.editorInstance.getValue()) {
    //     this.editorInstance.setValue(newVal);
    //   }
    // },
    // isDarkMode(newVal) {
    //   if (this.editorInstance) {
    //     const newTheme = newVal ? "vs-dark" : "vs-light";
    //     monaco.editor.setTheme(newTheme);
    //   }
    // },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
.td-editor {
  width: 100%;
  height: 100%;
}
</style>
