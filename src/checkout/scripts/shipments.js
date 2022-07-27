import '../utils/when';
import Handlebars from 'handlebars';
import {flickity as FLICKITY} from '../globals';
import translate from '../utils/translations';
import formatMoney from '../utils/formatMoney';
import EventBus from '../utils/eventBus';
import createFragmentFromHTML from '../utils/create-fragment';
// TODO: find out why "import/order" fails on imports in shipping
// eslint-disable-next-line import/order
import markdown from '../utils/markdown';

const Flickity = require('flickity');

Handlebars.registerHelper('md', (copy) => {
  return new Handlebars.SafeString(markdown(copy));
});

/* eslint-disable no-negated-condition, @babel/no-invalid-this */
Handlebars.registerHelper('if2', function (v1, operator, v2, opts) {
  switch (operator) {
    case '===':
      return (v1 === v2)
        ? opts.fn(this) : opts.inverse(this);
    case '!==':
      return (v1 !== v2)
        ? opts.fn(this) : opts.inverse(this);
    case '<':
      return (v1 < v2)
        ? opts.fn(this) : opts.inverse(this);
    case '<=':
      return (v1 <= v2)
        ? opts.fn(this) : opts.inverse(this);
    case '>':
      return (v1 > v2)
        ? opts.fn(this) : opts.inverse(this);
    case '>=':
      return (v1 >= v2)
        ? opts.fn(this) : opts.inverse(this);
    case '&&':
      return (v1 && v2)
        ? opts.fn(this) : opts.inverse(this);
    case '||':
      return (v1 || v2)
        ? opts.fn(this) : opts.inverse(this);
    default:
      return opts.inverse(this);
  }
});
/* eslint-enable no-negated-condition, @babel/no-invalid-this */

/**
 * Convert 'YYYY-MM-DD' to 'Mon, Feb 01'
 *
 * @param      {string}  dateStr  The date string YYYY-MM-DD
 * @return     {string}  DDD, MMMM dd
 */
function prettifyDate(dateStr) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const date = new Date(dateStr);
  const dayName = dayNames[date.getDay()];
  const dayDate = `0${date.getDate()}`.slice(-2);
  const monthName = monthNames[date.getMonth()];

  return `${dayName}, ${dayDate} ${monthName}`;
}

/**
 * Convert 'YYYY-MM-DD' to 'Mon, 20/07'
 *
 * @param      {string}  dateStr  The date string YYYY-MM-DD
 * @return     {string}  DDD, dd/MM
 */
function truncateDate(dateStr) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(dateStr);
  const dayName = dayNames[date.getDay()];
  const dayDate = `0${date.getDate()}`.slice(-2);
  const month = `0${date.getMonth() + 1}`.slice(-2);

  return `${dayName} ${dayDate}/${month}`;
}

/**
 * Templates. These are the compiled Handlebars templates. They could and
 * possibly should be written to the page or pre-compiled rather than existing
 * as strings here in the JS.
 *
 * @type       {Object}
 */
const TPL = {
  shipment: Handlebars.compile(
    `<div><fieldset class="content-box content-box--gfs-shipments js-shipments">
    </fieldset></div>`,
  ),
  service: Handlebars.compile(
    `<div class="content-box__row {{#if checked}} is-active{{/if}}">
      <div class="radio-wrapper radio-wrapper--gfs">
        <div class="radio__input">
          <input
            id="shipment-group-{{id}}"
            class="input-radio js-service-input"
            value="{{value}}"
            type="radio"
            name="shipment-group"
            tabIndex="0"
            {{checked}}>
        </div>
        <label
          for="{{labelFor}}"
          tabIndex="-1"
          class="radio__label js-service-label">
          <span class="radio__label__primary">
            {{title}}
            <br>
            <span class="small-text small-text--delivery js-service-detail">
              {{detail}}
            </span>
          </span>
          <span class="radio__label__accessory">
            <span class="content-box__emphasis js-service-price">
              {{price}}
            </span>
          </span>
        </label>
      </div>
      <div class="content-box__details">
        <div class="rte">
          <p>{{trackingNotice}}</p>
          {{#if notes}}
            {{md notes}}
          {{/if}}
        </div>
      </div>
      {{#if hasCalendar}}
        <div class="content-box__calendar js-calendar">
        </div>
      {{/if}}
    </div>`,
  ),
  slider: Handlebars.compile(
    `<div class="slider slider--calendar">
      <div class="slider__slides js-calendar-day">
        {{#each this}}
          <div class="slider__slide">
            <div class="slider__title">
              {{date}}
            </div>
            <div class="slider__content">
              <div class="delivery-slots">
                {{#each slots}}
                  <label
                    for="{{id}}"
                    tabIndex="0"
                    class="delivery-slots__slot js-calendar-slot
                      {{#if checked}} is-active{{/if}}">
                    {{name}} <strong>{{price}}</strong>
                  </label>
                {{/each}}
              </div>
            </div>
          </div>
        {{/each}}
      </div>
    </div>`,
  ),
};

