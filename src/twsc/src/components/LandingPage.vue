<template>
  <div class="twsc__landing">
    <div class="page-width page-width--narrowest">
      <div class="landing">
        <header class="landing__header">
          <h1 class="landing__title">
            The Well Slept Club
          </h1>
          <div class="landing__logo">
            <div class="u-img-wrap" style="padding-bottom: 68%;">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <use href="#svg-twsc-logo-square" />
              </svg>
            </div>
          </div>
        </header>
        <div class="landing__body">
          <slot></slot>
          <div class="landing__controls">
            <button
              @click="switchContext('quiz')"
              class="button button--primary button--large button--full-width landing__control">
              take the quiz
            </button>
            <button
              @click="switchContext('feed')"
              class="link landing__control">
              maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapActions} from 'vuex';

  export default {
    name: 'LandingPage',
    methods: {
      ...mapActions(['switchContext']),
    },
  };
</script>
