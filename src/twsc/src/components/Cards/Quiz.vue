<template>
  <div
    class="card card--quiz"
    :class="formatClass"
  >
    <div class="twsc-signpost">
      <div class="twsc-signpost__img twsc-signpost__img--sm">
        <svg>
          <use href="#svg-twsc-logo-zeds-mobile" />
        </svg>
      </div>
      <div class="twsc-signpost__img twsc-signpost__img--lg">
        <svg>
          <use href="#svg-twsc-logo-square-centred" />
        </svg>
        <div class="twsc-signpost__zeds">
          <svg>
            <use href="#svg-zeds-square" />
          </svg>
          <svg>
            <use href="#svg-zeds-square" />
          </svg>
        </div>
      </div>
      <div class="twsc-signpost__body">
        <p>Answer 5 quizzical questions, and we'll help you get the sleep you need to rise and shine.</p>
      </div>
      <div class="twsc-signpost__footer">
        <button
          class="button button--primary"
          @click="onClick">
          let's go
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions} from 'vuex';

// TODO: pass quiz tile in as a slot

export default {
  name: 'QuizCard',
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
  },
  methods: {
    ...mapActions(['switchContext']),
    onClick() {
      this.switchContext('quiz');
    },
  }
}
</script>
