/**
 * Shortcut function to add an event listener.
 * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com.
 * @param {String} event -The event type.
 * @param {Node} element - The element to attach the event to.
 * @param {Function} callback - The callback to run on the event.
 * @param {Boolean} capture - If true, forces bubbling on non-bubbling events.
 */
export function on(event, element = window, callback, capture = false) {

  /**
   * If only a string is passed into the element parameter.
   */
  if (typeof elem === 'string') {
    document.querySelector(element).addEventListener(event, callback, capture);
    return;
  }

  /**
   * If an element is not defined in parameters, then shift callback across.
   */
  if (typeof element === 'function') {
    window.addEventListener(event, element);
    return;
  }

  /**
   * Default listener.
   */
  element.addEventListener(event, callback, capture);
}
