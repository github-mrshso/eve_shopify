/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/tm-shopify-tools.scss":
/*!***********************************!*\
  !*** ./src/tm-shopify-tools.scss ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + \"/tm-shopify-tools.css\");\n\n//# sourceURL=webpack://tm-shopify-tools/./src/tm-shopify-tools.scss?");

/***/ }),

/***/ "./src/tm-shopify-tools.js":
/*!*********************************!*\
  !*** ./src/tm-shopify-tools.js ***!
  \*********************************/
/***/ (() => {

eval("window.onload = function () {\n\n    // Toggle Shopify's native preview bar\n    let previewBarVisibility = \"hidden\";\n    const previewBar = document.getElementById(\"preview-bar-iframe\");\n    previewBar && (previewBar.style.display = \"none\"),\n        document.getElementById(\"admin-bar-toggle\").addEventListener(\"click\", function () {\n            previewBarVisibility == \"hidden\"\n                ? ((previewBarVisibility = \"visible\"), (document.getElementById(\"preview-bar-iframe\").style.display = \"block\"))\n                : ((previewBarVisibility = \"hidden\"), (document.getElementById(\"preview-bar-iframe\").style.display = \"none\"));\n        });\n\n    // Uupdate Copy and Go buttons on theme selection\n    const   urlSelector = document.querySelector(\"[data-url-selector]\"),\n            urlGo = document.querySelector(\"[data-url-go]\"),\n            urlCopy = document.querySelector(\"[data-url-copy]\"),\n            currentUrl = urlGo.href;\n\n    urlCopy.addEventListener('click', navigator.clipboard.writeText(currentUrl));\n\n    urlSelector.addEventListener(\"change\", function () {\n        let selectedValue = urlSelector.options[urlSelector.selectedIndex].value;\n        if (selectedValue == 'current') {\n            urlGo.classList.add('tmst__button--disabled');\n            urlGo.href = '';\n        } else {\n            urlGo.classList.remove('tmst__button--disabled');\n            urlGo.href = selectedValue;\n            urlCopy.removeAttribute('onclick');\n            urlCopy.addEventListener('click', navigator.clipboard.writeText(selectedValue));\n        }\n    });\n};\n\n\n//# sourceURL=webpack://tm-shopify-tools/./src/tm-shopify-tools.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	__webpack_modules__["./src/tm-shopify-tools.js"](0, {}, __webpack_require__);
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/tm-shopify-tools.scss"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;