<template>
  <div class="page-width page-width--full-bleed">
    <div class="feed feed--twsc">
      <slot name="hero"></slot>
      <div class="feed__body">
        <div class="feed__filter">
          <!--
          <Filter
            :feed="userFeed"
            v-model="currentFilter"
          />
          -->
        </div>
        <div
          class="feed__list"
          :class="{'is-loading': isFetching}">
          <template
            v-for="(item, key) in enrichedFeed"
            :key="key"
          >
            <Component
              :is="item.component"
              :data="item.data"
              :format="item.format"
            />
          </template>
        </div>
      </div>
      <div class="feed__footer">
        <button
          v-if="availableArticles.length > 0"
          @click="loadMore"
          class="button button--secondary"
          :class="{'is-loading': isFetching}"
          :disabled="isFetching">
          <span class="button__loading">
            <span class="loader loader--dark">
              <span class="loader__ring"></span>
              <span class="loader__circle"></span>
            </span>
          </span>
          <span class="button__text">
            Load more
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapState, mapActions} from 'vuex'
  import Filter from './Filter.vue'
  import Product from './Cards/Product.vue'
  import Article from './Cards/Article.vue'
  import Decoration from './Cards/Decoration.vue'
  import Intro from './Cards/Intro.vue'
  import Quiz from './Cards/Quiz.vue'

  export default {
    name: 'Feed',
    components: {
      Article,
      Product,
      Decoration,
      Filter,
      Quiz,
      Intro,
    },
    props: {
      products: {
        type: Array,
        default: [],
      },
      decorations: {
        type: Array,
        default: [],
      },
      intro: {
        type: Object,
        default: {},
      },
    },
    data() {
      return {
        userFeed: [],
        isLoading: false,
        pageSize: 9,
        feedSize: 0,
        nonArticleItems: 0,
        fetching: {},
        articles: null,
        hasIntroCard: false,
        currentFilter: {
          sort: 'recommended',
          topic: 'all',
          type: 'all',
        },
      };
    },
    computed: {
      ...mapState({
        pillarWeights: (state) => state.pillars,
        hasQuiz: (state) => state.hasQuiz,
      }),
      ...mapState('feed', {
        likedArticles: (state) => state.likedArticles,
        pillarArticles: (state) => state.pillars,
      }),
      /**
       * @return {Array} The feed once the products/decorations have been
       *                 inserted
       */
      enrichedFeed() {
        const feed = [];
        let layoutIndex = this.hasIntroCard ? 1 : 0;

        // TODO: make feed enrichment extensible

        for (let i = 0; i < this.userFeed.length; i++) {
          const productIndex = (Math.floor(i / this.pageSize) % this.products.length);
          const decorationIndex = (Math.floor(i / this.pageSize) % this.decorations.length);

          if (layoutIndex >= this.layout.length) {
            layoutIndex = 0
          }

          if (this.layout[layoutIndex].type === 'product') {
            feed.push({
              ...this.layout[layoutIndex],
              data: this.products[productIndex],
            });

            layoutIndex++;
          }

          if (this.layout[layoutIndex].type === 'decoration') {
              feed.push({
                ...this.layout[layoutIndex],
                data: this.decorations[decorationIndex],
            });

            layoutIndex++;
          }

          feed.push({
            ...this.layout[layoutIndex],
            data: this.userFeed[i],
          });

          layoutIndex++;
        }

        if (this.hasIntroCard) {
          feed.splice(0, 0, {
            type: 'intro',
            component: 'Intro',
            format: [1, 1, 1],
            data: this.intro,
          });
        }

        if (!this.hasQuiz) {
          feed.splice(6, 0, {
            type: 'quiz',
            component: 'Quiz',
            format: [1, 2, 3],
          });
        }

        return feed;
      },
      /**
       * @return {number} The number of articles required to satiate a change of
       *                  feedSize
       */
      articlesNeeded() {
        let nonArticleItems = (this.nonArticleItems * this.pageCount);

        if (this.hasIntroCard) {
          nonArticleItems++;
        }

        // if (!this.hasQuiz) {
        //   nonArticleItems++;
        // }

        return (this.feedSize - this.userFeed.length - nonArticleItems);
      },
      /**
       * @return {Array} Articles not yet in userFeed as a flat array
       */
      availableArticles() {
        return Object.values(this.availableArticlesByPillar)
          .reduce((acc, articles) => {
            acc = acc.concat(articles);

            return acc;
          }, [])
          .filter(this.applyCurrentFilter)
          .sort(this.applyCurrentSort);
      },
      /**
       * @return {Object} Articles not yet in userFeed grouped by pillar
       */
      availableArticlesByPillar() {
        return Object.entries(this.pillarArticles)
          .reduce((acc, [pillar, articles]) => {
            const absentArticles = articles
              .filter(article => this.userFeed.find(other => article.id === other.id) === undefined)
              .filter(this.applyCurrentFilter)
              .sort(this.applyCurrentSort);

            acc[pillar] = absentArticles;

            return acc;
          }, {});
      },
      isFetching() {
        Object.values(this.fetching).every(isFetching => !isFetching)
      },
      pageCount() {
        return Math.ceil(this.userFeed.length / this.pageSize);
      },
      layout() {
        return [
          {
            type: 'article',
            component: 'Article',
            format: [1, 1, 1],
          },
          {
            type: 'article',
            component: 'Article',
            format: [1, 1, 1],
          },
          {
            type: 'article',
            component: 'Article',
            format: [1, 1, 1],
          },
          {
            type: 'article',
            component: 'Article',
            format: [1, 1, 1],
          },
          {
            type: 'article',
            component: 'Article',
            format: [1, 2, 1],
          },
          {
            type: 'decoration',
            component: 'Decoration',
            format: [1, 1, 1],
          },
          {
            type: 'article',
            component: 'Article',
            format: [1, 2, 3],
          },
          {
            type: 'product',
            component: 'Product',
            format: [1, 1, 1],
          },
          {
            type: 'article',
            component: 'Article',
            format: [1, 1, 2],
          },
        ];
      },
    },
    methods: {
      ...mapActions('feed', ['getPillarArticles']),
      loadMore() {
        this.isLoading = true;
        this.articles = this.getIterator();
        this.feedSize += this.pageSize;
      },
      /**
       * Fetch articles from the API if the current pool of articles is empty
       *
       * @return {Promise} A promise that resolves to an array of objects for
       *                   each pillar
       */
      fetchArticles() {
        const promises = Object.keys(this.availableArticlesByPillar)
          .reduce((acc, pillar) => {
            if (
              this.availableArticlesByPillar[pillar].length === 0 &&
              !this.fetching[pillar]
            ) {
              this.fetching[pillar] = true;

              acc.push(
                this.getPillarArticles({pillar}).then(() => {
                  this.fetching[pillar] = false;
                })
              );
            } else {
              acc.push(Promise.resolve());
            }

            return acc;
          }, []);

        return Promise.allSettled(promises);
      },
      /**
       * Finds the next pillar needed to adhere to the weighting being provided
       *
       * @param {number} total  Total number of articles in the page
       * @param {Object} counts Positive interactions with pillars
       * @param {Object} total  Entire pool of articles to select from
       * @returns {Object} An object containing the name of the pillar that is
       *                   next needed to adhere to the weighting provided
       */
      getCorrection(total, counts, articles) {
        const foo = Object.entries(this.pillarWeights)
          .map(([pillar, weight]) => {
            const obj = {
              pillar,
              weight: total
                // convert the percentage to a decimal and if there is a total
                // value provided then calculate the correction as a percentage
                // of that total
                ? ((weight * 0.01) - (counts[pillar] / total))
                // otherwise, assume that it is already equally shared and convert
                // the percentage into a decimal
                : (weight * 0.01),
            };

            return obj;
          });

        return Array.from(foo)
          // sort the pillars such that the pillar with the highest value is
          // first, i.e. the pillar with the greatest weight
          .sort((a, b) => b.weight - a.weight)
          // choose the top pillar i.e. the pillar with the greatest weight as
          // long as it has articles
          .find(pillar => articles[pillar.pillar].length > 0);
      },
      getIterator() {
        if (this.currentFilter.sort === 'recommended') {
          return this.iterateByWeight();
        } else {
          return this.iterateByDate();
        }
      },
      /**
       * Fetches articles from the pool or articles keeping track of the
       * pillar weightings.
       *
       * @yields {Object} The context of the article next in the stack
       */
      *iterateByWeight() {
        // scaffold an object with each pillar weight set to zero
        // e.g. {rest-better: 0, eat-better: 0, live-better: 0, feel-better: 0}
        const counts = Object.keys(this.pillarWeights)
          .reduce((acc, pillar) => ({...acc, [pillar]: 0}), {});
        let total = 0;

        // - starting from an initial position of all pillars being equal
        // - until there are no articles left
        // - selecting the most weighty pillar after each iteration
        for (
          let selected = this.getCorrection(total, counts, this.availableArticlesByPillar);
          selected !== undefined;
          selected = this.getCorrection(total, counts, this.availableArticlesByPillar)
        ) {
          // up the count for the specific pillar
          counts[selected.pillar]++;

          // up the total count of articles so far
          total++;

          // return the first available article from the selected pillar
          yield this.availableArticlesByPillar[selected.pillar][0];
        }
      },
      *iterateByDate() {
        for (let i = 0; i <= this.feedSize; i++) {
          yield this.availableArticles[0];
        }
      },
      /**
       * Fills up the userfeed by recursively calling the article generator
       */
      topupFeed() {
        if (!this.isFetching) {
          this.fetchArticles()
            .then(() => {
              // if no articles are needed then exit
              if (this.articlesNeeded <= 0) return;

              // otherwise fetch the next article available
              const article = this.articles.next();

              // if there are no more articles left in the pool then exit
              if (article.done) return;

              // otherwise push the returned article to the userfeed
              this.userFeed.push(article.value);

              // recurse until one of the above protections kicks in i.e. no more
              // articles are needed or there are no more left to retrieve
              this.topupFeed();
            })
            .catch((err) => {
              console.log(err);
            });
        }
      },
      applyCurrentSort(a, b) {
        if (a.published_at > b.published_at) return -1;
        if (a.published_at < b.published_at) return 1;
        if (a.shopify_id > b.shopify_id) return -1;
        if (a.shopify_id < b.shopify_id) return 1;
        return 0;
      },
      applyCurrentFilter(article) {
        return (
          (this.currentFilter.type === 'all' || this.currentFilter.type === article.type) &&
          (this.currentFilter.topic === 'all' || this.currentFilter.topic === article.pillar)
        );
      },
    },
    watch: {
      feedSize() {
        this.topupFeed();
      },
      currentFilter: {
        handler(newState) {
          this.userFeed = [];
          this.articles = this.getIterator();
          this.feedSize = this.pageSize;
          this.topupFeed();
        },
        deep: true,
      },
      pillarArticles(val) {
        console.log(val);
      }
    },
    mounted() {
      // TODO: calculate nonArticleItems from this.layout
      if (this.products.length > 0) {
        this.nonArticleItems ++;
      }

      if (this.decorations.length > 0) {
        this.nonArticleItems ++;
      }

      this.articles = this.getIterator();
      this.feedSize = this.pageSize;

      this.hasIntroCard = (Object.keys(this.intro).length > 0);
    },
  }
</script>
