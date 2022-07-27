<template>
  <!-- TODO: Transition these blocks -->
  <div v-if="context === 'initialising'"
    class="twsc__loading twsc__loading--initialising">
    <div class="page-width page-width--narrow">
      <slot
        name="initialisation-state"
        :variant="initialisationStateVariant">
      </slot>
    </div>
  </div>

  <LandingPage
    v-else-if="context === 'landing'"
    class="twsc__landing">
    <slot name="landing"></slot>
  </LandingPage>

  <Quiz
    v-else-if="context == 'quiz'"
    class="twsc__quiz"
  />

  <div v-else>
    <Header
      :href="this.urls.feed"
      class="twsc__header"
    />

    <ErrorPage v-if="context === 'error'"
      class="twsc__error" />

    <Feed v-if="context === 'feed'"
      class="twsc__feed"
      :products="products"
      :decorations="decorations"
      :intro="intro">
      <template #hero>
        <slot name="hero"></slot>
      </template>
      <template #intro>
        <slot name="intro"></slot>
      </template>
    </Feed>
  </div>
</template>

<script>
  import Quiz from './components/Quiz.vue';
  import LandingPage from './components/LandingPage.vue';
  import Header from './components/Header.vue';
  import Feed from './components/Feed.vue';
  import ErrorPage from './components/ErrorPage.vue';
  import getLogger from './logging';
  import {mapState, mapActions, mapMutations} from 'vuex';
  import Question from './components/Question.vue';
  import {getRandomInt} from './utils/random';
  import SP from './utils/sp';

  const logger = getLogger()

  export default {
    name: 'app',
    props: {
      intro: {
        type: Object,
        default: {},
      },
      products: {
        type: Array,
        default: [],
      },
      decorations: {
        type: Array,
        default: [],
      },
      initialisationStatesCount: {
        type: Number,
        required: true,
      },
      imgBase: {
        type: String,
        required: true,
      },
      initialisationTimeout: {
        type: Number,
        required: true,
      },
      urls: {
        type: Object,
        required: true,
      },
    },
    components: {
      Header,
      Quiz,
      LandingPage,
      Feed,
      ErrorPage,
      Question,
    },
    data() {
      return {
        pillars: {},
        currentAnswers: {},
        questionAnswered: false,
        currentStep: 0,
      }
    },
    methods: {
      ...mapMutations([
        'setError', 'setUUID', 'setImgBase',
      ]),
      ...mapActions(['switchContext', 'getProfile']),
      ...mapActions('feed', ['getFeed']),
    },
    computed: {
      ...mapState({
        hasQuiz: (state) => state.hasQuiz,
        uuid: (state) => state.uuid,
        context: (state) => state.context,
      }),
      ...mapState('questionnaire', {
        quiz: (state) => state.quiz,
      }),
      initialisationStateVariant() {
        return getRandomInt(1, this.initialisationStatesCount);
      },
    },
    mounted() {
     /**
      * Shopify theme has scrollRestoration:auto which makes the main page scroll stuck at the footer
      * following code makes it the page scroll stick to the top
      */
      history.scrollRestoration = 'manual';
      let context = 'feed';
      this.setImgBase(this.imgBase);
      const timeout = this.initialisationTimeout < 1000
        ? (this.initialisationTimeout * 1000)
        : this.initialisationTimeout;
      const initialisationTimer = setTimeout(() => {
        this.switchContext(context);
      }, timeout);
      SP.getUUID()
        .then((uuid) => {
          this.setUUID(uuid);
          return this.getProfile()
            .then((data) => {
              if (data) {
                context = data.has_quiz ? 'feed' : 'landing';
              } else {
                context = 'feed';
              }
            })
            .catch((err) => {
              clearTimeout(initialisationTimer);
              this.setError({
                title: 'Something went wrong!',
                // TODO: add explanation for missing profile
                description: 'we couldn\'t find your profile',
                explanation: 'Don\'t worry, someone is on the case. Please try again soon',
                image: 'svg-sheep',
                // button: 'Try again',
                // action: 'getProfile',
              });
              this.switchContext('error');
              Bugsnag.notify(err);
            });
        })
        .catch((err) => {
          Bugsnag.notify(err);
        })
    },
  };
</script>