/**
 * A slot within a day-definite service.
 *
 * @class      Slot (config, eventBus)
 */
class Slot {
  constructor(config, eventBus) {
    this.eventBus = eventBus;
    this.name = config.name;
    this.enabled = config.enabled;
    this.price = config.price;
    this.priceHuman = config.priceHuman;
    this.maxDate = config.maxDate;
    this.maxDateHuman = config.maxDateHuman;
    this.id = config.id;
    this.serviceID = config.serviceID;
    this.input = config.input;
    this.events = {
      click: this.handleClick.bind(this),
      change: this.handleChange.bind(this),
      update: this.handleUpdate.bind(this),
    };
  }

  /**
   * Sets the root DOM element. This allows for slots to be attached to
   * pre-exisitng DOM elements.
   *
   * @param      {Node}  node    The node to which to set the el prop to
   */
  el(node) {
    this.el = node;

    this.setupListeners();
  }

  /**
   * Generates the ctx for the tpl. Just because this class doesn't generate its
   * own DOM it doesn't mean that it can't control the context that drives that
   * DOM.
   *
   * @return     {Object}  CTX for the Tpl
   */
  ctx() {
    return {
      id: this.input.id,
      name: this.name,
      price: this.priceHuman,
      detail: this.detail,
      date: this.maxDate,
      checked: this.enabled,
    };
  }

  setupListeners() {
    this.eventBus.on('service-change', this.events.change);
    this.eventBus.on('form-change', this.events.update);
    this.el.addEventListener('click', this.events.click);
  }

  removeListeners() {
    this.eventBus.off('service-change', this.events.change);
    this.el.removeEventListener('click', this.events.click);
  }

  /**
   * When the slot is clicked it does nothing but trigger a 'service change'
   * event broadcasting its properties.
   *
   * @param      {Object}  e       Event object
   */
  handleClick(e) {
    e.preventDefault();

    if (this.enabled) {
      return null;
    }

    this.trigger();

    return true;
  }

  /**
   * Handles a change to the chosen service. Given an event on the eventBus: if
   * matching it will enable itself, if not matching it will disabled itself.
   *
   * @param      {Object}  e       Service event object
   */
  handleChange(e) {
    if (e.slot && e.slot === this.id) {
      this.enable();
    } else if (this.enabled) {
      this.disable();
    }
  }

  /**
   * Handles a change to the underlying form. If an ID is present and matches
   * this slot's ID then it will trigger an event as if it had been clicked
   *
   * @param      {Object}  e       Form event object
   */
  handleUpdate(e) {
    if (e.input && e.input === this.input.id) {
      this.trigger();
    }
  }

  trigger() {
    this.eventBus.trigger('service-change', {
      slot: this.id,
      service: this.serviceID,
      detail: this.maxDateHuman,
      price: this.priceHuman,
    });
  }

  enable() {
    this.enabled = true;
    this.el.classList.add('is-active');
    this.input.checked = true;
    this.el.focus();
  }

  disable() {
    this.enabled = false;
    this.el.classList.remove('is-active');
    this.input.checked = false;
  }

  cleanup() {
    this.removeListeners();
  }
}

