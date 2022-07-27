function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', 'false');

  if (summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  if (elementToFocus == undefined) elementToFocus = container;
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch (e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if (navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) {
      this.input.dispatchEvent(this.changeEvent);
    } else if (event.target.name === 'plus') {
      // If the previous value is the same as current value, this indicates that we've hit the max limit 
      // for this variant. In this case, we send a maximum quantity error message
      const section = this.closest('section');
      if (!section) return;
      const productForm = section.querySelector('product-form');
      if (productForm) {
        productForm.handleErrorMessage(window.theme.strings.inventoryLimit);
        window.setTimeout(function () {
          productForm.handleErrorMessage();
        }, 5000)
      }
    }
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function postConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

function getConfig(type = 'json') {
  return {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

function getSectionInnerHTML(html, selector) {
  return new DOMParser()
    .parseFromString(html, "text/html")
    .querySelector(selector).innerHTML;
}

function renderSectionsAndData(sections, data) {
  sections.forEach((section => {
    document.getElementById(section.id).innerHTML =
      getSectionInnerHTML(data.sections[section.id], section.selector);
  }));
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on' + eventName, callback);
};

Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for (var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (country_domid, province_domid, options) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler, this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function (e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    var raw = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  getMainDetailsToggle() {
    return this.mainDetailsToggle;
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() !== 'ESCAPE') return;
    const openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;
    if (openDetailsElement === this.mainDetailsToggle) {
      console.log(1);
      this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary'))
    } else {
      this.closeSubmenu(openDetailsElement);
    }
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    if (elementToFocus.classList.contains('header__icon')) {
      elementToFocus.setAttribute('aria-expanded', false);
    }

    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus(detailsElement.querySelector('summary'));
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();

    this.onOverlayClose = this.handleOverlayClose.bind(this);
    document.body.addEventListener('closeDrawers', this.onOverlayClose);
  }

  handleOverlayClose(e) {
    super.closeMenuDrawer(e, super.getMainDetailsToggle().querySelector('summary'))
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.getElementById('shopify-section-header');
    this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
    this.header.classList.add('menu-open');

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus) {
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
  }
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target.nodeName === 'MODAL-DIALOG') this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[id^="Slider-"]');
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.enableSliderLooping = false;
    this.currentPageElement = this.querySelector('.slider-counter--current');
    this.pageTotalElement = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    this.initPages();
    const resizeObserver = new ResizeObserver(entries => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }

  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
    if (this.sliderItemsToShow.length < 2) return;
    this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft;
    this.slidesPerPage = Math.floor((this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) / this.sliderItemOffset);
    this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1;
    this.update();
  }

  resetPages() {
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.initPages();
  }

  update() {
    const previousPage = this.currentPage;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;

    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage;
      this.pageTotalElement.textContent = this.totalPages;
    }

    if (this.currentPage != previousPage) {
      this.dispatchEvent(new CustomEvent('slideChanged', {
        detail: {
          currentPage: this.currentPage,
          currentElement: this.sliderItemsToShow[this.currentPage - 1]
        }
      }));
    }

    if (this.enableSliderLooping) return;

    if (this.isSlideVisible(this.sliderItemsToShow[0]) && this.slider.scrollLeft === 0) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
    return (element.offsetLeft + element.clientWidth) <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
  }

  onButtonClick(event) {
    event.preventDefault();
    const step = event.currentTarget.dataset.step || 1;
    this.slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + (step * this.sliderItemOffset) : this.slider.scrollLeft - (step * this.sliderItemOffset);
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }
}

customElements.define('slider-component', SliderComponent);

class SlideshowComponent extends SliderComponent {
  constructor() {
    super();
    this.sliderControlWrapper = this.querySelector('.slider-buttons');
    this.enableSliderLooping = true;

    if (!this.sliderControlWrapper) return;

    this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide');
    if (this.sliderItemsToShow.length > 0) this.currentPage = 1;

    this.sliderControlLinksArray = Array.from(this.sliderControlWrapper.querySelectorAll('.slider-counter__link'));
    this.sliderControlLinksArray.forEach(link => link.addEventListener('click', this.linkToSlide.bind(this)));
    this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this));
    this.setSlideVisibility();

    if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
  }

  setAutoPlay() {
    this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay');
    this.autoplaySpeed = this.slider.dataset.speed * 1000;

    this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this));
    this.addEventListener('mouseover', this.focusInHandling.bind(this));
    this.addEventListener('mouseleave', this.focusOutHandling.bind(this));
    this.addEventListener('focusin', this.focusInHandling.bind(this));
    this.addEventListener('focusout', this.focusOutHandling.bind(this));

    this.play();
    this.autoplayButtonIsSetToPlay = true;
  }

  onButtonClick(event) {
    super.onButtonClick(event);
    const isFirstSlide = this.currentPage === 1;
    const isLastSlide = this.currentPage === this.sliderItemsToShow.length;

    if (!isFirstSlide && !isLastSlide) return;

    if (isFirstSlide && event.currentTarget.name === 'previous') {
      this.slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length;
    } else if (isLastSlide && event.currentTarget.name === 'next') {
      this.slideScrollPosition = 0;
    }
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }

  update() {
    super.update();
    this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
    this.prevButton.removeAttribute('disabled');

    if (!this.sliderControlButtons.length) return;

    this.sliderControlButtons.forEach(link => {
      link.classList.remove('slider-counter__link--active');
      link.removeAttribute('aria-current');
    });
    this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active');
    this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', true);
  }

  autoPlayToggle() {
    this.togglePlayButtonState(this.autoplayButtonIsSetToPlay);
    this.autoplayButtonIsSetToPlay ? this.pause() : this.play();
    this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay;
  }

  focusOutHandling(event) {
    const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
    if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return;
    this.play();
  }

  focusInHandling(event) {
    const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
    if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
      this.play();
    } else if (this.autoplayButtonIsSetToPlay) {
      this.pause();
    }
  }

  play() {
    this.slider.setAttribute('aria-live', 'off');
    clearInterval(this.autoplay);
    this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed);
  }

  pause() {
    this.slider.setAttribute('aria-live', 'polite');
    clearInterval(this.autoplay);
  }

  togglePlayButtonState(pauseAutoplay) {
    if (pauseAutoplay) {
      this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.playSlideshow);
    } else {
      this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.pauseSlideshow);
    }
  }

  autoRotateSlides() {
    const slideScrollPosition = this.currentPage === this.sliderItems.length ? 0 : this.slider.scrollLeft + this.slider.querySelector('.slideshow__slide').clientWidth;
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }

  setSlideVisibility() {
    this.sliderItemsToShow.forEach((item, index) => {
      const button = item.querySelector('a');
      if (index === this.currentPage - 1) {
        if (button) button.removeAttribute('tabindex');
        item.setAttribute('aria-hidden', 'false');
        item.removeAttribute('tabindex');
      } else {
        if (button) button.setAttribute('tabindex', '-1');
        item.setAttribute('aria-hidden', 'true');
        item.setAttribute('tabindex', '-1');
      }
    });
  }

  linkToSlide(event) {
    event.preventDefault();
    const slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * (this.sliderControlLinksArray.indexOf(event.currentTarget) + 1 - this.currentPage);
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }
}

