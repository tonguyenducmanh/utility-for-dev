import { createApp } from "vue";
import App from "@/App.vue";
import cache from "@/common/cache/TDCache.js";
import enumeration from "@/common/TDEnum.js";
import utility from "@/common/TDUtility.js";
import router from "@/router/router.js";
import TDButton from "@/components/TDButton.vue";
import TDTextarea from "@/components/TDTextarea.vue";
import TDInput from "@/components/TDInput.vue";
import TDCheckbox from "@/components/TDCheckbox.vue";
import TDUpload from "@/components/TDUpload.vue";
import TDRadio from "@/components/TDRadio.vue";
import TDRadioGroup from "@/components/TDRadioGroup.vue";

const currentApp = createApp(App);

// add 1 vài global object
currentApp.config.globalProperties.$tdCache = cache;
currentApp.config.globalProperties.$tdEnum = enumeration;
currentApp.config.globalProperties.$tdUtility = utility;

// add 1 vài component global
currentApp.component("TDButton", TDButton);
currentApp.component("TDTextarea", TDTextarea);
currentApp.component("TDInput", TDInput);
currentApp.component("TDCheckbox", TDCheckbox);
currentApp.component("TDUpload", TDUpload);
currentApp.component("TDRadio", TDRadio);
currentApp.component("TDRadioGroup", TDRadioGroup);

currentApp.use(router);

currentApp.mount("#app");
