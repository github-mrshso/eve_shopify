class BlogFilter extends HTMLElement {
  constructor() {
    super();

    this.el = this;
    this.isOpen = false;

    this.domCache = {
      drawer: this.el.querySelector('.js-drawer'),
      toggle: this.el.querySelector('.js-toggle'),
      closes: [...this.el.querySelectorAll('.js-close')],
      selects: [...this.el.querySelectorAll('.js-select')],
      form: this.el.querySelector('.js-form'),
      activeBtn: this.el.querySelector('.js-btn.is-active'),
    };

    this.events = {
      change: this.handleChange.bind(this),
      toggle: this.handleToggle.bind(this),
      open: this.handleOpen.bind(this),
      close: this.handleClose.bind(this),
    };

    this.init();
  }

  init() {
    this.setupListeners();
  }

  setupListeners() {
    this.domCache.toggle.addEventListener('click', this.events.toggle);

    this.domCache.closes.forEach(
      (btn) => btn.addEventListener('click', this.events.close),
    );

    this.domCache.form.addEventListener('click', this.events.change);

    this.domCache.selects.forEach(
      (select) => select.addEventListener('change', this.events.change),
    );
  }

  removeListeners() {
    this.domCache.toggle.removeEventListener('click', this.events.toggle);

    this.domCache.closes.forEach(
      (btn) => btn.removeEventListener('click', this.events.close),
    );

    this.domCache.form.removeEventListener('click', this.events.change);

    this.domCache.selects.forEach(
      (select) => select.removeEventListener('change', this.events.change),
    );
  }

  toggleBtn(btn) {
    const opt = btn.querySelector('.opt');

    opt.classList.toggle('is-checked');
    btn.classList.toggle('is-active');
  }

  handleChange(e) {
    const {target} = e;

    if (target.matches('a')) {
      this.domCache.drawer.classList.add('is-loading');
      this.toggleBtn(this.domCache.activeBtn);
      this.toggleBtn(target);
    } else if (target.matches('select')) {
      location.href = target.value;
    } else {
      return false;
    }

    return true;
  }

  handleToggle() {
    if (this.isOpen) {
      this.events.close();
    } else {
      this.events.open();
    }
  }

  handleOpen() {
    document.querySelector('html').classList.add('js-drawer-open');
    this.domCache.toggle.classList.add('is-active');
    this.domCache.drawer.classList.add('is-open');
    this.isOpen = true;
  }

  handleClose() {
    document.querySelector('html').classList.remove('js-drawer-open');
    this.domCache.toggle.classList.remove('is-active');
    this.domCache.drawer.classList.remove('is-open');
    this.isOpen = false;
  }

  cleanup() {
    this.removeListeners();
  }
}

if (!customElements.get('blog-filter')) {
  customElements.define('blog-filter', BlogFilter);
}