customElements.define('slideshow-component', SlideshowComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
    this.setUnavailableSizes();
    this.updateOptions();
    this.updateMasterId();
    this.toggleVariantImages();
    this.updateSalesBadge();
    this.updateEcoTax();
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.removeErrorMessage();
    this.setUnavailableSizes();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.toggleVariantImages();
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
      this.updateEcoTax();
      this.updateSalesBadge();
      this.updateMaxValue();
    }
  }

  toggleVariantImages() {
    const mediaGallery = document.getElementById(`MediaGallery-${this.dataset.section}`);
    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section}`);
    this.colour = this.currentVariant[contextualise('variantColourOptionNo')];
    this.colourHandle = contextualise('variantColourOptionsHandleized')[this.colour];
    this.imagesWithColour = document.querySelectorAll(`[data-variant-image-colour="${this.colourHandle}"]`);
    if (this.imagesWithColour.length > 0 && this.currentVariant.featured_media) {
      mediaGallery.setAttribute('data-variant-colour', this.colourHandle);
      modalContent.setAttribute('data-variant-colour', this.colourHandle);
    } else {
      /* If no featured media is set, then the `data-variant-colour` attributes are removed,
      ensuring that all images are shown. To avoid this, ensure all variants have a featured
      image set in the Product admin. */
      mediaGallery.removeAttribute('data-variant-colour');
      modalContent.removeAttribute('data-variant-colour');
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  setUnavailableSizes() {
    this.colour_string = contextualise('variantColourOptionString');
    this.size_string = contextualise('variantSizeOptionString');

    // Go through each colour option and find the active (checked) one
    const selected_colour = Array.from(this.querySelectorAll(`input[name="${this.colour_string}"]`)).find(colour => colour.checked)

    // Go through each size option
    Array.from(this.querySelectorAll('input[name="Size"]')).forEach(size => {
      // Disable each size option that isn't available in the selected colour
      if (size.dataset.availableColours.split("||").includes(selected_colour.value)) {
        size.disabled = false
      } else {
        size.disabled = true

        // When a unavailable option is selected, switch to an available one
        if (size.checked) Array.from(this.querySelectorAll(`input[name="${this.size_string}"]`)).find(size => !size.disabled).click()
      }
    })
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGallery = document.getElementById(`MediaGallery-${this.dataset.section}`);
    mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true);

    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    const newMediaModal = modalContent.querySelector(`[data-media-id="${this.currentVariant.featured_media.id}"]`);
    modalContent.prepend(newMediaModal);
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const id = `price-${this.dataset.section}`;
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(id);
        const source = html.getElementById(id);

        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');

    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }

  updateEcoTax() {
    const data = contextualise('variantMetafields')[this.currentVariant['id']];
    let labels = document.querySelectorAll('.eco-tax__label');
    let values = document.querySelectorAll('.eco-tax__value');

    // Clear both elements
    labels.forEach((e) => {
      e.style.display = "initial";
      e.textContent = '';
    });
    values.forEach((e) => {
      e.style.display = "initial";
      e.textContent = '';
    });

    let validEcoTaxValue;
    if ((data.ecoTaxRate !== '') && (data.ecoTaxRate !== undefined) && (data.ecoTaxRate !== '0.0')) {
      validEcoTaxValue = true
    } else {
      validEcoTaxValue = false;
    }

    // Add data
    if (data.ecoTaxEnable == true && data.ecoTaxRate > 0 && (validEcoTaxValue)) {
      let ecoTaxAmount = Number(data.ecoTaxRate);


      ecoTaxAmount = ecoTaxAmount.toLocaleString("en", {
        useGrouping: false,
        minimumFractionDigits: 2,
      });

      labels.forEach((e) => {
        e.textContent = window.variantStrings.includeEcoTax;
      });
      values.forEach((e) => {
        e.textContent = ecoTaxAmount + ' €';
      });
    }
  }

  updateSalesBadge() {
    const saleBadge = document.querySelector('[js-variant-sale-percent]'),
      salePrice = this.currentVariant.price,
      price = this.currentVariant.compare_at_price;

    if (!saleBadge || !price || !salePrice) {
      return;
    }

    const salePercent = 100 - (salePrice / price * 100);
    saleBadge.innerHTML = window.theme.strings.on_sale_percentage.replace(
      '{{ discount }}', Math.round(salePercent),
    );
    saleBadge.style.display = 'block';
  }

  updateMaxValue() {
    const inventoryQty = contextualise('variantInventoryQuantities')[this.currentVariant['id']]['inventory_quantity'];
    const quantityInput = document.querySelector(`#Quantity-${this.dataset.section}`);

    if (inventoryQty && quantityInput) {
      quantityInput.setAttribute("max", parseInt(inventoryQty));

      if (quantityInput.value > inventoryQty) {
        quantityInput.value = parseInt(inventoryQty);
      }
    } else if (inventoryQty == 0) {
      // If product is OOS, default to 1. This ensures that, when the user selects a new variant, there's always at quantity of >=1
      quantityInput.value = 1;
      quantityInput.setAttribute("max", 1);
    } else if (quantityInput) {
      quantityInput.removeAttribute("max");
    }
  }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);