/**
 * A calendar for a day-definite service
 *
 * @class      Calendar (name)
 */
class Calendar {
  constructor(slots) {
    // Group all of the slots by date
    const days = Object.keys(slots).reduce((acc, id) => {
      const slot = slots[id];

      if (Object.prototype.hasOwnProperty.call(acc, slot.maxDate)) {
        acc[slot.maxDate].push(slot);
      } else {
        acc[slot.maxDate] = [slot];
      }

      return acc;
    }, {});

    // Create a ctx for the template. Having the Slot instances render their own
    // templates is problematic because we would then need to dynamically
    // generate the days in order that the slots end up in the right slides.
    // Nobody has time for that! Instead, we just use the same sorted list to:

    // Generate a ctx (nested arrays sorted by date). We need to know which
    // slide holds an active slot if any. The fallback will be index 0
    // i.e. the first
    let activeSlide = 0;

    this.ctx = Object.keys(days).sort()
      .reduce((acc, date, i) => {
        acc.push({
          date: truncateDate(date),
          slots: days[date].map((slot) => {
            // 2 days are shown per slide so we can work out which is the
            // active slide from the day that holds the enabled slot.
            if (slot.enabled) {
              activeSlide = Math.floor(i / 2);
            }

            return slot.ctx();
          }),
        });

        return acc;
      }, []);

    this.startSlide = activeSlide;
    this.slider = false;
    this.tpl = TPL.slider;
    this.el = this.build();
    this.domCache = {
      slides: this.el.querySelector('.js-calendar-day'),
    };
  }

  /**
   * Creates the root DOM node for this component
   */
  build() {
    const el = createFragmentFromHTML(this.tpl(this.ctx));

    return el;
  }

  /**
   * Initializes the Flickity slider.
   */
  init() {
    this.slider = new Flickity(this.domCache.slides, {
      ...FLICKITY,
      initialIndex: this.startSlide,
      setGallerySize: true,
      groupCells: 2,
      wrapAround: false,
      pageDots: false,
      dragThreshold: 10,
      contain: false,
      cellAlign: 'center',
    });
  }

  render() {
    return this.el;
  }

  enable() {
    if (!this.slider) {
      this.init();
    }
  }

  disable() {
    this.reset();
  }

  /**
   * Returns the calendar back to an untouched state
   */
  reset() {
    if (this.slider) {
      // Flickity specific method
      this.slider.select(0, false, false);
    }
  }

  cleanup() {
    if (this.slider) {
      this.slider.destroy();
    }
  }
}

/**
 * Base service
 *
 * @class      Service (name)
 */
class Service {
  constructor(config, eventBus) {
    this.eventBus = eventBus;
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.notes = config.notes;
    this.tpl = TPL.service;
    this.enabled = config.enabled;
    this.events = {
      change: this.handleChange.bind(this),
      click: this.handleClick.bind(this),
    };
  }

  /**
   * Creates the root DOM node for this component
   *
   * @return     {Node}  Root el in the form of a document fragment
   */
  build() {
    const el = createFragmentFromHTML(this.tpl({
      id: this.id,
      detail: this.detail,
      title: this.name,
      value: this.name,
      labelFor: this.inputID,
      price: this.price,
      checked: this.enabled ? 'checked' : '',
      notes: this.notes,
      hasCalendar: this.calendar instanceof Calendar,
      trackingNotice: translate('tracking_notice_html'),
    }));

    return el.firstChild;
  }

  init() {
    if (this.enabled) {
      this.domCache.proxy.focus();
    }
  }

  render() {
    return this.el;
  }

  setupListeners() {
    this.eventBus.on('service-change', this.events.change);
    this.domCache.proxy.addEventListener('change', this.events.click);
    this.domCache.label.addEventListener('click', this.events.click);
  }

  removeListeners() {
    this.eventBus.off('service-change', this.events.change);
    this.domCache.proxy.removeEventListener('change', this.events.click);
    this.domCache.label.removeEventListener('click', this.events.click);
  }

