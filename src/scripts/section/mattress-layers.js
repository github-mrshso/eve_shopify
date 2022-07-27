class MattressLayers extends HTMLElement {
  constructor() {
    super();
    const diagram = this.querySelector('.js-diagram');
    const slider = this.querySelector('.js-slider');

    this.slider = {};
    this.activeLayer = 0;
    this.state = window.getCSSFlag(this);
    this.height = 0;
    this.domCache = {
      diagram,
      slider,
      slides: [...slider.querySelectorAll('.js-slide')],
      titles: [...slider.querySelectorAll('.js-title')],
      contents: [...slider.querySelectorAll('.js-content')],
      btns: [...diagram.querySelectorAll('.js-btn')],
      layers: [...diagram.querySelectorAll('.js-layer')],
    };

    this.events = {
      slideChange: this.handleSlideChange.bind(this),
      pipClick: this.handlePipClick.bind(this),
      titleClick: this.handleTitleClick.bind(this),
      resize: this.handleResize.bind(this),
    };

    this.init();
  }

  init() {
    this.activateLayer(this.activeLayer);
    this.activateSlide(this.activeLayer);

    if (this.state === 'is-slider') {
      this.slider = new window.flickity(this.domCache.slider, {
        ...window.flickity,
        initialIndex: this.activeLayer,
        resize: true,
        pageDots: false,
        dragThreshold: 10,
      });
    }

    this.setupListeners();
  }

  destroy() {
    if (this.hasSlider()) {
      this.slider.destroy();
      this.slider = {};
    }

    this.domCache.contents.forEach((content) => {
      content.style.removeProperty('height');
    });

    this.style.removeProperty('height');

    this.removeListeners();
  }

  setupListeners() {
    window.addEventListener('resize', this.events.resize);

    if (this.hasSlider()) {
      this.slider.on('change', this.events.slideChange);
    }

    this.domCache.btns.forEach((pip) => {
      pip.addEventListener('click', this.events.pipClick);
    });

    this.domCache.titles.forEach((title) => {
      title.addEventListener('click', this.events.titleClick);
    });
  }

  removeListeners() {
    window.removeEventListener('resize', this.events.resize);

    if (this.hasSlider()) {
      this.slider.off('change', this.events.slideChange);
    }

    this.domCache.btns.forEach((pip) => {
      pip.removeEventListener('click', this.events.pipClick);
    });

    this.domCache.titles.forEach((title) => {
      title.removeEventListener('click', this.events.titleClick);
    });
  }

  handleSlideChange(index) {
    this.activateLayer(index);
    this.activateSlide(index);

    this.activeLayer = index;
  }

  handlePipClick(e) {
    const el = e.currentTarget;
    const index = el.dataset.index;

    this.activateLayer(index);
    this.activateSlide(index);

    this.activeLayer = index;
  }

  handleTitleClick(e) {
    const el = e.currentTarget;
    const index = el.dataset.index;

    this.activateLayer(index);
    this.activateSlide(index);

    this.activeLayer = index;

    e.preventDefault();
  }

  handleResize() {
    const newState = window.getCSSFlag(this);

    if (newState === this.state) {
      return false;
    }

    this.state = newState;

    this.destroy();
    this.init();

    return true;
  }

  activateLayer(index) {
    const className = 'is-active';
    const from = this.activeLayer;
    const to = index;

    this.domCache.layers[from].classList.remove(className);
    this.domCache.layers[to].classList.add(className);

    if (this.domCache.layers[(from - 1)]) {
      this.domCache.layers[(from - 1)].classList.remove('is-before');
    }

    if (this.domCache.layers[(to - 1)]) {
      this.domCache.layers[(to - 1)].classList.add('is-before');
    }
  }

  activateSlide(index) {
    const className = 'is-active';
    const from = this.domCache.slides[this.activeLayer];
    const fromContent = this.domCache.contents[this.activeLayer];
    const to = this.domCache.slides[index];
    const toContent = this.domCache.contents[index];

    from.classList.remove(className);
    to.classList.add(className);

    if (this.hasSlider()) {
      this.slider.select(index);
    } else {
      fromContent.style.height = '0px';
      toContent.style.height = `${toContent.scrollHeight}px`;
      this.activateLayer(index);

      setTimeout(() => {
        this.fixHeight();
      }, 1000);
    }
  }

  fixHeight() {
    if (this.scrollHeight <= this.height) {
      return;
    }

    this.style.height = `${this.scrollHeight}px`;
    this.height = this.scrollHeight;
  }

  hasSlider() {
    if (window.isEmpty(this.slider)) {
      return false;
    }

    return true;
  }
}

customElements.define('mattress-layers', MattressLayers);