class CloseableBanner extends HTMLElement {
  constructor() {
    super();
    this.closeButton = this.querySelector('button[name="close-banner"]');
    this.id = this.querySelector('[id^="CloseableBanner-"]').id;

    this.closeButton.addEventListener(
      'click',
      this.close.bind(this)
    );
  }

  close() {
    this.style.display = 'none';
    sessionStorage.setItem(this.id, 'hidden');
    this.querySelectorAll('[aria-hidden="false"]').forEach((element) => {
      element.setAttribute('aria-hidden', 'true');
    });
    this.querySelectorAll('[focusable="true"]').forEach((element) => {
      element.setAttribute('focusable', 'false');
    });
  }
}

customElements.define('closeable-banner', CloseableBanner);


// Helper functions, taken from eve's legacy codebase

// Global.js is deferred, but should still loaded before any component/section-specific
// JavaScript files, meaning the below functions should be accessible as long as these
// scripts are also deferred.

window.getCSSFlag = function (el) {
  return window.getComputedStyle(el, ':before').getPropertyValue('content').replace(/"/g, '');
}

window.isEmpty = function (obj) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}

window.addClassWhenVisible = function (el, className) {
  const opts = {
    threshold: 1.0,
    root: null,
  };
  const hasIntersectionObserver = (
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype
  );

  if (hasIntersectionObserver) {
    const observer = new IntersectionObserver((entries) => {
      const toggle = (entries[0].intersectionRatio >= 1);

      if (toggle) {
        el.classList.add(className);
      }
    }, opts);

    observer.observe(el);
  }
}

