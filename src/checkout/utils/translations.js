/**
 * Retrieve locale strings from window.theme.strings. These must first be
 * assigned in the head of the layout
 *
 * @param      {string}  key            The key of the string.
 * @param      {Object}  [replaces={}]  Key value pairs to replace within the
 *                                      string i.e. {foo: 'bar'} replaces
 *                                      {{ foo }} with 'bar'.
 * @return     {string}  Either the key name or the fully interpolated
 *                       translation
 */
function translate(key, replaces = {}) {
  try {
    const translation = window.theme.strings[key];
    const str = Object.keys(replaces).reduce((haystack, strName) => {
      const regex = `{{\\s*(?:${strName})\\s*}}`;
      const replace = replaces[strName];

      // eslint-disable-next-line no-param-reassign
      haystack = haystack.replace(new RegExp(regex), replace);

      return haystack;
    }, translation);

    return str;

  } catch (error) {
    if (
      !window.theme ||
      !window.theme.strings ||
      !typeof window.theme.strings === 'object' ||
      !Object.keys(window.theme.strings).length > 0) {
      Bugsnag.notify(
        'There was an error getting \'window.theme.strings\'.' +
        'It either doesn\'t exist or is empty.',
      );
    }

    Bugsnag.notify(error);

    return `JS translation missing in window.theme.strings: ${key}.`;
  }
}

export default translate;
