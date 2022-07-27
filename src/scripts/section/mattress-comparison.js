/**
 * This class describes a product compare.
 *
 * The approach is to manipulate the 'state', a simple one-dimensional array of
 * product IDs which represents the products currently being compared.
 * Once the manipulation has been performed, calling render on each part of the
 * component will regenerate the context for that part and replace the DOM
 * with the new view.
 *
 * Config:
 *
 * {
 *   el: '.js-product-comparison',
 *   products: contextualise('productComparison'),
 *   stickyPosition: 50,
 *   state: [4416903970871, 4394620944439, 4410167853111],
 *   domCache: {
 *     headings: '.js-product-comparison-headings',
 *     body: '.js-product-comparison-body',
 *     tableHead: '.js-product-comparison-table-head',
 *     tableBody: '.js-product-comparison-table-body',
 *     footer: '.js-product-comparison-footer',
 *   },
 *   tpls: {
 *     headings: '#product-comparison-headings-tpl',
 *     tableHead: '#product-comparison-table-head-tpl',
 *     tableBody: '#product-comparison-table-body-tpl',
 *     footer: '#product-comparison-footer-tpl',
 *   },
 * }
 *
 * Properties:
 *
 * el:              The root element
 * cols:            The number of columns that should be served
 * products:        The total list of products available for comparison
 *                  addressable by product.id
 * state:           An array of product IDs which represents the products
 *                  currently being compared
 * domCache:        A cache of DOM elements used during render
 * tpls:            A cache of compiled templates used during render
 * events:          A cache of events which allows for easy removal
 * hasStickyHeader: Whether or not the header is sticky
 *
 * @class      ProductCompare (config)
 */
class ProductCompare {
  constructor(config) {
    this.el = document.querySelector(config.el);
    this.cols = this.getCols();
    this.products = this.mapProducts(config.products, [
      'id', 'url', 'title', 'titleEscaped', 'imgProfile',
      'imgProfileAlt', 'imgProfileAspect', 'imgLayers',
      'imgLayersAlt', 'imgLayersAspect', 'priceText', 'specs',
    ]);
    this.state = config.state || this.getState();
    this.domCache = this.mapDomCache(config.domCache, [
      'header', 'headings', 'body', 'tableHead', 'tableBody', 'footer',
    ]);
    this.tpls = this.mapTpls(config.tpls, [
      'headings', 'tableHead', 'tableBody', 'footer',
    ]);
    this.events = {
      formChange: this.handleFormChange.bind(this),
      resize: window.debounce(this.handleResize.bind(this), 500),
      sticky: this.handleSticky.bind(this),
    };

    // Calling isSticky() imbues this element with the ability to emit a custom
    // event type which is attached in setupListeners()
    this.hasStickyHeader = window.isSticky(
      this.domCache.header, config.stickyPosition,
    );

    this.setupListeners();
  }

  /**
   * Applies all of the event listeners
   */
  setupListeners() {
    window
      .addEventListener('resize', this.events.resize);
    this.domCache.headings
      .addEventListener('change', this.events.formChange);

    if (this.hasStickyHeader) {
      this.domCache.header
        .addEventListener('sticky', this.events.sticky);
    }
  }

  /**
   * Removes all event listeners
   */
  cleanup() {
    window
      .removeEventListener('resize', this.events.resize);
    this.domCache.headings
      .removeEventListener('change', this.events.formChange);

    if (this.hasStickyHeader) {
      this.domCache.header
        .removeEventListener('sticky', this.events.sticky);
    }
  }

  /**
   * Automates the retrieval and compilation of the templates
   *
   * @param      {Object}  selectors  An object, properties match 'keys',
   *                                  containing the selector of the template
   * @param      {Array}   keys       Array of property names
   * @return     {Object}  An object, properties match 'keys', containing their
   *                       compiled Handlebars templates.
   *
   */
  mapTpls(selectors, keys) {
    let mapped = {};

    try {
      mapped = keys.reduce((tpls, sel) => {
        const el = document.querySelector(selectors[sel]);

        if (el === null) {
          throw Error(`'${selectors[sel]}' was not found in the DOM!`);
        }

        tpls[sel] = window.handlebars.compile(el.innerHTML.trim());

        return tpls;
      }, {});
    } catch (error) {
      console.log(error.message);
      Bugsnag.notify(error.message);
    }

    return mapped;
  }

  /**
   * Automates the retrieval of DOM elements e.g. targets for rendered templates
   *
   * @param      {Object}  selectors  An object, properties match 'keys',
   *                                  containing the selector of the element
   * @param      {Array}   keys       Array of property names
   * @return     {Object}  An object, properties match 'keys', containing their
   *                       compiled Handlebars templates.
   *
   */
  mapDomCache(selectors, keys) {
    let mapped = {};

    try {
      mapped = keys.reduce((domCache, sel) => {
        const el = this.el.querySelector(selectors[sel]);

        if (el === null) {
          throw Error(`'${selectors[sel]}' was not found in the DOM!`);
        }

        domCache[sel] = el;

        return domCache;
      }, {});
    } catch (error) {
      console.log(error);
      Bugsnag.notify(error);
    }

    return mapped;
  }

