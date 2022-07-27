/* eslint-disable no-shadow */

import {api} from '../api';

const state = () => ({
  questions: [],
  quizId: '',
});

const getters = {
  answers(state) {
    const answers = Array.from(
      state.questions.map((question) => {
        const choice = question.choices[question.selected];

        return {
          id: question.id,
          value: (typeof choice === 'undefined') ? null : choice.value,
        };
      }),
    );

    return answers;
  },
};

const actions = {
  getQuestions({commit}) {
    return api
      .quiz()
      .then((data) => {
        commit('setQuestions', data.question_set);
        commit('setQuizId', data.id);
        return data;
      })
      .catch((err) => {
        Bugsnag.notify(err);
      });
  },

  postQuizResults({dispatch, state, getters}, payload) {
    return api
      .submitQuiz({
        ...payload,
        quiz: state.quizId,
        answers: getters.answers,
      })
      .then(() => {
        return dispatch('getProfile', null, {root: true});
      })
      .catch((err) => {
        Bugsnag.notify(err);
      });
  },
};

const mutations = {
  setQuestions(state, payload) {
    state.questions = payload;
  },
  setQuizId(state, payload) {
    state.quizId = payload;
  },
  setAnswer(state, payload) {
    state.questions[payload.step].selected = payload.value;
  },
};

const questionnaire = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
};

export default questionnaire;

/* eslint-enable no-shadow */
