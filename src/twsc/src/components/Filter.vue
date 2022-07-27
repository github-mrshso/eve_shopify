<template>
  <div class="feed-filter js-feed-filter">
    <div class="feed-filter__dropdowns">
      <form class="form form--horz form--twsc">
        <div class="form-field form-field--dropdown">
          <label class="visually-hidden">
            Order by
          </label>
          <div class="form-field__field">
            <select
              class="form-field__input"
              name="sort"
              v-model="modelValue.sort">
              <option
                v-for="(sort, key) in sorts"
                :key="key"
                :value="key">
                {{ sort }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-field form-field--dropdown">
          <label class="visually-hidden">
            Filter by sleep topic
          </label>
          <div class="form-field__field">
            <select
              class="form-field__input"
              name="filter-by-pillar"
              v-model="modelValue.topic">
              <option
                value="all"
                disabled
                selected>
                Filter by sleep topic
              </option>
              <option
                value="all">
                All
              </option>
              <option
                v-for="(pillar, key) in pillars"
                :key="key"
                :value="key">
                {{ pillar }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-field form-field--dropdown">
          <label class="visually-hidden">
            Filter by content type
          </label>
          <div class="form-field__field">
            <select
              class="form-field__input"
              name="filter-by-type"
              v-model="modelValue.type">
              <option
                value="all"
                selected>
                Filter by content type
              </option>
              <option
                v-for="(type, key) in types"
                :key="key"
                :value="key">
                {{ type }}
              </option>
            </select>
          </div>
        </div>
      </form>
    </div>
    <!--
    TODO: create spicy filtering rather than the palid bland filtering
    <div class="feed-filter__drawer">
      <button
        type="button"
        class="button button--secondary button--full-width js-toggle"
        @click="toggleDrawer"
        :disabled="drawerOpen">
        <i class="nc-icon nc-preferences-circle"></i>
        Filter
      </button>
      <div
        id="feed-filter-drawer"
        class="drawer drawer--left js-drawer"
        :class="{'is-open': drawerOpen}">
        <div class="drawer__inner">
          <div class="drawer__header">
            <div class="drawer__close">
              <button
                type="button"
                class="icon-button js-close"
                @click="toggleDrawer"
                :disabled="!drawerOpen">
                <i class="nc-icon nc-remove-16"></i>
                <span class="visually-hidden">
                  close filter
                </span>
              </button>
            </div>
          </div>
          <div class="drawer__content">
            <div class="drawer__body">
              <form class="form js-form">
                <fieldset class="feed-filter__group">
                  <legend class="feed-filter__title">
                    <i class="nc-icon nc-preferences-circle"></i>
                    {{ 'blogs.filter.pillar' | t }}
                  </legend>
                  <div class="feed-filter__items">
                    {% render 'blog-filter-item',
                      by: 'pillar',
                      as: 'list'
                    %}
                  </div>
                </fieldset>
                <fieldset class="feed-filter__group">
                  <legend class="feed-filter__title">
                    <i class="nc-icon nc-preferences-circle"></i>
                    {{ 'blogs.filter.type' | t }}
                  </legend>
                  <div class="feed-filter__items">
                    {% render 'blog-filter-item',
                      by: 'type',
                      as: 'list'
                    %}
                  </div>
                </fieldset>
                <fieldset class="feed-filter__group">
                  <legend class="feed-filter__title">
                    <i class="nc-icon nc-preferences-circle"></i>
                    {{ 'blogs.filter.series' | t }}
                  </legend>
                  <div class="feed-filter__items">
                    {% render 'blog-filter-item',
                      by: 'series',
                      as: 'list'
                    %}
                  </div>
                </fieldset>
                <button
                  type="button"
                  class="button button--secondary button--full-width js-close"
                  @click="toggleDrawer"
                  :disabled="!drawerOpen">
                  close
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    -->
  </div>
</template>

<script>
export default {
  name: 'Filter',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    feed: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      drawerOpen: false,
      sortBy: null,
      pillarFilter: null,
      typeFilter: null,
      sorts: {
        'recommended': 'Recommended for you',
        'most-recent': 'Most recent',
      }
    }
  },
  computed: {
    articles() {
      return Object.values(this.feed)
        .reduce((acc, articles) => {
          acc = acc.concat(articles);

          return acc;
        }, []);
    },
    pillars() {
      return this.articles
        .map((item) => item.pillar)
        .filter((item, i, arr) => arr.indexOf(item) === i)
        .reduce((acc, item) => ({
          ...acc,
          [item]: this.humaniseOption(item),
        }), {});
    },
    types() {
      return this.articles
        .reduce((acc, item) => [...acc, ...item.tags], [])
        .filter((item, i, arr) => arr.indexOf(item) === i)
        .filter(item => item.match(/^twsc\:type\:/))
        .map(item => item.replace('twsc:type:', ''))
        .reduce((acc, item) => ({
          ...acc,
          [item]: this.humaniseOption(item),
        }), {});
    },
  },
  methods: {
    toggleDrawer() {
      this.drawerOpen = !this.drawerOpen;
      document.body.classList.toggle('js-drawer-open', this.drawerOpen);
    },
    humaniseOption(str) {
      return (`${str.charAt(0).toUpperCase()}${str.slice(1)}`)
        .replace('-', ' ');
    },
  },
  watch: {
    value() {
      this.$emit('update:modelValue', this.modelValue);
    }
  },
};
</script>
