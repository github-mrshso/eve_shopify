const Handlebars = window.handlebars
const ClipboardJS = window.clipboardjs
const Timer = window.easytimer

Handlebars.registerHelper('md', (copy) => {
  return new Handlebars.SafeString(markdown(copy));
});

class PromoCode {
  constructor(config, eventBus) {
    const els = document.querySelectorAll(config.el);

    // TODO: create validation class for promo-components

    if (els.length === 0) {
      console.log(`PromoCode has no el, '${config.el}'`);
    }

    this.eventBus = eventBus;
    this.els = els;
    this.clipboards = [...els].map((el) => {
      return new ClipboardJS(el);
    });
    this.events = {
      success: this.handleSuccess.bind(this),
      error: this.handleError.bind(this),
    };
    this.states = {
      isCopied: 'is-copied',
      isNotCopied: 'is-not-copied',
    };

    this.setupListeners();
  }

  setupListeners() {
    this.clipboards.forEach((clipboard) => {
      clipboard.on('success', this.events.success);
    });
    this.clipboards.forEach((clipboard) => {
      clipboard.on('error', this.events.error);
    });
  }

  removeListeners() {
    this.clipboards.forEach((clipboard) => {
      clipboard.off('success', this.events.success);
    });
    this.clipboards.forEach((clipboard) => {
      clipboard.off('error', this.events.error);
    });
  }

  handleSuccess(e) {
    this.els.forEach((el) => {
      el.classList.remove(this.states.isNotCopied);
    });
    this.els.forEach((el) => {
      el.classList.add(this.states.isCopied);
    });
    this.eventBus.trigger('codeCopied', e);

    e.clearSelection();
  }

  handleError(e) {
    Bugsnag.notify(`Failed to ${e.action} to clipboard via
      ${e.trigger}`);

    this.els.forEach((el) => {
      el.classList.remove(this.states.isCopied);
    });
    this.els.forEach((el) => {
      el.classList.add(this.states.isNotCopied);
    });
  }

  reset() {
    this.els.forEach((el) => {
      el.classList.remove('is-not-copied');
    });
    this.els.forEach((el) => {
      el.classList.remove('is-copied');
    });
  }

  cleanup() {
    this.reset();
    this.removeListeners();
  }
}

class PromoCountdown {
  constructor(config, ctx, eventBus) {
    const els = document.querySelectorAll(config.el);
    const src = document.querySelector(config.tpl);
    const test = ['nowTimestamp', 'endTimestamp'];
    let missingCtx = [];
    // TODO: create validation class for promo-components

    if (!src) {
      console.log(`PromoCountdown has no tpl, '${config.tpl}'`);
    }

    if (!ctx) {
      console.log('PromoCountdown has no ctx');
    }

    if (!els) {
      console.log(`PromoCountdown has no els, '${config.el}'`);
    }

    this.els = els;
    this.eventBus = eventBus;
    this.ctx = ctx;
    this.tpl = Handlebars.compile(src.innerHTML);
    this.events = {
      update: this.handleUpdate.bind(this),
      start: this.start.bind(this),
      ended: this.handleEnded.bind(this),
    };
    this.timer = new Timer();

    this.setupListeners();
  }

  setupListeners() {
    this.timer.addEventListener('secondsUpdated', this.events.update);
    this.timer.addEventListener('targetAchieved', this.events.ended);
  }

  removeListeners() {
    this.timer.removeEventListener('secondsUpdated', this.events.update);
    this.timer.removeEventListener('targetAchieved', this.events.ended);
  }

  start() {
    // Finding time left for promo
    const endTime = parseInt(this.ctx.endTimestamp, 10);
    const startTime = parseInt(this.ctx.nowTimestamp, 10);
    const secondsRemaining = (endTime - startTime);
    // The key for the startValues object must be called seconds
    this.timer.start({
      countdown: true,
      startValues: {
        seconds: secondsRemaining,
      },
    });
  }

  handleUpdate() {
    const timeValues = this.timer.getTimeValues();
    const html = this.tpl(timeValues);

    this.els.forEach((target) => {
      target.innerHTML = html;
    });
  }

  handleEnded() {
    this.eventBus.trigger('countdownEnded');
  }

  cleanup() {
    this.removeListeners();
  }
}

class PromoBar {
  constructor(config, eventBus) {
    const el = document.querySelector(config.el);

    // TODO: create validation class for promo-components

    if (!el) {
      console.log(`PromoBar has no el, '${config.el}'`);
    }

    this.eventBus = eventBus;
    this.el = el;
    this.events = {
      cta: this.handleCTA.bind(this),
    };
    this.domCache = {
      cta: this.el.querySelector(config.cta),
    };

    this.setupListeners();
  }

