class ShareButton extends HTMLElement {
  constructor() {
    super();
    
    // Snowplow
    this.SP = window.SP();

    // Share meta
    this.meta = {...this.dataset};

    // Url to copy to clipboard
    this.url = `${window.location.origin}${this.meta.handle}`;

    // Elements
    this.buttonEls = this.querySelectorAll('[data-share-button]');;

    this.buttonEls.forEach(
      (el) => el.addEventListener('click', this.handleClick.bind(this)),
    );

    this.state = {
      isShared: false,
      isError: false,
    };
  }

  handleClick() {
    if (this.state.isSharing) {
      return false;
    }

    this.updateState('shared');

    return navigator.clipboard.writeText(this.url)
      .then(() => {
        setTimeout(() => {
          this.updateState('reset');
        }, 2000);

        // Snowplow tracking
        switch (this.meta.share) {
          case "article":
            this.SP.shareArticle(this.meta);
            break;
          default:
            break;
        }

        return true;
      })
      .catch((err) => {
        this.updateState('error');
        return false;
      });
  }

  updateState(state) {
    switch (state) {
      case 'shared':
        this.state.isSharing = true;
        break;
      case 'reset':
        this.state.isSharing = false;
        break;
      case 'error':
        this.state.isSharing = false;
        this.state.isError = true;
        break;
      default:
        this.state.isSharing = false;
        break;
    }

    this.buttonEls.forEach((el) => {
      el.classList.toggle('is-loading', this.state.isSharing);
      el.classList.toggle('is-error', this.state.isError);
      el.disabled = this.state.isSharing;
    });
  }
};

if (!customElements.get('share-button')) {
  customElements.define('share-button', ShareButton);
}