window.debounce = function (fn, time) {
  let timeout;
  return function () {
    const functionCall = () => fn.apply(this, arguments);
    clearTimeout(timeout);
    timeout = setTimeout(functionCall, time);
  };
}

window.responsiveState = function (el) {
  const target = el || document.querySelector('body');
  const state = window.getComputedStyle(target, ':before')
    .getPropertyValue('content').replace(/"/g, '');
  return state;
}

window.isSticky = function (el, stickyPositionOverride) {
  const styles = window.getComputedStyle(el);
  const hasStickyStyles = (styles.position.match('sticky') !== null);
  const stickyPosition = stickyPositionOverride ||
    parseInt(styles.top.replace('px', ''), 10);
  const proxy = document.createElement('div');

  if (!hasStickyStyles) {
    window.bugsnag.notify(
      'Not a sticky element! Must be \'position: sticky;\'',
    );
    return el;
  }

  if (
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype
  ) {
    if (stickyPosition > 0) {
      el.style.top = `${stickyPosition}px`;
      proxy.style.cssText =
        `position: absolute;
        top: -${stickyPosition + 1}px;
        left: 0;
        height: 1px;
        width: 1px;
        visibility: hidden;
        background-color: red;`;

      el.appendChild(proxy);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const isStuck = (entry.intersectionRatio < 1);
        const event = new CustomEvent('sticky', {
          detail: { entry, isStuck },
        });
        el.dispatchEvent(event);
      });
    }, {
      threshold: [1],
      root: null,
    });
    observer.observe(proxy);
  } else {
    window.bugsnag.notify('Browser does not support IntersectionObserver');
  }
  return el;
}

/**
 * Creates a document fragment from an html string.
 * https://love2dev.com/blog/inserting-html-using-createdocumentfragment
 * -instead-of-using-jquery/
 *
 * @param      {string}  html    The html string
 * @return     {Node}    A document fragment from the html string
 */
window.createFragmentFromHTML = function (html) {
  const frag = document.createDocumentFragment();
  const temp = document.createElement('div');
  temp.innerHTML = html.trim();
  while (temp.firstChild) {
    frag.appendChild(temp.firstChild);
  }
  return frag;
}

// Ometria
// This function is fired on cart change, updating Ometria on the contents of the cart
// console.log('To-do: hook up setOmetriaBasket function to ajax cart updates');

window.setOmetriaBasket = function (cart) {
  const basket = new ometria.Basket();
  const region = window.theme.settings.region;
  const origin = window.location.origin;
  const urlItems = cart.items
    .map((item) => `${item.variant_id}:${item.quantity}`)
    .join(',');
  const url = `${origin}/cart/${urlItems}`;

  basket.setUrl(url);
  basket.setTotal((cart.total_price / 100), cart.currency);

  cart.items.forEach((item) => {
    const pid = `${region}:${item.product_id}`;
    const vid = null;
    const quantity = item.quantity;
    const total = ((item.price / 100) * quantity);

    basket.addLineItem(pid, quantity, total, vid);
  });

  ometria.setBasket(basket);
};