  setupListeners() {
    if (this.domCache.cta) {
      this.domCache.cta.addEventListener('click', this.events.cta);
    }
  }

  removeListeners() {
    if (this.domCache.cta) {
      this.domCache.cta.removeEventListener('click', this.events.cta);
    }
  }

  handleCTA() {
    this.eventBus.trigger('ctaClicked');
  }

  show() {
    this.el.classList.add('is-shown');
    this.el.classList.remove('is-hidden');
    this.eventBus.trigger('barShown');
  }

  hide() {
    this.el.classList.remove('is-shown');
    this.el.classList.add('is-hidden');
    // Timeout set to transition speed of promobar height
    setTimeout(() => {
      this.eventBus.trigger('barHidden');
    }, 300);
  }

  cleanup() {
    this.removeListeners();
  }
}

class PromoModal {
  constructor(config, ctx, eventBus) {
    const el = document.querySelector(config.el);
    const src = document.querySelector(config.tpl);
    const content = el.querySelector(config.content);
    const test = ['img', 'title', 'copy', 'smallPrint', 'ctaText'];
    let missingCtx = [];

    // TODO: create validation class for promo-components

    if (!el) {
      console.log(`PromoModal has no el, '${config.el}'`);
    }

    if (!src) {
      console.log(`PromoModal has no tpl, '${config.tpl}'`);
    }

    if (!content) {
      console.log(
        `PromoModal is missing a tpl target, '${config.content}'`,
      );
    }

    if (!ctx) {
      console.log('PromoModal has no ctx');
    }

    this.eventBus = eventBus;
    this.ctx = ctx;
    this.tpl = Handlebars.compile(src.innerHTML);
    this.el = el;
    this.autoShow = (
      config.autoShow &&
      (config.autoShowDelay >= 0) &&
      !this.wasPreviouslyAutoShown()
    );
    this.initialScrollPosition = window.scrollY;
    this.autoShowDelay = config.autoShowDelay;
    
    this.events = {
      close: this.hide.bind(this),
      show: this.show.bind(this),
    };
    
    this.domCache = {
      content: this.render(ctx, content),
      closeBtn: this.el.querySelector(config.closeBtn),
    };

    this.setupListeners();
  }

  setupListeners() {
    this.domCache.closeBtn.addEventListener('click', this.events.close);
  }

  removeListeners() {
    this.domCache.closeBtn.removeEventListener('click', this.events.close);
  }

  render(ctx, el) {
    const target = el || this.domCache.content;
    
    target.innerHTML = this.tpl(ctx);

    return target;
  }

  show(type) {
    document.querySelector('body').classList.add('has-modal');
    this.el.classList.add('is-active');
    this.eventBus.trigger('modalShown');

    if (type === 'auto') {
      this.autoShow = false;
      this.wasPreviouslyAutoShown(true);
    }

    return true;
  }

  hide() {
    document.querySelector('body').classList.remove('has-modal');
    this.el.classList.remove('is-active');
    // Timeout set to transition speed of promobar height
    setTimeout(() => {
      this.eventBus.trigger('modalHidden');
    }, 300);
  }

  cleanup() {
    this.removeListeners();
  }

  /**
   * Sets/tests for a cookie that tracks whether the promo_modal has been shown
   *
   * @param      {boolean}  toggle  If true then this will set the cookie, if
   *                                false then it will test for it's presence
   * @return     {boolean}  The value of the cookie
   */
  wasPreviouslyAutoShown(toggle) {
    const name = 'promo_modal_shown';
    const value = '1';
    const ttl = 24;

    if (toggle === true) {
      setCookie(name, value, ttl);
    }

    return (getCookie(name) === value);
  }

  autoShowScrollThresholdReached() {
    const delta = Math.abs(window.scrollY - this.initialScrollPosition);
    const hasReached = (delta >= this.autoShowDelay);

    return this.autoShow && hasReached;
  }
}

class PromoForm extends OmetriaSignUp {
  constructor(config, ctx, eventBus) {
    const test = [
      'title', 'ometriaBucket', 'optInCopy', 'submitCopy', 'copy', 'ctaText',
      'ctaUrl',
    ];
    let missingCtx = [];
    
    if (!ctx) {
      console.log('PromoForm has no ctx');
    }

    missingCtx = test.filter((prop) => (
      typeof ctx[prop] === 'undefined' ||
      ctx[prop] === null ||
      ctx[prop].length === 0
    ));
          
    if (missingCtx.length > 0) {
      console.log(`PromoForm ctx is missing: ${missingCtx.join(', ')}`);
    }

    // We have to remap the config and ctx in order to  make it consumable by
    // the Ometria form
    const formCtx = {
      ...ctx,
      copy: ctx.formCopy,
      successCopy: ctx.copy,
      submitCopy: ctx.submitCopy,
      signupSource: 'POPUP',
      hasOptInField: true,
    };

    super(config, formCtx);

    this.eventBus = eventBus;
  }
}

