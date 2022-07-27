<template>
  <div class="feed__intro">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink">
      <use :href="`#${data.svgID}`" />
    </svg>
    <p><strong>{{ data.title }}</strong></p>
    <p v-html="data.content"></p>
  </div>
</template>

<script>
export default {
  name: 'Intro',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    format: {
      type: Array,
      default: [],
    },
  }
};
</script>
