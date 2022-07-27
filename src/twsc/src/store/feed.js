/* eslint-disable import/no-anonymous-default-export */

import {reactive} from 'vue';
import {api} from '../api';

const _state = () => ({
  pillars: {
    'rest-better': [],
    'feel-better': [],
    'live-better': [],
    'eat-better': [],
  },
  feed: [],
});

const getters = {
  likedArticles(state) {
    return state.articles.filter((article) => article.liked);
  },
};

const actions = {
  getPillarArticles({commit}, payload) {
    const pillar = payload.pillar;
    // TODO: request articles in most recent

    return api.feed({pillar})
      .then((data) => {
        if (data.results.length) {
          commit('pushPillarArticles', {
            pillar,
            articles: data.results,
          });
        }

        return data;
      })
      .catch((err) => {
        Bugsnag.notify(err);
      });
  },
  setLiked({commit, dispatch}, payload) {
    return api
      .event({
        category: 'content',
        type: payload.value ? 'like' : 'unlike',
        payload: {
          content: payload.id,
        },
      })
      .then(() => {
        commit('setLiked', {
          pillar: payload.pillar,
          id: payload.id,
          value: payload.value,
        });

        return dispatch('getProfile', null, {root: true});
      });
  },
};

const mutations = {
  pushPillarArticles(state, payload) {
    state.pillars[payload.pillar].splice(-1, 0, ...reactive(payload.articles));
  },

  setLiked(state, payload) {
    const pillar = state.pillars[payload.pillar];
    const index = pillar
      .findIndex((article) => article.shopify_id === payload.id);
    const article = pillar[index];

    article.profile.liked = payload.value;
  },
};

export default {
  namespaced: true,
  state: _state,
  getters,
  actions,
  mutations,
};
