 /**
 * Runs a function whenever the selector provided is present on a page
 * @param  {} sel - The selector
 * @param  {} callback - The function you want to run when the selector is found
 */

(() => {
  let ready = false;
  let cache = {};

  window.when = function (sel, callback) {
    if (ready && $(sel).length) {
      callback();
      return;
    }

    // eslint-disable-next-line no-multi-assign
    const queue = cache[sel] = cache[sel] || [];
    queue.push(callback);
  };

  document.addEventListener('DOMContentLoaded', () => {
    ready = true;

    if (typeof cache === 'undefined' || cache === null) {
      return false;
    }

    Object.keys(cache).forEach((sel) => {
      const els = document.querySelectorAll(sel);
      const callbacks = cache[sel];

      if (els.length > 0) {
        callbacks.forEach((callback) => {
          callback();
        });
      }
    });

    cache = null;

    return true;
  });
})();