  /**
   * Converts an array into an object with the product.id as the key. This means
   * that we can drive the whole state manipulation using IDs alone and then
   * select the products at the last minute.
   *
   * @param      {Array}   unmapped  An array of products
   * @return     {Object}  An object with the product.id as the key
   */
  mapProducts(unmapped, props) {
    let mapped = {};

    try {
      mapped = unmapped.reduce((products, product) => {
        const context = props.reduce((productContext, prop) => {
          const value = product[prop];

          if (typeof value === 'undefined') {
            throw Error(`'${prop}' does not exist in '${product.title}'`);
          }

          productContext[prop] = value;

          return productContext;
        }, {});

        if (Object.keys(context).length === 0) {
          throw Error(`Empty context for '${product.title}'`);
        }

        products[product.id] = context;

        return products;
      }, {});

      if (Object.keys(mapped).length === 0) {
        throw Error('No products!');
      }
    } catch (error) {
      console.log(error);
      Bugsnag.notify(error);
    }

    return mapped;
  }

  /**
   * Handles the form change.
   * - Retrieves the values of the selects following the change.
   * - Resets the new state to match the select.
   * - Renders the selects with the new options.
   * - Renders the content of the table.
   */
  handleFormChange() {
    const selects = this.domCache.headings.querySelectorAll('select');
    const values = [...selects].map((select) => parseInt(select.value, 10));

    this.state = values;

    this.renderHeadings();
    this.renderBody();
  }

  /**
   * Handles a browser resize
   * - Gets the current number of columns to fill and updates the Object.
   * - Works out whether there are too many/few items in the current state to
   *   fill the columns.
   * - If more columns are needed then it generates a new state and renders
   *   everything again.
   * - If fewer columns are needed then only the selects are re-rendered with
   *   new options.
   */
  handleResize() {
    this.cols = this.getCols();

    if (this.state.length < this.cols) {
      this.state = this.getState();
      this.render();
    }

    if (this.state.length > this.cols) {
      this.state = this.getState();
      this.renderHeadings();
    }
  }

  /**
   * Handles the header becoming sticky
   *
   * @param      {Object}  event   The event
   */
  handleSticky(event) {
    this.domCache.header.classList.toggle('is-stuck', event.detail.isStuck);
  }

  /**
   * Retrieves the responsive state set on the root element by the CSS
   *
   * @return     {number}  The number of columns.
   */
  getCols() {
    const layout = responsiveState(this.el);

    return (layout === 'can-fit-3-cols') ? 3 : 2;
  }

  /**
   * Gets a new state i.e. an array of products to fit the number of cols.
   * - Gets the current state or instantiates an empty one.
   * - Gets the unselected products
   * - Joins selected + unselected to create a list in which the first items
   *   represent those already rendered to the DOM.
   * - Picks off enough from the front of the list to fill the columns.
   *
   * @return     {Array}  The new state.
   */
  getState() {
    const selected = this.state || [];
    const unselected = this.getAntiState();
    const state = [...selected, ...unselected].slice(0, this.cols);

    return state;
  }

  /**
   * Gets the unselected products by comparing the current state with the total
   * list of products.
   *
   * @return     {Array}  The anti state.
   */
  getAntiState() {
    const selected = this.state || [];
    const unselected = Object.keys(this.products)
      .filter((idString) => {
        const id = parseInt(idString, 10);

        return selected.indexOf(id) === -1;
      })
      .map((id) => parseInt(id, 10));

    return unselected;
  }

  /**
   * Builds an options context.
   *
   * @return     {Object}  The options context.
   */
  buildOptionsContext() {
    const unselected = this.getAntiState();
    const context = unselected.map((id) => ({
      value: id,
      label: this.products[id].title,
    }));

    return context;
  }

  /**
   * Builds a header context.
   *
   * @return     {Object}  The header context.
   */
  buildHeaderContext() {
    const unselected = this.getAntiState();
    const hasOptions = (unselected.length > 0);
    const ctx = this.state.map((id) => {
      const productCtx = {...this.products[id]};

      if (hasOptions) {
        productCtx.options = [
          {
            value: productCtx.id,
            label: productCtx.title,
            isSelected: true,
          },
          ...this.buildOptionsContext(),
        ];
      }

      return productCtx;
    });

    return {
      hasOptions,
      products: ctx,
    };
  }

  /**
   * Builds a table head context.
   *
 * @return     {Object}  The table head context.
   */
  buildTableHeadContext() {
    const unselected = this.getAntiState();
    const hasOptions = (unselected.length > 0);
    const ctx = this.state.map((id) => this.products[id]);

    return {
      hasOptions,
      products: ctx,
    };
  }

  /**
   * Builds a table body context.
   *
   * @return     {Object}  The table body context.
   */
  buildTableBodyContext() {
    const features = this.state.reduce((target, id) => {
      this.products[id].specs.forEach((feature, i) => {
        if (target[i] && Array.isArray(target[i])) {
          target[i].push(feature);
        } else {
          target[i] = [];
          target[i].push(feature);
        }
      });

      return target;
    }, []);

    return features;
  }

