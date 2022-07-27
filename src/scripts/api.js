class API {
  constructor(baseURL, options) {
    const url = document.createElement('a');
    url.href = baseURL;
    this.baseURL = `${url.protocol}//${url.host}`;
    this.path = url.pathname;
    this.uuid = '';
    this.options = {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    this.next = {};

    Object.assign(this.options, options);
  }

  get hasSnowplow() {
    return (this.uuid.length > 0);
  }

  set snowplowID(uuid) {
    this.uuid = uuid;
  }

  profile() {
    if (!this.uuid) {
      return Promise.reject(
        new Error('Missing UUID'),
      );
    }

    return this._get(`/profiles/${this.uuid}`);
  }

  feed(_params) {
    const params = typeof _params === 'undefined' ? {} : _params;
    const signature = hash({
      method: 'feed',
      ...params,
    });
    const next = signature in this.next
      ? this.next[signature]
      : '/feed';

    if (next === null) {
      return Promise.resolve([]);
    }

    if (this.uuid) {
      params.id = this.uuid;
    }

    return this._get(next, params)
      .then((data) => {
        this.next[signature] = data.next;
        return data;
      });
  }

  event(payload) {
    if (!this.uuid) {
      return Promise.reject(
        new Error('Missing UUID'),
      );
    }

    return this._post('/events', {
      uuid: this.uuid,
      ...payload,
    });

    // TODO: silently handle errors on api.events e.g. 422
  }

  quiz() {
    return this._get('/quiz/default');
  }

  submitQuiz(payload) {
    if (!this.uuid) {
      return Promise.reject(
        new Error('Missing UUID'),
      );
    }

    return this._post('/quiz/submissions', {
      profile: this.uuid,
      ...payload,
    });
  }

  _get(endpoint, params) {
    const url = new URL(`${this.path}${endpoint}`, this.baseURL);

    if (typeof params !== 'undefined') {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    const options = {
      method: 'GET',
    };

    Object.assign(options, this.options);

    return fetch(url, options).then((response) => response.json());
  }

  _post(endpoint, payload) {
    const url = new URL(`${this.path}${endpoint}`, this.baseURL);

    const options = {
      method: 'POST',
      body: JSON.stringify(payload),
    };

    Object.assign(options, this.options);

    return fetch(url, options).then((response) => {
      const contentType = response.headers.get('content-type');
      return (contentType && contentType.indexOf('application/json') !== -1)
        ? response.json()
        : response.text();
    });
  }
}
