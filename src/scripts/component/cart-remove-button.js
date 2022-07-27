class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', async (event) => {
      event.preventDefault();

      if (this.closest('cart-items')) {
        this.closest('cart-items').updateQuantity(this.dataset.index, 0);
        this.dispatchEvent(new Event('cartRemove', { bubbles: true }))
        return;
      }

      if (this.closest('cart-drawer')) {
        await this.closest('cart-drawer').updateQuantity({
          line: this.dataset.index,
          quantity: 0,
        });
        this.dispatchEvent(new Event('cartRemove', { bubbles: true }))
        return;
      }
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);
