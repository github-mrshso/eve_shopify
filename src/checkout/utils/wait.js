/**
 * Observes any changes within el and asserts the presence of the subject. If
 * the subject appears then cb will be called. If the subject does not appear
 * before the timeout threshold then timeoutCB will be called and if the subject
 * then later appears a further callback will be called passing in the elapsed
 * time.
 *
 * @param      {Node}      el                The root element to watch
 * @param      {string}    subjectSel        The selector for the subject to
 *                                           watch for
 * @param      {Function}  cb                Callback for when the subject has
 *                                           appeared inside the root element
 * @param      {Function}  timeoutCB         Callback for if the timeout
 *                                           threshold is reached
 * @param      {Function}  timeoutWarningCB  The timeout warning cb
 * @param      {number}    timeoutThreshold  The timeout threshold
 */
function waitForLoaded(
  el, subjectSel, cb, timeoutCB, timeoutWarningCB, timeoutThreshold,
) {
  const startTime = Date.now();
  let hasTimedOut = false;
  let subject = document.querySelector(subjectSel);

  if (subject) {
    cb();
  } else {
    const timeout = setTimeout(() => {
      timeoutCB(timeoutThreshold / 1000);
      hasTimedOut = true;
    }, timeoutThreshold);

    const observer = new MutationObserver(() => {
      subject = document.querySelector(subjectSel);

      if (!subject) {
        return null;
      }

      if (hasTimedOut) {
        const endTime = Date.now();
        const elapsedTime = (endTime - startTime);

        if (elapsedTime >= timeoutThreshold) {
          timeoutWarningCB(elapsedTime / 1000);
        }
      }

      observer.disconnect();
      clearTimeout(timeout);
      cb();

      return null;
    });

    observer.observe(el, {
      childList: true,
      subtree: true,
    });
  }
}

export default waitForLoaded;