  /**
   * Handles a change to the chosen service. Given an event on the eventBus: if
   * matching it will enable itself, if not matching it will disabled itself.
   *
   * @param      {Object}  e       Service event object
   */
  handleChange(e) {
    if (e.service && e.service === this.id) {
      this.enable();
    } else {
      this.disable();
    }
  }

  /**
   * When the service is clicked it does nothing but trigger a 'service change'
   * event broadcasting its properties.
   *
   * @param      {Object}  e       Event object
   */
  handleClick(e) {
    e.preventDefault();

    if (this.enabled) {
      return null;
    }

    this.trigger();

    return true;
  }

  trigger() {
    this.eventBus.trigger('service-change', {
      service: this.id,
    });
  }

  enable() {
    this.enabled = true;
    this.el.classList.add('is-active');
    this.domCache.proxy.checked = true;
    this.domCache.proxy.focus({preventScroll: true});
  }

  disable() {
    this.enabled = false;
    this.el.classList.remove('is-active');
    this.domCache.proxy.checked = false;
  }

  cleanup() {
    this.removeListeners();
  }
}

/**
 * Standard service without slots/calendar.
 *
 * @class      ServiceWithoutCalendar (name)
 */
class ServiceWithoutCalendar extends Service {
  constructor(config, eventBus) {
    super(config, eventBus);

    this.inputID = config.input.id;
    this.input = config.input;
    this.detail = config.detail;
    this.price = config.priceHuman;
    this.el = this.build();
    this.events = {
      ...this.events,
      update: this.handleUpdate.bind(this),
    };
    this.domCache = {
      price: this.el.querySelector('.js-service-price'),
      detail: this.el.querySelector('.js-service-detail'),
      proxy: this.el.querySelector('.js-service-input'),
      label: this.el.querySelector('.js-service-label'),
    };

    this.setupListeners();
  }

  setupListeners() {
    super.setupListeners();

    this.eventBus.on('form-change', this.events.update);
  }

  removeListeners() {
    super.removeListeners();

    this.eventBus.off('form-change', this.events.update);
  }

  /**
   * Handles an update from the underlying form
   *
   * @param      {Object}  e       Event object
   */
  handleUpdate(e) {
    if (e.input && e.input === this.input.id) {
      this.trigger();
    }
  }

  enable() {
    super.enable();

    this.input.checked = true;
  }
}

/**
 * Day definite service with slots/calendar
 *
 * @class      ServiceWithCalendar (name)
 */
class ServiceWithCalendar extends Service {
  constructor(config, eventBus) {
    super(config, eventBus);

    const slots = config.slots
      .sort((slotA, slotB) => {
        if (slotA.maxDate < slotB.maxDate) { return -1; }
        if (slotA.maxDate > slotB.maxDate) { return 1; }
        if (slotA.time < slotB.time) { return -1; }
        if (slotA.time > slotB.time) { return 1; }
        if (slotA.id < slotB.id) { return -1; }
        if (slotA.id > slotB.id) { return 1; }
        return 0;
      })
      .reduce((acc, slot) => {
        acc[slot.id] = new Slot(slot, this.eventBus);
        return acc;
      }, {});

    this.slots = slots;
    this.calendar = new Calendar(this.slots);
    this.cheapestSlot = this.getCheapestSlot();
    this.firstSlot = this.getEarliestSlot();
    this.defaultDetail = translate('choose_delivery_slot_html');
    this.defaultPrice = translate('from_text_html', {
      price: this.cheapestSlot.priceHuman,
    });
    this.detail = config.detail || this.defaultDetail;
    this.price = this.defaultPrice;
    this.el = this.build();
    this.domCache = {
      price: this.el.querySelector('.js-service-price'),
      detail: this.el.querySelector('.js-service-detail'),
      proxy: this.el.querySelector('.js-service-input'),
      label: this.el.querySelector('.js-service-label'),
      calendar: this.el.querySelector('.js-calendar'),
    };

    // This is grotty but quicker! The slots are required to generate the
    // calendar DOM but the calendar DOM is required in order to map it to the
    // underlying form, we first generate the calendar DOM and then map the els
    // within it to our slots. The alternative would be to have the slots build
    // their own DOM which we could render in place.
    this.domCache.calendar.append(this.calendar.render());
    this.mapSlots();

    this.setupListeners();
  }

