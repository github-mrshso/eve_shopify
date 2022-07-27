<template>
  <article
    class="card card--product"
    :class="formatClass"
    :data-id="data.id">
    <div class="card__img">
      <div class="wrapped-image">
        <div class="wrapped-image__aspect-ratio-holder">
          <div
            class="wrapped-image__aspect-ratio"
            style="padding-bottom: 75.0%"></div>
          <div class="wrapped-image__media">
            <picture>
              <source :srcset="data.srcset">
              <img
                :alt="data.name"
                :src="data.featuredImage"
                width="360"
                height="270"
                class="picture__image"
                loading="lazy">
            </picture>
          </div>
        </div>
      </div>
    </div>
    <div class="card__body">
      <div class="card__label">
        <header class="card__header">
          <!--
            <span class="card__icon">
              <i class="nc-icon nc-megaphone-24"></i>
            </span>
          -->
          <h1 class="card__title">
            {{ data.tagline }}
          </h1>
        </header>
        <div class="card__meta">
          <div class="card__tags">
            {{ data.pillar }}
          </div>
        </div>
        <div class="card__excerpt">
          <p>{{ data.smallprint }}</p>
          <p class="card__price">
            {{ data.price }}
          </p>
        </div>
        <a
          class="card__cta button button--primary button--full-width"
          :href="data.url">
          shop now
        </a>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: 'Product',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    format: {
      type: Array,
      default: [],
    },
  },
  computed: {
    formatClass() {
      return this.format
        .map((cols, i) => `card--format-${i + 1}-${cols}`)
        .join(' ');
    },
  }
};
</script>

