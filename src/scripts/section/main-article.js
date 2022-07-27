class MainArticle extends HTMLElement {
  constructor() {
    super();

    const { twscEnabled, remURL } = contextualise('article');

    if (!twscEnabled) {
      return;
    }

    this.api = new API(remURL);

    // Snowplow
    this.SP = window.SP();

    this.init();
  }

  toggleQuizBlock() {
    this.api.profile()
      .then((profile) => {
        quizBlock.hidden = profile.has_quiz;
        return profile;
      })
      .catch((err) => {
        Bugsnag.notify(err);
      });
  }

  init() {
    this.SP.getUUID()
      .then((uuid) => {
        this.api.snowplowID = uuid;

        this.SP.readArticle(meta);

        this.toggleQuizBlock();

        return uuid;
      })
      .catch((err) => {
        Bugsnag.notify(err);
      });
  }
}

if (!customElements.get('main-article')) {
  customElements.define("main-article", MainArticle);
}
