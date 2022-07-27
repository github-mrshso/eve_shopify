<template>
  <div class="quiz__steps">
    <article :id="'quiz-step-' + data.id" class="step">
      <header class="step__header" :class="[headerClass]">
        <div class="step__question">
          <h1 v-html="question"></h1>
          <p v-if="data.subtitle">
            {{ data.subtitle }}
          </p>
        </div>
        <div class="step__img"></div>
      </header>

      <div class="step__options">
        <div
          v-for="(answer, index) in data.choices"
          :class="{'is-active': index === selected}"
          :key="index"
          class="step__option"
        >
          <div class="form-field form-field--option">
            <div class="form-field__field">
              <label
                :for="`answer-${data.id}-${index}`"
                class="opt opt--radio">
                <input
                  :id="`answer-${data.id}-${index}`"
                  :value="index"
                  :name="data.name"
                  v-model="selected"
                  class="opt__input"
                  type="radio">
                <span class="opt__proxy">&nbsp;</span>
                <span class="opt__label">
                  {{ answer.text }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
  import markdown from '../utils/markdown';

  export default {
    name: 'Question',
    props: {
      data: {
        type: Object,
        required: true,
      },
      step: {
        type: Number,
        required: true,
      },
    },
    data() {
      return {
        selected: null,
      };
    },
    computed: {
      selected: {
        get() {
          return this.data.selected;
        },
        set(value) {
          this.$store.commit('questionnaire/setAnswer', {
            step: this.step,
            value,
          });
        },
      },
      question() {
        return markdown(this.data.question, false);
      },
      headerClass() {
        // The class that determines the svg position/styling for the header background.
        return this.data.background
          ? `step__header--${this.data.background}`
          : '';
      },
    },
  };
</script>
