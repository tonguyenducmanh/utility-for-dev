<template>
  <div class="td-sidebar-container">
    <div
      class="td-icon td-menu"
      :class="{ 'td-menu-sibar-hide': !isShowSidebar }"
      @click="toggleSidebar"
    ></div>
    <div v-if="isShowSidebar" class="td-sidebar">
      <div class="td-tool-group">
        <template v-for="(item, index) in routerLink">
          <RouterLink
            class="td-sidebar-item"
            activeClass="td-item-active"
            :id="index"
            :to="item.pathVisible ?? item.path"
            >{{ item.title }}</RouterLink
          >
        </template>
      </div>
      <div class="td-sidebar-bottom">
        <div
          class="td-icon td-theme-toggle"
          :class="{ 'td-theme-toggle-dark': isDarkTheme }"
          @click="toggleTheme"
        ></div>
        <div class="td-icon tg-github" @click="goToSource"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { routerConfig } from "@/router/router.js";

export default {
  name: "TDSidebar",
  components: {},

  created() {},
  mounted() {
    let me = this;
    let currentTheme = me.$tdCache.get(me.$tdEnum.cacheConfig.theme);
    if (!currentTheme) {
      currentTheme = window.__env.defaultValue.theme;
      me.$tdCache.set(me.$tdEnum.cacheConfig.theme, currentTheme);
    }
    me.isDarkTheme = currentTheme == me.$tdEnum.theme.dark;
    let toggleSidebarState = me.$tdCache.get(
      me.$tdEnum.cacheConfig.isShowSidebar
    );
    if (toggleSidebarState) {
      me.isShowSidebar = toggleSidebarState.value;
    }
  },
  methods: {},
  props: {},
  data() {
    return {
      routerLink: routerConfig,
      isShowSidebar: true,
      isDarkTheme: false,
    };
  },
  methods: {
    toggleTheme() {
      let me = this;
      me.isDarkTheme = !me.isDarkTheme;
      let currentTheme = me.isDarkTheme
        ? me.$tdEnum.theme.dark
        : me.$tdEnum.theme.light;
      me.$tdCache.set(me.$tdEnum.cacheConfig.theme, currentTheme);
      me.$tdUtility.setTheme(currentTheme);
    },
    toggleSidebar() {
      let me = this;
      me.isShowSidebar = !me.isShowSidebar;
      me.$tdCache.set(me.$tdEnum.cacheConfig.isShowSidebar, {
        value: me.isShowSidebar,
      });
    },
    goToSource() {
      let me = this;
      if (window.__env.githubSource && window.__env.githubSource.url) {
        window.open(window.__env.githubSource.url, "_blank").focus();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.td-sidebar-container {
  position: relative;
}
.td-sidebar {
  position: relative;
  width: 250px;
  min-width: 250px;
  max-width: 250px;
  height: 100%;
  background-color: var(--bg-sub-color);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  .td-sidebar-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    height: 30px;
    padding: var(--padding);
    padding-left: var(--padding-large);
  }
  .td-sidebar-item:hover {
    background-color: var(--bg-main-color);
  }
  .td-item-active {
    background-color: var(--bg-active-color);
  }
  .td-tool-group {
    flex: 1;
    overflow: auto;
  }
  .td-sidebar-bottom {
    position: relative;
    display: flex;
    column-gap: var(--padding);
    width: 100%;
    align-items: center;
    justify-content: center;
    padding: var(--padding);
    .td-theme-toggle {
      cursor: pointer;
      background-position: -26px 0px;
    }
    .td-theme-toggle-dark {
      background-position: -48px 0px;
    }
    .tg-github {
      cursor: pointer;
      background-position: -76px 0px;
    }
  }
}
.td-menu {
  position: absolute;
  cursor: pointer;
  background-position: 0px 0px;
  z-index: 2;
  top: 0;
  left: 100%;
}
</style>
