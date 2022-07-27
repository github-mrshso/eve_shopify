/**
 * Example dependency import:
 *
 * import Flickity from 'flickity';
 * 
 * window.Flickity = Flickity;
**/

/* Axios [https://github.com/axios/axios] */
import Axios from 'axios';

/* Flickity [https://flickity.metafizzy.co/]  */
import Flickity from 'flickity';

/* Handlebars [https://handlebarsjs.com/] */
import Handlebars from 'handlebars';

/* object-hash [https://www.npmjs.com/package/object-hash] */
import hash from 'object-hash';

/* ClipboardJS [https://clipboardjs.com/] */
import ClipboardJS from 'clipboard';

/* easytimer.js [https://www.npmjs.com/package/easytimer.js] */
import {Timer} from 'easytimer.js';

/* Assign dependencies to the window object */
window.axios = Axios;
window.flickity = Flickity;
window.handlebars = Handlebars;
window.hash = hash;
window.clipboardjs = ClipboardJS;
window.easytimer = Timer;

import "./vendor.scss";