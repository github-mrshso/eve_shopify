import {createApp} from 'vue';
import store from '../src/store/index';
import App from '../src/app.vue';
import '../src/styles/twsc.scss';
import 'scroll-restoration-polyfill';

const app = createApp({});

app.component('v-twsc', App);
app.use(store);
app.mount('#twsc');
