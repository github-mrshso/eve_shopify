import API from './api';

// TODO: Fix passing env vars through to Vue API
// TODO: Integrate SP with API

const {remURL} = contextualise('twsc');
const api = new API(remURL);

export {api};
