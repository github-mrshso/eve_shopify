/**
 * This is a compiled JS file.
 * Changes here could be overwritten. 
 * Contact your Shopify developers if changes need to be made.
 */

class FirmnessRating extends HTMLElement {
    constructor() {
        super();
        this.element = this.querySelector(".js-firmness-scale");
        this.init();
    }
    init() {
        addClassWhenVisible(this.element, "is-visible");
    }
}

customElements.define("firmness-rating", FirmnessRating);
