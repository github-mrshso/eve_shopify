<template>
  <div class="twsc__error">
    <div class="page-width page-width--narrow">
      <div class="info-state">
        <div class="info-state__header">
          <h1 class="info-state__title">
            {{ config.title }}
          </h1>
          <p>
            <small>{{ config.description }}</small>
          </p>
        </div>
        <div class="info-state__img">
          <!-- TODO: Fix sheep graphic on erro page -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink">
            <use :href="`#${config.image}`" />
          </svg>
        </div>
        <div class="info-state__body">
          {{ config.explanation }}
        </div>
        <div class="info-state__footer">
          <button
            class="button button-large"
            @click="eventType()">
            {{ config.button }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex';

export default {
  name: 'ErrorPage',
  computed: {
    ...mapState({
      config: (state) => state.errorConfig,
    }),
  },
  methods: {
    eventType() {
      switch (this.config.errorAction) {
        case 'getProfile':
          return this.$emit('get-profile');
        case 'getQuestions':
          return this.$emit('get-questions');
        case 'getGenericFeed':
          return this.$emit('get-generic-feed');
        default:
          break;
      }
    },
  },
  // When setting up the event for the button, remember to emit an event that tells
  // parent component App.vue to hide the error page
};
</script>