  /**
   * Builds a footer context.
   *
   * @return     {Object}  The footer context.
   */
  buildFooterContext() {
    return this.state.map((id) => this.products[id]);
  }

  /**
   * Toggles the enable/disable status of the heading selects
   *
   * @param      {boolean}  toggle  The toggle
   */
  toggleControls(toggle) {
    const formFields = this.domCache.headings.querySelectorAll('.form-field');
    const selects = this.domCache.headings.querySelectorAll('select');

    [...formFields].forEach((formField) => {
      formField.classList.toggle('is-disabled', !toggle);
    });

    [...selects].forEach((select) => {
      select.disabled = !toggle;
    });
  }

  /**
   * Toggles the state of the component. Shows and hides the various elements by
   * adding classes and triggering further toggles.
   *
   * @param      {string}  state   The state to switch to
   */
  toggleUI(state) {
    const config = {
      loading: false,
      switching: false,
      error: false,
      controls: true,
    };

    switch (state) {
      case 'loading':
        config.loading = true;
        config.controls = false;
        break;
      case 'switching':
        config.switching = true;
        config.controls = false;
        break;
      case 'error':
        config.error = true;
        break;
      case 'loaded':
      case 'switched':
      default:
        break;
    }

    this.el.classList.toggle('is-loading', config.loading);
    this.el.classList.toggle('is-switching', config.switching);
    this.el.classList.toggle('has-error', config.error);

    this.toggleControls(config.controls);
  }

  /**
   * Waits for all of the images in the component to be loaded
   *
   * @param      {Function}  cb      Callback
   * @return     {Promise}   Promise that to be resolved when all images are
   *                         loaded
   */
  async waitForImages(cb, timeout = 3000) {
    const promises = [];
    const imgs = [
      ...this.domCache.tableHead.querySelectorAll('img'),
      ...this.domCache.footer.querySelectorAll('img'),
    ];

    imgs.forEach((img) => {
      const promise = new Promise((resolve) => {
        // https://stackoverflow.com/questions/1977871/check-if-an-image-is-
        // loaded-no-errors-with-jquery

        if (img.complete || img.naturalWidth > 0) {
          resolve();
        }

        img.onload = () => {
          resolve();
        };

        return img;
      });

      promises.push(promise);
    });

    // Set a timeout which returns
    const failsafe = setTimeout(() => {
      console.log(`Images didn't load within ${timeout / 1000}s! Proceeding anyway.`);
      Bugsnag.notify(
        `Images didn't load within ${timeout / 1000}s! Proceeding anyway.`,
      );

      return cb();
    }, timeout);

    await Promise.all(promises);

    clearTimeout(failsafe);

    return cb();
  }

  /**
   * Shortcut to
   * - Switching to full component load
   * - Rendering the entire component again
   * - Switching to full component loaded
   */
  render() {
    this.toggleUI('loading');
    setTimeout(() => {
      this.renderHeadings();
      this.renderTableHead();
      this.renderTableBody();
      this.renderFooter();
      this.waitForImages(() => {
        this.toggleUI('loaded');
      });
    }, 300);
  }

  /**
   * Shortcut to
   * - Switching to table loading
   * - Rendering only the table
   * - Switching to table loaded
   */
  renderBody() {
    this.toggleUI('switching');

    setTimeout(() => {
      this.renderTableHead();
      this.renderTableBody();
      this.renderFooter();
      this.waitForImages(() => {
        this.toggleUI('switched');
      });
    }, 300);
  }

  renderHeadings(ctx) {
    this.domCache.headings.innerHTML = this.tpls.headings(
      ctx || this.buildHeaderContext(),
    );
  }

  renderTableHead(ctx) {
    this.domCache.tableHead.innerHTML = this.tpls.tableHead(
      ctx || this.buildTableHeadContext(),
    );
  }

  renderTableBody(ctx) {
    this.domCache.tableBody.innerHTML = this.tpls.tableBody(
      ctx || this.buildTableBodyContext(),
    );
  }

  renderFooter(ctx) {
    this.domCache.footer.innerHTML = this.tpls.footer(
      ctx || this.buildFooterContext(),
    );
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const pageHeader = document.querySelector('.header-wrapper');
  const productCompare = new ProductCompare({
    el: '.js-product-comparison',
    products: contextualise('productComparison'),
    stickyPosition: pageHeader.offsetHeight - 1,
    domCache: {
      header: '.js-product-comparison-header',
      headings: '.js-product-comparison-headings',
      body: '.js-product-comparison-body',
      tableHead: '.js-product-comparison-table-head',
      tableBody: '.js-product-comparison-table-body',
      footer: '.js-product-comparison-footer',
    },
    tpls: {
      headings: '#product-comparison-headings-tpl',
      tableHead: '#product-comparison-table-head-tpl',
      tableBody: '#product-comparison-table-body-tpl',
      footer: '#product-comparison-footer-tpl',
    },
  });

  productCompare.render();
}, false);