class Promo {
  constructor(config, ctx) {
    const pageCTAs = document.querySelectorAll(config.modal.pageCTA);
    this.eventBus = new EventBus();
    this.code = config.code &&
      new PromoCode(config.code, this.eventBus);
    this.modal = config.modal &&
      new PromoModal(config.modal, ctx, this.eventBus);
    this.countdown = config.countdown &&
      new PromoCountdown(config.countdown, ctx, this.eventBus);
    this.bar = config.bar &&
      new PromoBar(config.bar, this.eventBus);
    this.form = config.form &&
      new PromoForm(config.form, ctx, this.eventBus); 

    this.events = {
      barHidden: this.handleBarHidden.bind(this),
      barCta: this.handleBarCta.bind(this),
      pageCta: this.handlePageCta.bind(this),
      countdownEnded: this.handleCountdownEnded.bind(this),
      scrolled: debounce(
        this.handleScroll.bind(this, config.modal.autoShowDelay), 150,
      ),
    };

    this.domCache = {
      pageCTAs: [...pageCTAs],
    };

    this.setupListeners();
  }

  init() {
    if (this.countdown) {
      this.countdown.start();
    }

    if (this.bar) {
      this.bar.show();
    }

    if (this.form) {
      this.form.init();
    }
  }

  setupListeners() {
    this.eventBus.on('barHidden', this.events.barHidden);
    this.eventBus.on('ctaClicked', this.events.barCta);
    this.eventBus.on('countdownEnded', this.events.countdownEnded);
    this.domCache.pageCTAs.forEach((modalBtn) => {
      modalBtn.addEventListener('click', this.events.pageCta);
    });

    if (this.modal.autoShow) {
      window.addEventListener('scroll', this.events.scrolled, {passive: true});
    }
  }

  removeListeners() {
    this.eventBus.off('barHidden', this.events.barHidden);
    this.eventBus.off('ctaClicked', this.events.barCta);
    this.eventBus.off('countdownEnded', this.events.countdownEnded);
    this.domCache.pageCTAs.forEach((modalBtn) => {
      modalBtn.removeEventListener('click', this.events.pageCta);
    });
  }

  removeScrollListener() {
    window.removeEventListener('scroll', this.events.scrolled);
  }

  handleBarHidden() {
    if (this.code) {
      this.code.cleanup();
    }

    if (this.countdown) {
      this.countdown.cleanup();
    }
  }

  handleCountdownEnded() {
    if (this.bar) {
      this.bar.hide();
    }
  }

  handleBarCta() {
    if (this.modal) {
      this.modal.show();
    }
  }

  handlePageCta(e) {
    this.eventBus.trigger('ctaClicked');

    e.preventDefault();
  }

  handleScroll() {
    if (
      this.isCookieBannerPresent() ||
      !this.modal.autoShowScrollThresholdReached()
    ) {
      return false;
    }

    this.modal.show('auto');
    this.removeScrollListener();

    return true;
  }

  isCookieBannerPresent() {
    return (
      (!window.Shopify.shop.includes('localhost')) &&
      (getCookie('cookieconsent_status') === null)
    );
  }
}

window.when('.js-promo-bar', () => {
  const ctx = contextualise('activePromo');

  const config = {
    code: ctx.hasCode && {
      el: '.js-promo-code',
    },
    countdown: ctx.hasCountdown && {
      el: '.js-promo-countdown',
      tpl: '#countdown-tpl',
    },
    bar: {
      el: '.js-promo-bar',
      cta: '.js-cta',
    },
    modal: ctx.hasModal && {
      tpl: '#promo-modal-tpl',
      el: '.js-promo-modal',
      content: '.js-content',
      closeBtn: '.js-close-btn',
      pageCTA: '.js-promo-modal-btn, a[href="#promo-popup"]',
      autoShow: ctx.modalAutoOpen,
      autoShowDelay: (ctx.modalAutoOpen && ctx.modalAutoOpenDelay) &&
        parseInt(ctx.modalAutoOpenDelay, 10),
    },
    form: ctx.hasForm && {
      el: '.js-promo-form',
      formUID: ctx.formUID,
    },
  };

  try {
    const hasWhiteList = (typeof ctx.whitelist !== 'undefined') &&
      (ctx.whitelist.length > 0);
    const isWhitelisted = isListed(ctx.whitelist);
    const isBlacklisted = isListed(ctx.blacklist);
    if ((hasWhiteList && isWhitelisted) || (!hasWhiteList && !isBlacklisted)) {
      const promo = new Promo(config, ctx);

      promo.init();
    }
  } catch (e) {
    // Bugsnag.notify(e);
  }
});