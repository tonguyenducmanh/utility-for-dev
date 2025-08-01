import { createRouter, createWebHistory } from "vue-router";
import i18nData from "@/i18n/i18nData.js";

// cấu hình router dùng chung cho nhiều file
const routerConfig = [
  {
    /**
     * trang chủ
     */
    path: "/:pathMatch(.*)*",
    pathVisible: "/",
    name: "home",
    component: () => import("@/views/TDWelcome.vue"),
    meta: {
      titleKey: "i18nCommon.feature.welcome",
      icon: "td-icon-welcome",
    },
  },
  {
    /**
     * Time-based one-time password authenticator
     */
    path: "/TDOneTimePassword",
    name: "TDOneTimePassword",
    component: () => import("@/views/tools/TDOneTimePassword.vue"),
    meta: {
      titleKey: "i18nCommon.feature.oneTimePassword",
      icon: "td-icon-otp",
    },
  },
  {
    /**
     * Time-based one-time password authenticator
     */
    path: "/TDHTMLPreview",
    name: "TDHTMLPreview",
    component: () => import("@/views/tools/TDHTMLPreview.vue"),
    meta: {
      titleKey: "i18nCommon.feature.HTMLPreview",
      icon: "td-icon-html-preview",
    },
  },
  {
    /**
     * chuyển đổi văn bản thành mã QR
     */
    path: "/textoqrcode",
    name: "textoqrcode",
    component: () => import("@/views/tools/TDTextToQRCode.vue"),
    meta: {
      titleKey: "i18nCommon.feature.QRCodeFromText",
      icon: "td-icon-qr",
    },
  },
  {
    /**
     * chuyển đổi mã QR thành văn bản
     */
    path: "/qrcodetotext",
    name: "qrcodetotext",
    component: () => import("@/views/tools/TDQRCodeToText.vue"),
    meta: {
      titleKey: "i18nCommon.feature.QRCodeToText",
      icon: "td-icon-qr-to-text",
    },
  },
  {
    /**
     * Nén text bằng 1 số thuật toán phổ biến
     */
    path: "/TDTextCompress",
    name: "TDTextCompress",
    component: () => import("@/views/tools/TDTextCompress.vue"),
    meta: {
      titleKey: "i18nCommon.feature.textCompress",
      icon: "td-icon-compress",
    },
  },
  {
    /**
     * so sánh code giữa 2 file
     */
    path: "/comparecode",
    name: "comparecode",
    component: () => import("@/views/tools/TDCompareCode.vue"),
    meta: {
      titleKey: "i18nCommon.feature.compareCode",
      icon: "td-icon-compare-code",
    },
  },
  {
    /**
     * chọn màu từ ảnh
     */
    path: "/colorpicker",
    name: "colorpicker",
    component: () => import("@/views/tools/TDColorPicker.vue"),
    meta: {
      titleKey: "i18nCommon.feature.colorPicker",
      icon: "td-icon-color-picker",
    },
  },
  {
    /**
     * PostgreSQL Formatter
     */
    path: "/codeformatter",
    name: "codeformatter",
    component: () => import("@/views/tools/TDCodeFormatter.vue"),
    meta: {
      titleKey: "i18nCommon.feature.CodeFormatter",
      icon: "td-icon",
    },
  },
  {
    /**
     * convert từ JSON sang object và object sang JSON
     */
    path: "/jsonparser",
    name: "jsonparser",
    component: () => import("@/views/tools/TDJSONParser.vue"),
    meta: {
      titleKey: "i18nCommon.feature.JSONParser",
      icon: "td-icon-json-parser",
    },
  },
  {
    /**
     * chuyển đổi json thành câu lệnh insert postgresql
     */
    path: "/jsontopostgresql",
    name: "jsontopostgresql",
    component: () => import("@/views/tools/TDJSONToPostgreSQL.vue"),
    meta: {
      titleKey: "i18nCommon.feature.JSONToPostgreSQL",
      icon: "td-icon-postgresql",
    },
  },
  {
    /**
     * mapping đệ quy json value
     */
    path: "/mappingjson",
    name: "mappingjson",
    component: () => import("@/views/tools/TDMappingJSON.vue"),
    meta: {
      titleKey: "i18nCommon.feature.JSONMapping",
      icon: "td-icon-json-mapping",
    },
  },
  {
    /**
     * convert JSON sang Excel
     */
    path: "/jsontoexcel",
    name: "jsontoexcel",
    component: () => import("@/views/tools/TDJSONToExcel.vue"),
    meta: {
      titleKey: "i18nCommon.feature.JSONToExcel",
      icon: "td-icon-json-excel",
    },
  },
  {
    /**
     * chuyển đổi base 64 thành ảnh
     */
    path: "/base64toimage",
    name: "base64toimage",
    component: () => import("@/views/tools/TDBase64ToImage.vue"),
    meta: {
      titleKey: "i18nCommon.feature.ImageFromBase64",
      icon: "td-icon-base64-image",
    },
  },
  {
    /**
     * chuyển đổi ảnh thành base 64
     */
    path: "/imagetobase64",
    name: "imagetobase64",
    component: () => import("@/views/tools/TDImageToBase64.vue"),
    meta: {
      titleKey: "i18nCommon.feature.ImageToBase64",
      icon: "td-icon-base64-to-image",
    },
  },
  {
    /**
     * download vscode extension
     */
    path: "/downloadvscodeext",
    name: "downloadvscodeext",
    component: () => import("@/views/tools/TDDownloadVSCodeExt.vue"),
    meta: {
      titleKey: "i18nCommon.feature.DownloadVSCodeExtension",
      icon: "td-icon-download",
    },
  },
  {
    /**
     * uuid v4 generator
     */
    path: "/uuidv4generator",
    name: "uuidv4generator",
    component: () => import("@/views/tools/TDUUIDv4Generator.vue"),
    meta: {
      titleKey: "i18nCommon.feature.UUIDV4Generator",
      icon: "td-icon-uuid",
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routerConfig,
});

router.beforeEach((to, from, next) => {
  let appName = window.__env.appName
  if (to && to.meta && to.meta.titleKey && i18nData.global.te(to.meta.titleKey)) {
    document.title = i18nData.global.t(to.meta.titleKey);
  } else if (appName) {
  document.title = `${window.__env.author} | ${appName}`;
  }
  next();
});

export default router;

export { routerConfig };
