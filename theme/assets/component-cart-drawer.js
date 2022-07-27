/**
 * This is a compiled JS file.
 * Changes here could be overwritten. 
 * Contact your Shopify developers if changes need to be made.
 */

class CartDrawer extends HTMLElement {
  constructor() {
    super();

    // Elements
    this.buttons = this.querySelectorAll('button[type="button"]');
    this.openButtons = document.querySelectorAll('[data-cart-drawer-open]');

    // Event listeners
    this.addEventListener(
      'keyup',
      (evt) => evt.code === 'Escape' && this.close()
    );

    this.buttons.forEach((closeButton) => {
      closeButton.addEventListener('click', this.close.bind(this));
    });

    this.openButtons.forEach((openButton) => {
      openButton.addEventListener("click", (e) => {
        e.preventDefault();
        this.getSections();
      });
    });

    // Change dispatched by QuantityInput
    this.addEventListener('change', this.debouncedOnQuantityChange.bind(this));

    // Remove style attr now we're set up
    this.removeAttribute('style');
  }

  open() {
    document.body.addEventListener('click', this.handleBodyClick.bind(this));
    document.body.classList.add(`overflow-hidden`);

    this.classList.add('animate', 'active');
    this.focus();
    trapFocus(this);

    // Check for element as it may not be in the DOM
    // due to HTML being rendered by cart-drawer-body.liquid
    const { element } = this.getNoteElementAndValue();

    if (element) {
      // Debounce cart update when note changes
      element.addEventListener(
        'keyup',
        this.debouncedOnCartNoteChange.bind(this)
      );
    }
  }

  close() {
    document.body.removeEventListener('click', this.handleBodyClick.bind(this));
    document.body.classList.remove(`overflow-hidden`);

    this.classList.remove('active');
    removeTrapFocus(this.activeElement);
  }

  setActiveElement(element) {
    this.activeElement = element;
  }

  getNoteElementAndValue() {
    var noteEl = document.querySelector('[data-cart-drawer-note]');

    return {
      element: noteEl || null,
      value: noteEl ? noteEl.value : null,
    };
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
      {
        id: 'cart-drawer-body',
        section: 'cart-drawer-body',
        selector: '.shopify-section',
      },
    ];
  }

  // Can be called externally to update the cart drawer DOM
  renderSections(response) {
    renderSectionsAndData(this.getSectionsToRender(), response);
  }

  handleBodyClick(evt) {
    const target = evt.target;

    if (target !== this && !target.closest('cart-drawer')) {
      this.close();
    }
  }

  // Call API for sections
  async getSections() {
    const getRequestConfig = getConfig();
    getRequestConfig.headers['X-Requested-With'] = 'XMLHttpRequest';
    const sections = this.getSectionsToRender();
    const sectionsQueryString = sections.map((section) => section.section).join(',')

    const response = await fetch(`/?sections=${sectionsQueryString}`, getRequestConfig)
      .then((response) => response.json())
      .then((response) => {
        renderSectionsAndData(sections, {
          sections: response,
        });
      })
      .catch((e) => {
        throw new Error(e);
      });
    
    // Open the drawer
    this.open();

    return response;
  }

  // Call API to update cart items
  async updateQuantity(lineItemObject) {
    const { line, quantity } = Object(lineItemObject);

    if (line == undefined && quantity == undefined) {
      throw new Error('Invalid arguments in lineItemObject');
    }

    const postRequestConfig = postConfig();
    postRequestConfig.headers['X-Requested-With'] = 'XMLHttpRequest';

    const sections = this.getSectionsToRender();

    const body = JSON.stringify({
      line,
      quantity,
      sections: sections.map((section) => section.section),
      sections_url: window.location.pathname,
    });

    const response = await fetch(`${routes.cart_change_url}`, {
      ...postRequestConfig,
      ...{ body },
    })
      .then((response) => response.json())
      .then((response) => {
        renderSectionsAndData(sections, response);
      })
      .catch((e) => {
        throw new Error(e.message);
      });

    return response;
  }

  // Call API to update the cart note
  async updateCartNote(value) {
    if (!value) {
      throw new Error('Expected a value or empty string');
    }

    const postRequestConfig = postConfig();
    postRequestConfig.headers['X-Requested-With'] = 'XMLHttpRequest';

    const body = JSON.stringify({
      note: value || '',
    });

    const response = fetch(`${routes.cart_update_url}`, {
      ...postRequestConfig,
      ...{ body },
    })
      .then((response) => response.json())
      .catch((e) => {
        return e.message;
      });

    return response;
  }

  // Debounced wrapper function called when note changed
  async onCartNoteChange() {
    const { value } = this.getNoteElementAndValue();

    try {
      await this.updateCartNote(value);
    } catch (e) {
      throw new Error(e);
    }
  }

  // Debounced wrapper function called when quantity changed
  async onQuantityChange(event) {
    if (
      event &&
      event.target &&
      event.target.dataset &&
      event.target.dataset.index &&
      event.target.value
    ) {

      try {
        await this.updateQuantity({
          line: event.target.dataset.index,
          quantity: event.target.value,
        });
      } catch (e) {
        throw new Error(e);
      }

      try {
        await this.getSections();
      } catch (e) {
        throw new Error(e);
      }
    }
  }

  debouncedOnQuantityChange = debounce(async (event) => {
    await this.onQuantityChange(event);
  }, 300);

  debouncedOnCartNoteChange = debounce(async (event) => {
    await this.onCartNoteChange(event);
  }, 300);
}

if (!customElements.get('cart-drawer')) {
  customElements.define('cart-drawer', CartDrawer);
}

// Export for Jest
if (typeof module !== 'undefined') {
  module.exports = CartDrawer;
}
