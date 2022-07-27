import createFragmentFromHTML from '../utils/create-fragment';
import translate from '../utils/translations';

class PhoneValidation {
  constructor(el) {
    this.hasValidated = false;
    this.el = document.querySelector(el);
    const form = this.el.querySelector('[data-customer-information-form]');
    const btn = this.el.querySelector('.step__footer__continue-btn');
    const input = this.el.querySelector('#checkout_shipping_address_phone');
    const field = input.closest('.field');
    let msg = field.querySelector('.field__message');

    if (msg === null) {
      const frag = createFragmentFromHTML(
        `<p
          class="field__message field__message--error field__message-alt"
          id="error-for-phone"
          style="display: none;">
          ${translate('handle_phone_invalid')}
        </p>`,
      );

      msg = frag.firstChild;

      field.appendChild(msg);
    }

    this.domCache = {form, btn, input, field, msg};

    this.events = {
      click: this.handleClick.bind(this),
      blur: this.handleBlur.bind(this),
      change: this.handleChange.bind(this),
    };
  }

  validate() {
    const value = this.domCache.input.value.replace(/\s/g, '');
    const isValid = (value.length && (value.length >= 5));

    this.hasValidated = true;

    this.toggleMsg(!isValid);

    return isValid;
  }

  setupListeners() {
    this.domCache.input.addEventListener('blur', this.events.blur);
    this.domCache.btn.addEventListener('click', this.events.click);
    this.domCache.input.addEventListener('keyup', this.events.change);
  }

  init() {
    this.setupListeners();
  }

  handleChange() {
    this.toggleMsg(false);
    this.hasValidated = false;
  }

  handleBlur() {
    const isValid = this.validate();

    return isValid;
  }

  handleClick(e) {
    const isValid = this.validate();

    if (!isValid) {
      e.preventDefault();
    }

    return isValid;
  }

  toggleMsg(toggle) {
    this.domCache.btn.disabled = toggle;
    this.domCache.field.classList.toggle('field--error', toggle);
    this.domCache.msg.style.display = toggle ? 'block' : 'none';
  }
}

export default PhoneValidation;
