class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.content = this.mainDetailsToggle.querySelector('summary').nextElementSibling;
    this.megamenu = this.querySelector('.megamenu');

    this.mainDetailsToggle.addEventListener('focusout', this.onFocusOut.bind(this));
    this.mainDetailsToggle.addEventListener('toggle', this.onToggle.bind(this));

    if (this.megamenu) {
      this.megamenu.addEventListener('mouseleave', this.close.bind(this));
    }

    if (this.dataset.hoverable) {      
      this.mainDetailsToggle.addEventListener('mouseenter', this.open.bind(this));
      this.mainDetailsToggle.addEventListener('mouseleave', this.close.bind(this));
    }


  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    })
  }

  onToggle() {
    if (!this.animations) this.animations = this.content.getAnimations();

    if (this.mainDetailsToggle.hasAttribute('open')) {
      this.animations.forEach(animation => animation.play());
    } else {
      this.animations.forEach(animation => animation.cancel());
    }
  }
  
  open() {
    this.mainDetailsToggle.setAttribute('open', true);
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', true);
  }

  close() {
    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
  }
}

customElements.define('details-disclosure', DetailsDisclosure);

class HeaderMenu extends DetailsDisclosure {
  constructor() {
    super();
    this.header = document.querySelector('header');
  }

  onToggle() {
    if (document.documentElement.style.getPropertyValue('--header-bottom-position-desktop') !== '') return;
    if (this.header) document.documentElement.style.setProperty('--header-bottom-position-desktop', `${Math.floor(this.header.getBoundingClientRect().bottom)}px`);
  }
}

customElements.define('header-menu', HeaderMenu);