window.translate = function (key, replaces = {}) {
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

window.markdown = function (str, el = 'p') {
  return str
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^(?![-><])(.*)$/gim, (el ? `<${el}>$1</${el}>` : '$1'))
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*([^*]*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*([^*]*)\*/gi, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    .replace(/^-\s+(.*$)/gmi, '<li>$1</li>')
    .replace(/^(<li>(.|\n)*<\/li>)/gim, '<ul>$1</ul>')
    .replace(/\n$/gim, '<br />')
    .trim();
}

// Snowplow
window.SP = function () {
  const ns = 'iglu:uk.co.evesleep';
  const schemas = {
    shareArticle: {
      name: 'twsc_share_article',
      version: '1-0-0',
      members: ['handle', 'journey', 'phase', 'pillar', 'type'],
    },
    likeArticle: {
      name: 'twsc_like_article',
      version: '2-0-0',
      members: ['handle', 'journey', 'phase', 'pillar', 'type', 'like'],
    },
    readArticle: {
      name: 'twsc_read_article',
      version: '1-0-0',
      members: ['handle', 'journey', 'phase', 'pillar', 'type'],
    },
    quizStep: {
      name: 'twsc_quiz',
      version: '1-0-2',
      members: [
        'isEntry',
        'isFinal',
        'questionID',
        'question',
        'answerID',
        'answer',
        'answerPillars',
      ],
    },
  };
  const maxTimeout = 4000;
  let uuid = '';

  function _prunePayload(payload, members) {
    return members.reduce((acc, member) => {
      acc[member] = payload[member];
      return acc;
    }, {});
  }

  function _formatPayload(payload) {
    return {
      ...payload,
      journey: isNaN(Number(payload.journey))
        ? payload.journey
        : Number(payload.journey),
    };
  }

  function _post(schemaKey, payload) {
    const { name, version, members } = schemas[schemaKey] || {};
    let data = payload;

    if (uuid.length === 0) {
      return false;
    }

    if (typeof schemas[schemaKey] === 'undefined') {
      Bugsnag.notify(`Unknown snowplow schema key: ${schemaKey}`);
      return false;
    }

    data = _prunePayload(data, members);
    data = _formatPayload(data);

    return snowplow('trackSelfDescribingEvent', {
      schema: `${ns}/${name}/jsonschema/${version}`,
      data,
    });
  }

  function shareArticle(payload) {
    return _post('shareArticle', payload);
  }

  function likeArticle(payload) {
    return _post('likeArticle', {
      ...payload,
      like: true,
    });
  }

  function unlikeArticle(payload) {
    return _post('likeArticle', {
      ...payload,
      like: false,
    });
  }

  function readArticle(payload) {
    return _post('readArticle', payload);
  }

  function quizStep(payload) {
    return _post('quizStep', payload);
  }

  function readCookie() {
    // https://bit.ly/3ldqlv1
    const cookieName = '_sp_';
    const matcher = new RegExp(`${cookieName}id\\.[a-f0-9]+=([^;]+);?`);
    const match = document.cookie.match(matcher);

    if (match && match[1]) {
      return match[1].split('.')[0];
    } else {
      return false;
    }
  }

  function pollUUID() {
    return new Promise((resolve, reject) => {
      let intervalTimer = null;
      const timeoutTimer = setTimeout(() => {
        clearInterval(intervalTimer);
        reject(
          new Error(`Snowplow cookie not available after ${maxTimeout}ms`),
        );
      }, maxTimeout);

      intervalTimer = setInterval(() => {
        uuid = readCookie();

        if (uuid) {
          resolve(uuid);
          clearInterval(intervalTimer);
          clearTimeout(timeoutTimer);
        }
      }, 100);

      if (uuid) {
        resolve(uuid);
        clearInterval(intervalTimer);
        clearTimeout(timeoutTimer);
      }
    });
  }

  async function getUUID() {
    try {
      uuid = await pollUUID();
      return uuid;
    } catch (err) {
      throw new Error(err);
    }
  }

  return Object.freeze({
    get hasSnowplow() {
      return (uuid.length === 0);
    },
    getUUID,
    shareArticle,
    likeArticle,
    unlikeArticle,
    readArticle,
    quizStep,
  });
};

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

function isListed(list = []) {
  const path = window.location.pathname;
  // eslint-disable-next-line compat/compat
  const params = new URLSearchParams(window.location.search);
  const matches = list.filter((needle) => {
    if (needle.includes('=')) {
      const [key, value] = needle.split('=');

      return (params.get(key) === value);
    }

    return path.includes(needle);
  });

  return (matches.length > 0);
}

// https://blog.k.io/atech/creating-a-simple-custom-event-system-in-javascript

class EventBusEvent {
  constructor(eventName) {
    this.eventName = eventName;
    this.callbacks = [];
  }

  registerCallback(callback) {
    this.callbacks.push(callback);
  }

  unregisterCallback(callback) {
    const index = this.callbacks.indexOf(callback);

    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  fire(data) {
    const callbacks = this.callbacks.slice(0);

    callbacks.forEach((callback) => {
      callback(data);
    });
  }
}

class EventBus {
  constructor() {
    this.events = {};
  }

  trigger(eventName, data) {
    const event = this.events[eventName];

    if (event) {
      event.fire(data);
    }
  }

  on(eventName, callback) {
    let event = this.events[eventName];

    if (!event) {
      event = new EventBusEvent(eventName);
      this.events[eventName] = event;
    }

    event.registerCallback(callback);
  }

  off(eventName, callback) {
    const event = this.events[eventName];

    if (event && event.callbacks.indexOf(callback) > -1) {
      event.unregisterCallback(callback);

      if (event.callbacks.length === 0) {
        delete this.events[eventName];
      }
    }
  }
}

function getCookie(name) {
  const value = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);

  return value ? value[2] : null;
}

function setCookie(name, value, hours) {
  const path = '/';
  const date = new Date();

  date.setTime(date.getTime() + (hours * 60 * 60 * 1000));

  document.cookie =
    `${name}=${value};path=${path};expires=${date.toGMTString()}`;
}

function deleteCookie(name) {
  setCookie(name, '', -1);
}

function markdown(str, el = 'p') {
  return str
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^(?![-><])(.*)$/gim, (el ? `<${el}>$1</${el}>` : '$1'))
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*([^*]*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*([^*]*)\*/gi, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    .replace(/^-\s+(.*$)/gmi, '<li>$1</li>')
    .replace(/^(<li>(.|\n)*<\/li>)/gim, '<ul>$1</ul>')
    .replace(/\n$/gim, '<br />')
    .trim();
}

class OmetriaSignUp {
  constructor(config, baseCTX) {
    const el = config.el && config.el instanceof Element
      ? config.el
      : document.querySelector(config.el);
    const formUID = config.formUID;
    const src = document.querySelector('#ometria-form-tpl');
    const ns = `ometria-form-${config.formUID}`;
    const ctx = {
      ...baseCTX,
      ns,
      successCopy: baseCTX.successCopy ||
        window.translate('newsletter_confirmation_html'),
      successCopyMH: baseCTX.successCopyMH ||
        window.translate('newsletter_confirmation_mobile_heading_html'),
      successCopyMC: baseCTX.successCopyMC ||
        window.translate('newsletter_confirmation_mobile_copy_html'),
      errorCopy: baseCTX.errorCopy ||
        window.translate('newsletter_error_html'),
      invalidCopy: baseCTX.invalidCopy ||
        window.translate('newsletter_invalid_html'),
      submitCopy: baseCTX.submitCopy ||
        window.translate('newsletter_submit_html'),
      requiredCopy: window.translate('newsletter_required_html'),
    };
    const test = [
      'ometriaBucket',
      'successCopy',
      'successCopyMH',
      'successCopyMC',
      'errorCopy',
      'invalidCopy',
      'submitCopy',
    ];
    let missingCtx = [];

    // TODO: create validation class for components

    if (!el) {
      throw new Error(`OmetriaSignUp has no el, '${config.el}'`);
    }

    if (!formUID) {
      throw new Error(`OmetriaSignUp has no formUID, '${config.formUID}'`);
    }

    if (!src) {
      throw new Error(`OmetriaSignUp has no tpl, '${config.tpl}'`);
    }

    if (!baseCTX) {
      throw new Error('OmetriaSignUp has no ctx');
    }

    if (typeof window.ometria === 'undefined') {
      throw new Error('OmetriaSignUp cannot access Ometria');
    }

    missingCtx = test.filter((prop) => (
      typeof ctx[prop] === 'undefined' ||
      ctx[prop] === null ||
      ctx[prop].length === 0
    ));

    if (missingCtx.length > 0) {
      throw new Error(
        `OmetriaSignUp ctx is missing: ${missingCtx.join(', ')}`,
      );
    }

    this.ns = ns;
    this.ctx = ctx;
    this.tpl = window.handlebars.compile(src.innerHTML);
    this.el = this.render(el, true);
    this.domCache = {
      form: this.el.querySelector(`#${this.ns}`),
      caption: this.el.querySelector('.js-form-caption'),
      botCheck: this.el.querySelector(`#${this.ns}-email-ck`),
      btn: this.el.querySelector('.js-btn'),
    };
    this.events = {
      submit: this.handleSubmit.bind(this),
      success: this.handleSuccess.bind(this),
      error: this.handleError.bind(this),
    };
    this.inputs = {
      email: new FormField(`#${this.ns}-email`),
    };

    if (ctx.hasNameField) {
      this.inputs.firstname = new FormField(`#${this.ns}-firstname`);
    }

    if (ctx.hasNameField) {
      this.inputs.lastname = new FormField(`#${this.ns}-lastname`);
    }

    this.toggleUI('loaded');

    this.setupListeners();
  }

  init() {
    // Set the height of the form so that we can control when it shrinks and
    // contracts. Ideally we will only ever recognise an increase in height as
    // the form is short lived.
    this.cacheHeight();
  }

  setupListeners() {
    this.domCache.form.addEventListener('submit', this.events.submit);
  }

  removeListeners() {
    this.domCache.form.removeEventListener('submit', this.events.submit);
  }

  /**
   * Renders the component into a provided el or this.el
   *
   * @param      {Object}   el            Element into which the content should
   *                                      be rendered
   * @param      {boolean}  shouldAppend  Whether or not to append or replace
   *                                      content
   * @return     {Object}   The original element with the content
   *                        appended/replaced
   */
  render(el = this.el, shouldAppend) {
    const target = el;
    const html = window.createFragmentFromHTML(this.tpl(this.ctx));

    if (!shouldAppend) {
      target.innerHTML = '';
    }

    target.appendChild(html);

    return target;
  }

  handleSubmit(e) {
    e.preventDefault();

    this.toggleUI('loading');

    if (this.isValid()) {
      const data = new FormData(this.domCache.form);
      const email = data.get('ue');
      window.ometria.identify(email);

      window.axios.post('https://api.ometria.com/forms/signup/ajax', data)
        .then(() => {
          this.events.success();
          return true;
        })
        .catch((error) => {
          // Bugsnag.notify('Ometria form submission failed', (err) => {
          //     err.addMetadata('diagnostic', {error});
          // });
          this.errors.push(this.ctx.errorCopy);
          this.events.error();
        });
    } else {
      this.handleError();
    }
  }

  handleSuccess() {
    this.ctx.hasSuccess = true;
    this.ctx.hasError = false;

    this.render();
    this.toggleUI('success');
    this.notify();
    this.cleanup();
    // debugger;
  }

  handleError() {
    const globalErrors = [];
    this.ctx.hasSuccess = false;
    this.ctx.hasError = true;

    this.errors.forEach((error) => {
      if (typeof error === 'string') {
        globalErrors.push(error);
      } else {
        const fieldName = error[0];
        const msg = error[1];
        const input = this.inputs[fieldName];

        if (input) {
          input.error(msg);
        } else {
          // Bugsnag.notify('Unknown Ometria field', (err) => {
          //     err.addMetadata('diagnostic', {fieldName});
          // });
        }
      }
    });

    if (globalErrors.length > 0) {
      this.notify('error', globalErrors);
    }

    this.toggleUI('error');

    // There are now error messages so we need to re-cache the height
    this.cacheHeight();
  }

  isValid() {
    const errors = [];

    if (this.domCache.botCheck.value !== '') {
      errors.push([this.ctx.errorCopy]);
      // Bugsnag.notify('Possible bot attempt at Ometria signup.');
    }

    // https://emailregex.com/
    /* eslint-disable-next-line max-len */
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!regex.test(this.inputs.email.val().trim())) {
      errors.push(['email', this.ctx.invalidCopy]);
    }

    if (this.inputs.firstname && this.inputs.firstname.val().trim() === '') {
      errors.push(['firstname', this.ctx.requiredCopy]);
    }

    if (this.inputs.lastname && this.inputs.lastname.val().trim() === '') {
      errors.push(['lastname', this.ctx.requiredCopy]);
    }

    if (errors.length > 0) {
      this.errors = errors;
      return false;
    }

    this.errors = [];

    return true;
  }

  toggleUI(state) {
    let isLoaded = false;
    let isLoading = false;
    let hasSuccess = false;
    let hasError = false;

    switch (state) {
      case 'loading':
        isLoading = true;
        break;
      case 'success':
        isLoaded = true;
        hasSuccess = true;
        break;
      case 'error':
        isLoaded = true;
        hasError = true;
        break;
      case 'loaded':
      default:
        isLoaded = true;
        break;
    }

    this.el.classList.toggle('is-loaded', isLoaded);
    this.el.classList.toggle('is-loading', isLoading);
    this.el.classList.toggle('has-success', hasSuccess);
    this.el.classList.toggle('has-error', hasError);
    this.domCache.btn.disabled = isLoading;
    this.domCache.btn.classList.toggle('btn--loading', isLoading);
    const nwForm = this.el.closest(".newsletter-form-container");
    if (nwForm) {
      nwForm.classList.toggle('has-success', hasSuccess);
    }
  }

  cacheHeight() {
    this.el.style.height = 'auto';
    // this.el.style.height = `${this.el.offsetHeight}px`;
  }

  notify(type, msgs) {
    const html = document.createDocumentFragment();

    this.domCache.caption.innerHTML = '';

    if (arguments.length === 0) {
      this.domCache.caption.style.display = 'none';
      return false;
    }

    msgs.forEach((msg) => {
      const para = document.createElement('p');

      para.textContent = msg;
      html.appendChild(para);
    });

    this.domCache.caption.append(html);
    this.domCache.caption.style.display = 'block';

    return true;
  }

  cleanup() {
    this.removeListeners();
    this.cleanupInputs();
  }

  cleanupInputs() {
    Object.keys(this.inputs).forEach((name) => {
      this.inputs[name].cleanup();
    });
  }
}