  /**
   * Creates the root DOM node for this component
   *
   * @return     {Node}  Root el in the form of a document fragment
   */
  build() {
    const el = super.build();

    return el;
  }

  init() {
    if (!this.enabled) {
      return false;
    }

    this.calendar.enable();

    return true;
  }

  /**
   * Handles a change to the chosen service. Given an event on the eventBus: if
   * matching it will update its properties, if not matching it will reset its
   * properties.
   *
   * @param      {Object}  e       Service event object
   */
  handleChange(e) {
    super.handleChange(e);

    if (e.service && this.id === e.service) {
      this.detail = e.detail;
      this.price = e.price;
    } else {
      this.detail = null;
      this.price = null;
    }

    this.refresh();
  }

  trigger() {
    this.eventBus.trigger('service-change', {
      slot: this.firstSlot.id,
      service: this.firstSlot.serviceID,
      detail: this.firstSlot.maxDateHuman,
      price: this.firstSlot.priceHuman,
    });
  }

  enable() {
    super.enable();

    this.calendar.enable();
  }

  disable() {
    super.disable();

    this.calendar.disable();
  }

  /**
   * Refreshes the DOM state to match the properties described in this object.
   * First set the properties on the object and then call this to update the UI.
   */
  refresh() {
    this.domCache.detail.textContent = this.detail || this.defaultDetail;
    this.domCache.price.textContent = this.price || this.defaultPrice;
  }

  /**
   * Gets the cheapest slot. Useful for displaying "from £X"
   *
   * @return     {Object}  A Slot instance with the cheapest price.
   */
  getCheapestSlot() {
    const slots = Object.keys(this.slots).map((id) => this.slots[id]);

    return slots.sort((slotA, slotB) => {
      if (slotA.price < slotB.price) { return -1; }
      if (slotA.price > slotB.price) { return 1; }
      return 0;
    })[0];
  }

  /**
   * Gets the earliest slot. Useful for displaying "get it by XXX"
   *
   * @return     {Object}  The Slot instance with the earliest date, earliest
   *                       time and first ID alphabetically.
   */
  getEarliestSlot() {
    const slots = Object.keys(this.slots).map((id) => this.slots[id]);

    return slots.sort((slotA, slotB) => {
      if (slotA.maxDate < slotB.maxDate) { return -1; }
      if (slotA.maxDate > slotB.maxDate) { return 1; }
      if (slotA.time < slotB.time) { return -1; }
      if (slotA.time > slotB.time) { return 1; }
      return 0;
    })[0];
  }

  /**
   * Queries the calendar DOM for the slot els and attaches them to the
   * respective Slot instance
   */
  mapSlots() {
    Object.keys(this.slots).forEach((id) => {
      const slot = this.slots[id];
      const slotEl = this.domCache.calendar
        .querySelector(`label[for=${slot.input.id}]`);

      return slot.el(slotEl);
    });
  }

  cleanup() {
    super.cleanup();

    this.calendar.cleanup();
  }
}

/**
 * Shipment consisting of multiple services. This is the root object which
 * spawns services and acts as the entry point to the whole GFS FE operation.
 *   the eventBus.
 * - Scrapes the DOM and builds a data model from which all services are built.
 * - Handles changes to the form and propagates those events through to the
 *   Services.
 *
 * @class      Shipment (name)
 */
