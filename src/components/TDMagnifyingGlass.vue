<template>
  <div class="td-magnifying-glass" :style="magnifierStyle">
    <canvas
      ref="magnifierCanvas"
      :width="magnifierSize"
      :height="magnifierSize"
      class="td-magnifier-canvas"
    ></canvas>
    <div class="td-crosshair">
      <div class="td-crosshair-horizontal"></div>
      <div class="td-crosshair-vertical"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TDMagnifyingGlass",
  props: {
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    canvas: {
      type: Object,
      required: true,
    },
    mouseX: {
      type: Number,
      required: true,
    },
    mouseY: {
      type: Number,
      required: true,
    },
    canvasRect: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      magnifierSize: 120,
      zoomLevel: 3,
    };
  },
  computed: {
    magnifierStyle() {
      return {
        left: `${this.x + 20}px`,
        top: `${this.y - this.magnifierSize / 2}px`,
        width: `${this.magnifierSize}px`,
        height: `${this.magnifierSize}px`,
      };
    },
  },
  watch: {
    mouseX() {
      this.updateMagnifier();
    },
    mouseY() {
      this.updateMagnifier();
    },
  },
  mounted() {
    this.updateMagnifier();
    window.addEventListener("resize", this.updateCanvasRect);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateCanvasRect);
  },
  methods: {
    updateCanvasRect() {
      this.canvasRect = this.canvas.getBoundingClientRect();
    },
    updateMagnifier() {
      if (!this.canvas || !this.$refs.magnifierCanvas) return;

      const magnifierCanvas = this.$refs.magnifierCanvas;
      const magnifierCtx = magnifierCanvas.getContext("2d");

      // Clear the magnifier canvas
      magnifierCtx.clearRect(0, 0, this.magnifierSize, this.magnifierSize);

      // Calculate the source region to magnify
      const sourceSize = this.magnifierSize / this.zoomLevel;
      const scaleX = this.canvas.width / this.canvasRect.width;
      const scaleY = this.canvas.height / this.canvasRect.height;

      const relativeX = (this.x - this.canvasRect.left) * scaleX;
      const relativeY = (this.y - this.canvasRect.top) * scaleY;

      const sourceX = Math.max(0, relativeX - sourceSize / 2);
      const sourceY = Math.max(0, relativeY - sourceSize / 2);
      const actualSourceWidth = Math.min(
        sourceSize,
        this.canvas.width - sourceX
      );
      const actualSourceHeight = Math.min(
        sourceSize,
        this.canvas.height - sourceY
      );

      // Create a circular clipping path
      magnifierCtx.save();
      magnifierCtx.beginPath();
      magnifierCtx.arc(
        this.magnifierSize / 2,
        this.magnifierSize / 2,
        this.magnifierSize / 2 - 2,
        0,
        2 * Math.PI
      );
      magnifierCtx.clip();

      // Draw the magnified portion
      try {
        magnifierCtx.drawImage(
          this.canvas,
          sourceX,
          sourceY,
          actualSourceWidth,
          actualSourceHeight,
          0,
          0,
          this.magnifierSize,
          this.magnifierSize
        );
      } catch (error) {
        console.error("Error drawing magnified image:", error);
      }

      magnifierCtx.restore();
    },
  },
};
</script>

<style scoped>
.td-magnifying-glass {
  position: fixed;
  pointer-events: none;
  z-index: 1000;
  border-radius: 50%;
  border: 3px solid var(--primary);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  background: white;
}

.td-magnifier-canvas {
  display: block;
  border-radius: 50%;
}

.td-crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.td-crosshair-horizontal,
.td-crosshair-vertical {
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.td-crosshair-horizontal {
  width: 20px;
  height: 1px;
  top: 0;
  left: -10px;
}

.td-crosshair-vertical {
  width: 1px;
  height: 20px;
  top: -10px;
  left: 0;
}
</style>