window.handlebars.registerHelper('md', (copy) => {
  return new window.handlebars.SafeString(window.markdown(copy));
});

class FormField {
  constructor(inputEl) {
    const input = inputEl && inputEl instanceof Element
      ? inputEl
      : document.querySelector(inputEl);
    let el = false;
    let caption = false;

    if (!input) {
      throw new Error(`${this.constructor.name} has no input, '${inputEl}'`);
    }

    if (!input.classList.contains('form-field__input')) {
      throw new Error(`${this.constructor.name} is not a '.form-field__input'`);
    }

    el = input.closest('.form-field');
    caption = el.querySelector('.form-field__caption');

    if (!el) {
      throw new Error(`${this.constructor.name} has no el, '.form-field'`);
    }

    if (!caption) {
      throw new Error(
        `${this.constructor.name} has no caption, '.form-field__caption'`,
      );
    }

    this.el = el;
    this.domCache = {
      input, caption,
    };
    this.events = {
      change: this.handleChange.bind(this),
    };

    this.setupListeners();
  }

  setupListeners() {
    this.domCache.input.addEventListener('change', this.events.change);
  }

  removeListeners() {
    this.domCache.input.removeEventListener('change', this.events.change);
  }

  handleChange() {
    this.reset();
  }

  error(msg) {
    this.toggleUI('error');

    this.domCache.caption.textContent = msg;
    this.domCache.caption.style.display = 'block';
  }

