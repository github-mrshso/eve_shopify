<template>
  <div>
    <Loading v-show="isLoading" />
    <section
      v-show="!isLoading"
      :class="[themeClass, backgroundClass]"
      ref="page"
      class="quiz"
    >
      <header
        class="quiz__header"
        :class="{'is-stuck': headerIsStuck}"
        ref="header">
        <div class="page-width page-width--narrow">
          <h1 class="visually-hidden">
            Intake questionnaire
          </h1>
          <nav class="quiz__controls">
            <button
              @click="back"
              class="link link--text ln--icon quiz__control--back">
              <i class="nc-icon nc-chevron-left-sm-16"></i>
              back
            </button>
            <button
              @click="switchContext('feed')"
              class="link link--text quiz__control--exit">
              exit
            </button>
            <div class="quiz__control--progress">
              <div class="progress-indicator">
                <ol>
                  <li
                    v-for="(steps, index) in questions.length"
                    :key="index"
                    :class="{'is-complete': index < step}"
                  >
                    <span>Step {{ index }}</span>
                  </li>
                </ol>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <div class="page-width page-width--narrow">
        <Question
          v-if="questions.length"
          :key="activeQuestion.id"
          :step="step"
          :data="activeQuestion"
        />
      </div>

      <footer
        class="step__footer"
        :class="{'is-stuck': footerIsStuck}"
        ref="footer">
        <div class="page-width page-width--narrow">
          <button
            class="button button--large"
            :disabled="!canDoNext"
            @click="next">
            {{ !isFinal ? 'Next Question' : 'Submit' }}
          </button>
        </div>
      </footer>
    </section>
  </div>
</template>

<script>
  import SP from '../utils/sp';
  import Question from './Question.vue';
  import Loading from './Loading.vue';
  import {mapState, mapActions, mapGetters} from 'vuex';

  export default {
    components: {
      Question,
      Loading,
    },
    data() {
      return {
        step: 0,
        headerObserver: {},
        headerIsStuck: false,
        footerObserver: {},
        footerIsStuck: false,
        isLoading: true,
      }
    },
    computed: {
      ...mapState('questionnaire', {
        questions: (state) => state.questions,
      }),
      ...mapGetters('questionnaire', ['answers']),
      activeQuestion() {
        return this.questions[this.step];
      },
      canDoNext() {
        return (
          (this.step <= this.questions.length - 1) &&
          (this.activeQuestion.selected !== null)
        );
      },
      isFinal() {
        return (this.step === this.questions.length - 1);
      },
      themeClass() {
        return this.activeQuestion
          ? `is-${this.activeQuestion.theme}`
          : '';
      },
      backgroundClass() {
        return this.activeQuestion
          ? `is-${this.activeQuestion.background}`
          : '';
      },
    },
    methods: {
      ...mapActions('questionnaire', ['getQuestions', 'postQuizResults']),
      ...mapActions(['switchContext']),
      back() {
        if (this.step === 0) {
          this.switchContext('landing');
        } else {
          this.previous();
        }
      },
      previous() {
        window.scrollTo(0, 0);
        this.step--;
        this.step =
          ((this.step % this.questions.length) + this.questions.length) %
          this.questions.length;
      },
      next() {
        const currID = this.step;
        const nextID = (this.step + 1);
        const curr = this.questions[currID];
        const next = this.questions[nextID];

        SP.quizStep({
          isEntry: false,
          isFinal: (currID === this.questions.length - 1),
          questionID: currID,
          question: curr.question,
          answerID: curr.selected,
          answer: curr.choices[curr.selected].text,
          answerPillars: curr.choices[curr.selected].value,
        });

        if (!this.isFinal) {
          SP.quizStep({
            isEntry: true,
            isFinal: (nextID === this.questions.length - 1),
            questionID: nextID,
            question: next.question,
          });

          window.scrollTo(0, 0);
          this.step++;
          this.step %= this.questions.length;

          return;
        }

        this.submit();
      },
      submit() {
        this.isLoading = true;

        this.postQuizResults()
          .then(() => {
            this.isLoading = false;
            this.switchContext('feed');
          });
      },
      stickyHeader([e]) {
        this.headerIsStuck = (e.intersectionRatio === 1);
      },
      stickyFooter([e]) {
        this.footerIsStuck = (e.intersectionRatio < 1);
      }
    },
    mounted() {
      this.getQuestions()
        .then(() => {
          this.isLoading = false;
          this.headerObserver = new IntersectionObserver(
            this.stickyHeader, {
              threshold: [1],
              root: this.$refs.page,
              rootMargin: '-2px 0px 0px 0px',
            },
          );

          this.footerObserver = new IntersectionObserver(
            this.stickyFooter, {
              threshold: [1]
            },
          );

          this.headerObserver.observe(this.$refs.header);
          this.footerObserver.observe(this.$refs.footer);

          SP.quizStep({
            isEntry: true,
            isFinal: this.isFinal,
            questionID: this.step,
            question: this.questions[this.step].question,
          });
        });
    },
    beforeDestroy() {
      this.footerObserver.disconnect();
    },
  };
</script>
