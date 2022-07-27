<template>
  <header class="page-banner">
    <div class="page-width">
      <h1 class="visually-hidden">
        The Well Slept Club
      </h1>
      <div class="page-banner-img">
        <a :href="href">
          <div class="u-img-wrap" style="padding-bottom: 17.6%;">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <use href="#svg-twsc-logo-banner" />
            </svg>
          </div>
        </a>
      </div>
    </div>
  </header>
</template>

<script>
  export default {
    name: 'Header',
    props: {
      href: {
        type: String,
        required: true,
      },
    },
  };
</script>