  val() {
    return this.domCache.input.value;
  }

  toggleUI(state) {
    const config = {
      error: false,
    };

    switch (state) {
      case 'error':
        config.error = true;
        break;
      default:
        break;
    }

    this.el.classList.toggle('has-error', config.error);
  }

  reset() {
    this.toggleUI();

    this.domCache.caption.textContent = '';
    this.domCache.caption.style.display = 'none';
  }

  cleanup() {
    this.reset();
    this.removeListeners();
  }
}

window.when('.js-footer-signup', () => {
  const el = document.querySelector('.js-footer-signup');

  const ctx = {
    ...contextualise('footerSignup'),
    isInline: true,
    signupSource: 'FOOTER',
  };

  const config = {
    el: el.querySelector('.js-content'),
    formUID: ctx.formUID,
  };

  try {
    const footerSignup = new OmetriaSignUp(config, ctx);
    footerSignup.init();
  } catch (e) {
    console.log(e);
    Bugsnag.notify(e);
    el.remove();
  }
});

window.when('.js-ometria-dropzone', () => {
  const els = document.querySelectorAll('.js-ometria-dropzone');

  [...els].forEach((el, i) => {
    const ctxEl = el.querySelector('.js-context');
    const baseCTX = JSON.parse(ctxEl.innerHTML);
    const ctx = { ...baseCTX, formUID: i };
    const config = {
      el,
      formUID: `dropped${i}`,
    };
    try {
      const signupForm = new OmetriaSignUp(config, ctx);

      signupForm.init();

      el.classList.remove('is-loading');
    } catch (e) {
      Bugsnag.notify(e);
      el.remove();
    }
  });
});