class Shipment {
  constructor(root, ctx) {
    const form = root.querySelector('form[data-shipping-method-form]');
    const list = form.querySelector('[data-shipping-methods]');
    const eventBus = new EventBus();

    this.root = root;
    this.eventBus = eventBus;
    this.tpl = TPL.shipment;
    this.ctx = ctx;

    // Map the service types to their classes. The order of this is important as
    // it will ultimately result in the services being rendered in this order.
    // The appropriate key must be attached to the service model when scraping.
    this.serviceTypes = {
      standard: ServiceWithoutCalendar,
      dayDefinite: ServiceWithCalendar,
    };

    // Build services based on the newly scraped model
    this.services = this.scrape(form);

    // Create the root el for the new UI
    this.el = this.build();

    // Instantiate a new events hash so that we can easily attach/detach event
    // listeners
    this.events = {
      formChange: this.handleFormChange.bind(this),
      keyDown: this.handleKeyDown.bind(this),
    };

    // Cache the DOM elements we need so that we don't need to keep querying
    // the DOM for them
    this.domCache = {
      form,
      list,
      shipments: this.el.querySelector('.js-shipments'),
    };

    this.setupListeners();

    window.shipment = this.services;
  }

  /**
   * Creates the root DOM node for this component
   *
   * @return     {Node}  Root el in the form of a document fragment
   */
  build() {
    const el = createFragmentFromHTML(this.tpl({
      trackingNotice: translate('tracking_notice_html'),
    }));

    return el.firstChild;
  }

  /**
   * Renders the Services into the root el
   *
   * @return     {Node}  Root el containing the rendered services
   */
  render() {
    Object.keys(this.services).forEach((id) => {
      this.domCache.shipments.append(this.services[id].render());
    });

    return this.el;
  }

  /**
   * Initialises the GFS Shipment process.
   * - Renders the services to the el
   * - Hides the raw list
   * - Initialises each service
   */
  init() {
    const el = this.render();

    // Hide the original list
    this.toggleList(false);

    // Append the root el to the DOM
    this.domCache.list.parentNode.insertBefore(el, this.domCache.list);

    // Initialise each of the services
    Object.keys(this.services).forEach((id) => {
      this.services[id].init();
    });
  }

  setupListeners() {
    this.domCache.form.addEventListener('change', this.events.formChange);
    document.addEventListener('keydown', this.events.keyDown);
  }

  removeListeners() {
    this.domCache.form.removeEventListener('change', this.events.formChange);
    document.removeEventListener('keydown', this.events.keyDown);
  }

  /**
   * Handles a change to an input in the raw list.
   *
   * @param      {Object}  e       Event object
   */
  handleFormChange(e) {
    this.eventBus.trigger('form-change', {
      input: e.target.id,
    });
  }

  /**
   * Handles a change to an input via the enter button
   *
   * @param      {Object}  e       Event object
   */
  handleKeyDown(e) {
    const activeElement = document.activeElement;

    if (e.keyCode === 13 && this.el.contains(activeElement)) {
      activeElement.click();
    }
  }

  /**
   * Shows/hides the new UI and inversely shows/hides the raw list.
   *
   * @param      {Boolean}  toggle  The toggle
   */
  toggleList(toggle) {
    this.domCache.shipments.style.display = toggle ? 'none' : 'block';
    this.domCache.list.style.display = toggle ? 'block' : 'none';
  }

