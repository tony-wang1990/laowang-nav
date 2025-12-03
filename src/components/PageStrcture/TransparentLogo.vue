<template>
  <img :src="processedSrc" v-if="processedSrc" class="transparent-logo" alt="Logo" />
  <img :src="src" v-else class="transparent-logo hidden" @load="processImage" ref="originalImage" alt="Logo Original" />
</template>

<script>
export default {
  name: 'TransparentLogo',
  props: {
    src: {
      type: String,
      required: true,
    },
    tolerance: {
      type: Number,
      default: 50, // Increased default tolerance
    },
  },
  data() {
    return {
      processedSrc: '',
    };
  },
  watch: {
    src() {
      this.processedSrc = '';
      this.$nextTick(() => {
        if (this.$refs.originalImage && this.$refs.originalImage.complete) {
            this.processImage();
        }
      });
    }
  },
  methods: {
    processImage() {
      const img = this.$refs.originalImage;
      if (!img) return;

      // Create a canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to image dimensions
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      
      // Draw the image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Loop through pixels
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Check if pixel is dark (black background)
        // Using sum of RGB values for better dark detection
        if (r + g + b < this.tolerance * 3) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }
      
      // Put image data back
      ctx.putImageData(imageData, 0, 0);
      
      // Convert to Data URL
      this.processedSrc = canvas.toDataURL('image/png');
    },
  },
};
</script>

<style scoped>
.transparent-logo {
  display: block;
  /* Inherit size from parent/props usually, but here we let parent style it via class */
}
.hidden {
  visibility: hidden;
  position: absolute;
  pointer-events: none;
}
</style>
