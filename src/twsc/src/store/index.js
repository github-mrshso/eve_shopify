import {createStore} from 'vuex';
import {api} from '../api';
import questionnaire from './questionnaire';
import feed from './feed';

export default createStore({
  // This is where the namespace of the store is set
  modules: {
    questionnaire,
    feed,
  },
  state: {
    context: 'initialising',
    uuid: '',
    pillars: {
      'eat-better': 25,
      'feel-better': 25,
      'live-better': 25,
      'rest-better': 25,
    },
    errorConfig: {
      errorMessage: '',
      buttonText: '',
      errorAction: '',
    },
    hasQuiz: '',
    imgBase: '',
    cacheBuster: 2,
    urls: {
      blog: '',
      feed: '',
    },
  },
  actions: {
    getProfile({commit}) {
      return api
        .profile()
        .then((data) => {
          commit('setHasQuiz', data.has_quiz);
          commit('setPillars', data.pillars);

          return data;
        })
        .catch((err) => {
          Bugsnag.notify(err);
        });
    },
    switchContext({commit}, payload) {
      window.scrollTo(0, 0);
      commit('setContext', payload);
    },
  },
  mutations: {
    setUUID(state, payload) {
      api.snowplowID = payload;

      state.uuid = payload;
    },

    setHasQuiz(state, payload) {
      state.hasQuiz = Boolean(payload);
    },

    setPillars(state, payload) {
      state.pillars = payload;
    },

    setError(state, payload) {
      state.errorConfig = payload;
    },

    setContext(state, payload) {
      state.context = payload;
    },

    setImgBase(state, payload) {
      state.imgBase = payload;
    },
  },
});
