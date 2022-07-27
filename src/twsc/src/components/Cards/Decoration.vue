<template>
  <div
    class="card card--decoration"
    :class="`card--decoration-${data.svgID}`">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink">
      <use :href="`#${data.svgID}`" />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Decoration',
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
