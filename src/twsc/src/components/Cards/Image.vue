<template>
  <picture>
    <source
      v-for="(format, maxWidth) in sources"
      :key="maxWidth"
      :srcset="srcset(format)"
      :media="`(max-width: ${maxWidth}px)`"
      :type="`image/${type}`"
    >
    <img
      :src="src(fallback.format)"
      :width="fallback.width"
      :height="fallback.height"
      :alt="alt"
      :loading="loading"
    >
  </picture>
</template>

<script>
import {mapState} from 'vuex';

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
    sizes: {
      type: Array,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
    loading: {
      type: String,
      default: 'lazy'
    }
  },
  data() {
    return {
      type: 'jpeg',
      formats: {
        'article-hero-small': {
          width: 360,
          height: 320,
        },
        'article-hero-large': {
          width: 750,
          height: 548,
        },
        'feed-hero': {
          width: 1140,
          height: 548,
        },
        'feed-full-width': {
          width: 1140,
          height: 275,
        },
        'feed-full-height': {
          width: 360,
          height: 548,
        },
      },
    }
  },
  computed: {
    ...mapState({
      imgBase: (state) => state.imgBase,
      cacheBuster: (state) => state.cacheBuster,
    }),
    imgSizes() {
      const names = this.sizes.reduce((acc, width, i) => {
        let key = '';
        let name = '';

        switch (i) {
          case 0:
            key = 830;
            break;
          case 1:
            key = 1220;
            break;
          case 2:
            key = 'fallback';
            break;
          default:
            break;
        }

        switch (width) {
          case 3:
            name = 'feed-full-width'
            break;
          case 2:
            name = 'article-hero-large'
            break;
          case 1:
            name = 'article-hero-small'
            break;
          default:
            break;
        }

        acc[key] = name;

        return acc;
      }, {});

      return names;
    },
    sources() {
      // const obj = Object.entries(this.imgSizes)
      //   .filter(([media]) => media !== 'default')
      //   .reduce((acc, [media, format]) => (acc[media] = format))
      //   // .sort((a, b) => (a[0] !== b[0] ? a[0] > b[0] ? -1 : 1 : 0))
      //   // .reduce((acc, [media, format], i, arr) => {
      //   //   const next = arr[i + 1][1] || format;

      //   //   if (format !== next) {
      //   //     console.log(next, format);
      //   //     acc[media] = format;
      //   //   }

      //   //   return acc;
      //   // }, {});

      const sources = {...this.imgSizes};

      delete sources.default;

      return sources;
    },
    fallback() {
      return {
        format: this.imgSizes.fallback,
        ...this.formats[this.imgSizes.fallback],
      };
    },
  },
  methods: {
    src(format, scale = 1) {
      const {width, height} = this.formats[format];
      const dim = `${width * scale}x${height * scale}`;

      return `${this.imgBase}${this.id}_${format}_${dim}_crop_center.jpg?v=${this.cacheBuster}`;
    },
    srcset(format) {
      const x1 = this.src(format, 1);
      const x2 = this.src(format, 2);

      return `${x1} 1x, ${x2} 2x`;
    },
  }
};
</script>
