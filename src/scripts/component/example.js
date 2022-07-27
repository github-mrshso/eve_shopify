class Example extends HTMLElement {
  constructor() {
    super();

    this.elements = {
      mchammer: this.querySelector("[data-mchammer]")
    };

    this.elements.mchammer.addEventListener("mouseleave", this.psych.bind(this))
    this.elements.mchammer.addEventListener("mouseenter", this.psych.bind(this))
  }

  psych() {
    if (this.elements.mchammer.innerHTML == "Can't not touch this!") {
      this.elements.mchammer.innerHTML = "Can't touch this!"
    } else {
      this.elements.mchammer.innerHTML = "Can't not touch this!"
    }
  }
}

customElements.define("component-example", Example);
