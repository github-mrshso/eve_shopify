class CollectionColourSwatches extends HTMLElement {
    constructor() {
      super();
      this.card = this.closest('.card-with-swatches');
      this.images = this.card.querySelectorAll('.collection-colour-image');
      this.swatches = this.querySelectorAll('a.colour-swatch');

      this.swatches.forEach(swatch => {
        swatch.addEventListener('mouseenter', this.showSwatchImage.bind(this, swatch));
        swatch.addEventListener('mouseleave', this.hideSwatchImage.bind(this, swatch));
      });
    }

    showSwatchImage(swatch) {
      const swatchColourHandle = swatch.getAttribute('swatch-handle');
      if (!swatchColourHandle) return;

      this.images.forEach(image => {
        if (image.getAttribute('swatch-handle') == swatchColourHandle) {
          image.classList.add('is-active');
        } else {
          image.classList.remove('is-active');
        }
      })
    }

    hideSwatchImage(swatch) {
      const swatchColourHandle = swatch.getAttribute('swatch-handle');
      if (!swatchColourHandle) return;
      this.images.forEach(image => {
        if (image.getAttribute('swatch-handle') == swatchColourHandle) {
          image.classList.remove('is-active');
        }
      })
    }
  }
  
  customElements.define('collection-colour-swatches', CollectionColourSwatches);
  