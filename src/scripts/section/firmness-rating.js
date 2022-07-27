class FirmnessRating extends HTMLElement {
    constructor() {
        super();
        this.element = this.querySelector(".js-firmness-scale");
        this.init();
    }
    init() {
        window.addClassWhenVisible(this.element, "is-visible");
    }
}

customElements.define("firmness-rating", FirmnessRating);