  /**
   * Scrapes the DOM and returns new Services instances mapped to their IDs
   *
   * @return     {Object}  Root el in the form of a document fragment
   */
  scrape(el) {
    // Any missing content that cannot be sent through with the rows
    const {
      dayDefiniteID,
      dayDefiniteName,
      deliveryNotes,
    } = this.ctx;

    // Selectors used to fetch elements
    const sel = {
      form: 'form[data-shipping-method-form]',
      list: '[data-shipping-methods]',
      row: '[data-shipping-method]',
      terminator: '[data-shipping-method-label-title="TRMN"]',
      input: 'input[type="radio"]',
      title: '[data-shipping-method-label-title]',
      eta: '.small-text:first-of-type',
      detail: '.small-text:last-of-type',
    };

    // Attributes for extracting text content
    const attr = {
      title: 'data-shipping-method-label-title',
      price: 'data-checkout-total-shipping-cents',
      priceHuman: 'data-checkout-original-shipping-rate',
    };

    // Regexes used to match text content to values. Until there is full support
    // for named groups in regex matches, alongside the pattern, we store the
    // group names in an array in the order that they occur in the returned
    // match. This means that we can address the group by name
    // e.g. regex.title.groups.indexOf('id') = 1.
    const regex = {
      title: {
        // e.g. "D1S1 | 8am - 2pm + removal | Fri, 06 Jul"
        //   or "S1 | standard | Get it by Fri, 06 Jul"
        /* eslint-disable-next-line max-len, no-useless-escape */
        pattern: /^([a-z]+[0-9]+(?:[a-z]+[0-9]+)?)\s*\|\s*([\w\d\s,+&\\\/-]+)\s*\|\s*([éâû\w\d\s,-]+)$/i,
        groups: ['full', 'id', 'name', 'date'],
      },
      // e.g. 2020-07-19|2020-07-22|17:30:00
      detail: {
        /* eslint-disable-next-line max-len */
        pattern: /^(\d{4}-\d{2}-\d{2})\|(\d{4}-\d{2}-\d{2})\|(\d{2}:\d{2}:\d{2})/i,
        groups: ['full', 'minDate', 'maxDate', 'time'],
      },
      terminator: {
        pattern: /.*TRMN.*/,
      },
    };

    // Select all inputs from the raw list
    const inputs = el.querySelectorAll(sel.input);

    // For each input in the raw list
    const model = [...inputs].reduce((shipment, input) => {
      // Select the root element for the row containing the input
      const row = input.closest(sel.row);

      // If there is no row then fail straight away as this is likely to fail
      // in all other instances
      if (!row) {
        throw new Error('Missing row el');
      }

      // Filter out the terminator row. This will appear at the end although we
      // may as well no assume
      if (regex.terminator.pattern.test(input.value)) {
        return shipment;
      }

      // Get the elements from the row that should contain the encoded info for
      // building the new UI.
      const titleEl = row.querySelector(sel.title);
      const detailEl = row.querySelector(sel.detail);

      // If there are no elements then fail straight away as this is likely to
      // fail in all other instances
      if (!titleEl) {
        throw new Error('Missing title el');
      }

      if (!detailEl) {
        throw new Error('Missing description el');
      }

      // Extract the content from the elements
      const titleStr = titleEl.getAttribute(attr.title).trim();
      const detailStr = detailEl.textContent.trim();
      const priceStr = input.getAttribute(attr.price).trim();

      // Test the content against the regex patterns defined above
      const title = titleStr.match(regex.title.pattern);
      const detail = detailStr.match(regex.detail.pattern);
      const price = parseInt(priceStr, 10);

      // If the patterns do not match then fail straight away as we have nothing
      // to work with
      if (!title) {
        throw new Error(
          `${titleStr} does not match ${regex.title.pattern.source}`,
        );
      }

      if (!detail) {
        // This is not a failure. Instead we will just let the detailStr get
        // passed through as is. Leaving this here for readability.
      }

      // We need the price to be a number in order to manipulate it. If it is
      // not a number then fail straight away.
      if (isNaN(price)) {
        throw new Error(`'${priceStr}' is not a valid price.`);
      }

      // If the raw price is > 0 then it is output with decimal e.g. £50.00.
      // Therefore:
      // - If the price is > 0, we use the decimal value to get the number of
      //   pounds/euros and then translate it i.e. add the currency
      // - If the price === 0, we just use the whatever string has been set on
      //   that row to denote the price as this already uses locales
      const priceHuman = price > 0
        ? formatMoney(price)
        : input.getAttribute(attr.priceHuman).trim();

      // Until there is support for named groups in regex matches we store the
      // group names in an array in the order that they appear in the string
      const idIndex = regex.title.groups.indexOf('id');
      const nameIndex = regex.title.groups.indexOf('name');

      const id = title[idIndex].trim();
      const name = title[nameIndex].trim();

      // We deduce that if the detail string matches the regex i.e. contains the
      // required parts then it must be day definite. These type-strings must
      // match the serviceTypes map in the constructor.
      const type = (detail === null) ? 'standard' : 'dayDefinite';

      // We deduce whether this input is checked. This is important in instances
      // where we are returning to a list after having previously made a
      // selection i.e. returing to the delivery step after selecting a shipment
      // option.
      const enabled = (input.checked === true);

      // Create basic option object. This represents a standard delivery
      // or a slot in a day definite service i.e. a checkbox on the page. This
      // is the kernel of information that maps to an input in the raw list
      const option = {
        id,
        input,
        price,
        priceHuman,
        name,
        detail: detailStr,
        enabled,
      };

      // Construct service configs

      if (type === 'standard') {
        // Standard services have a one-to-one relationship to an input on the
        // page and so we just add any delivery notes to the original config and
        // add it to the shipment accumulator
        shipment[id] = {
          ...option,
          notes: deliveryNotes[id],
          type: 'standard',
        };
      }

      if (type === 'dayDefinite') {
        // Day definite services have a one to many relationship with inputs on
        // the page. The row is simply a wrapper for a group of slots. As such
        // it doesn't have a title or ID of its own. Therefore we use Shopify
        // theme settings to do this.

        // If the settings are not present in the theme settings then we must
        // fail straight away
        if (!dayDefiniteName) {
          throw new Error('Day definite service is missing a name');
        }

        if (!dayDefiniteID) {
          throw new Error('Day definite service is missing an ID');
        }

        // Using the named groups that we have set up in the regex map we
        // extract the meta data from the encoded string
        const minDateIndex = regex.detail.groups.indexOf('minDate');
        const maxDateIndex = regex.detail.groups.indexOf('maxDate');
        const timeIndex = regex.detail.groups.indexOf('time');

        const minDate = detail[minDateIndex].trim();
        const maxDate = detail[maxDateIndex].trim();
        const time = detail[timeIndex].trim();
        const maxDateHuman = prettifyDate(maxDate);
        const minDateHuman = prettifyDate(minDate);
        const serviceID = dayDefiniteID;

        // Create a 'slot' object by adding extra details to the basic option
        // object initiated above.
        const slot = {
          ...option,
          serviceID,
          minDate,
          maxDate,
          time,
          maxDateHuman,
          minDateHuman,
        };

        // Rather than add a slot as a service (row), we append it to any
        // day-definite service that exists in our shipment accumulator
        if (Object.prototype.hasOwnProperty.call(shipment, serviceID)) {
          shipment[serviceID].slots.push(slot);
        } else {
          // Where no day definite service already exists in the shipment
          // accumulator, we instantiate a day-definite 'wrapper' service
          // config and append the slot to its array
          shipment[serviceID] = {
            type,
            id: serviceID,
            name: dayDefiniteName,
            notes: deliveryNotes[serviceID],
            slots: [slot],
          };
        }

        // If the slot is enabled then we enable the service.
        if (enabled) {
          shipment[serviceID].enabled = true;
          shipment[serviceID].detail = maxDateHuman;
        }
      }

      return shipment;
    }, {});

    // If the model fails or is empty then we fail straight away
    if (!model || Object.keys(model).length < 1) {
      throw new Error('No services following scrape');
    }

    // Once we have scraped the DOM and created a data model from it we create
    // Service objects from it.
    const services = this.createServices(model);

    return services;
  }

  /**
   * Creates services from a given data model
   *
   * @param      {Object}  model   The data model
   * @return     {Object}  Service objects mapped to their ID
   */
  createServices(model) {
    // Create the sort array. As long as the keys are all strings they will be
    // ordered as they are in the serviceTypes map.
    const serviceSort = Object.keys(this.serviceTypes);

    return Object.keys(model)
      .map((id) => model[id])
      // Sort services based on their order in the serviceTypes map.
      .sort((modelA, modelB) => {
        const orderA = serviceSort.indexOf(modelA.type);
        const orderB = serviceSort.indexOf(modelB.type);

        if (orderA < orderB) {
          return -1;
        }

        if (orderA > orderB) {
          return 1;
        }

        return 0;
      })
      // Return the array of services back into an object mapped by service ID
      .reduce((acc, service) => {
        acc[service.id] = new this.serviceTypes[service.type](
          service, this.eventBus,
        );
        return acc;
      }, {});
  }

  cleanup() {
    this.removeListeners();

    Object.keys(this.services).forEach((id) => {
      this.services[id].cleanup();
    });
  }
}

export default Shipment;
