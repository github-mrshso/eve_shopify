<template>
  <article
    class="card"
    :class="[formatClass, typeClass]"
    :id="`article-${data.shopify_id}`"
    :data-id="data.shopify_id">
    <div class="card__img">
      <Image
        :id="data.shopify_id"
        :alt="data.image.alt"
        :sizes="format"
        loading="lazy"
      />
    </div>
    <div class="card__body">
      <div class="card__label">
        <header class="card__header">
          <span class="card__icon">
            <i class="nc-icon" :class="[iconClass]"></i>
          </span>
          <h1 class="card__title" v-html="title"></h1>
        </header>
        <div class="card__meta">
          <time
            class="card__datetime"
            :datetime="data.updated_at"
            pubdate>
            {{ updatedAtHuman }}
          </time>
          <address class="card__author">
            by {{ data.author }}
          </address>
          <div class="card__tags">
            <span class="badge">
              {{ data.pillar }}
            </span>
          </div>
        </div>
        <div class="card__menu">
          <span class="card__menu-toggle">
            <button
              type="button"
              class="icon-btn icon-btn--medium"
              @click="menuVisible = !menuVisible">
              <i class="nc-icon nc-ellipsis-vert-24"></i>
              <span class="visually-hidden">toggle menu</span>
            </button>
          </span>
          <div
            v-show="menuVisible"
            ref="card-menu-items"
            class="card__menu-items">
            <!--
              TODO: transition article menu
            -->
            <ul>
              <li>
                <button
                  type="button"
                  class="card__menu-btn"
                  :class="{'is-loading': likeStatusLoading}"
                  @click="toggleLiked"
                  :disabled="likeStatusLoading">
                  <span
                    v-if="likeStatusLoading"
                    class="loader loader--dark">
                    <span class="loader__ring"></span>
                    <span class="loader__circle"></span>
                  </span>
                  <template v-if="data.profile.liked">
                    <i v-if="!likeStatusLoading"
                      class="nc-icon nc-heart-alt"></i>fewer like this
                  </template>
                  <template v-else>
                    <i v-if="!likeStatusLoading"
                      class="nc-icon nc-heart"></i>more like this
                  </template>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="card__menu-btn"
                  :class="{'is-active': shareStatusSharing}"
                  @click="share">
                  <!-- TODO: transition article menu button states -->
                  <template v-if="shareStatusSharing">
                    <i class="nc-icon nc-check-sm"></i>link copied
                  </template>
                  <template v-else>
                    <i class="nc-icon nc-share-24"></i>share article
                  </template>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <a class="card__target" :href="url">&nbsp;</a>
  </article>
</template>

<script>
  import {onClickOutside} from '@vueuse/core';
  import {mapActions} from 'vuex'
  import Image from './Image.vue'
  import markdown from '../../utils/markdown';

  // TODO: import mutation for changing liked status of articles

  export default {
    name: 'Article',
    components: {
      Image,
    },
    props: {
      data: {
        type: Object,
        required: true,
      },
      format: {
        type: Array,
        default: [],
      }
    },
    data() {
      return {
        likeStatusLoading: false,
        menuVisible: false,
        iconMap: {
          video: 'play-24',
          resource: 'box-24',
          tool: 'tick-circle-24',
          default: 'page-24',
        },
        shareStatusSharing: false,
      }
    },
    computed: {
      title() {
        return markdown(this.data.title, false);
      },
      formatClass() {
        return this.format
          .map((cols, i) => `card--format-${i + 1}-${cols}`)
          .join(' ');
      },
      typeClass() {
        return `card--${this.data.type}`;
      },
      iconClass() {
        const base = 'nc-';
        const icon = this.data.type in this.iconMap
          ? this.iconMap[this.data.type]
          : this.iconMap.default;
        return `${base}${icon}`;
      },
      url() {
        // TODO: create article URLS on the back end
        return `https://${window.location.host}/blogs/the-well-slept-club/${this.data.handle}`
      },
      updatedAtHuman() {
        let date = new Date(this.data.updated_at);

        return date.toLocaleDateString('en-GB', {
          weekday: 'short',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      },
    },
    methods: {
      ...mapActions('feed', ['setLiked']),
      toggleLiked() {
        if (this.likeStatusLoading) return;
        this.likeStatusLoading = true;

        this.setLiked({
          id: this.data.shopify_id,
          pillar: this.data.pillar,
          value: !this.data.profile.liked,
        }).then(() => (this.likeStatusLoading = false));
      },
      setLocalStorageArticles() {
        let localList = JSON.stringify(this.likedArticles);
        localStorage.setItem('likedArticles', localList);
      },
      share() {
        if (this.shareStatusSharing) return;

        this.shareStatusSharing = true;

        navigator.clipboard.writeText(this.url)
          .then(() => {
            setTimeout(() => {
              this.shareStatusSharing = false;
            }, 5000);
          })
          .catch((err) => {
            logger.error(err);
          });
      },
      handleClickedOutside(e) {
        if (!this.menuVisible) {
          return;
        }

        this.menuVisible = false;
      },
    },
    mounted() {
      onClickOutside(this.$refs['card-menu-items'], this.handleClickedOutside);
    }
  }
</script>
