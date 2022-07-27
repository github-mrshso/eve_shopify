
// Snowplow
function spFactory() {
  const ns = 'iglu:uk.co.evesleep';
  const schemas = {
    shareArticle: {
      name: 'twsc_share_article',
      version: '1-0-0',
      members: ['handle', 'journey', 'phase', 'pillar', 'type'],
    },
    likeArticle: {
      name: 'twsc_like_article',
      version: '2-0-0',
      members: ['handle', 'journey', 'phase', 'pillar', 'type', 'like'],
    },
    readArticle: {
      name: 'twsc_read_article',
      version: '1-0-0',
      members: ['handle', 'journey', 'phase', 'pillar', 'type'],
    },
    quizStep: {
      name: 'twsc_quiz',
      version: '1-0-2',
      members: [
        'isEntry',
        'isFinal',
        'questionID',
        'question',
        'answerID',
        'answer',
        'answerPillars',
      ],
    },
  };
  const maxTimeout = 4000;
  let uuid = '';

  function _prunePayload(payload, members) {
    return members.reduce((acc, member) => {
      acc[member] = payload[member];
      return acc;
    }, {});
  }

  function _formatPayload(payload) {
    return {
      ...payload,
      journey: isNaN(Number(payload.journey))
        ? payload.journey
        : Number(payload.journey),
    };
  }

  function _post(schemaKey, payload) {
    const {name, version, members} = schemas[schemaKey] || {};
    let data = payload;

    if (uuid.length === 0) {
      return false;
    }

    if (typeof schemas[schemaKey] === 'undefined') {
      Bugsnag.notify(`Unknown snowplow schema key: ${schemaKey}`);
      return false;
    }

    data = _prunePayload(data, members);
    data = _formatPayload(data);

    if (typeof snowplow !== 'undefined') {
      return snowplow('trackSelfDescribingEvent', {
        schema: `${ns}/${name}/jsonschema/${version}`,
        data,
      });
    }
  }

  function shareArticle(payload) {
    return _post('shareArticle', payload);
  }

  function likeArticle(payload) {
    return _post('likeArticle', {
      ...payload,
      like: true,
    });
  }

  function unlikeArticle(payload) {
    return _post('likeArticle', {
      ...payload,
      like: false,
    });
  }

  function readArticle(payload) {
    return _post('readArticle', payload);
  }

  function quizStep(payload) {
    return _post('quizStep', payload);
  }

  function readCookie() {
    // https://bit.ly/3ldqlv1
    const cookieName = '_sp_';
    const matcher = new RegExp(`${cookieName}id\\.[a-f0-9]+=([^;]+);?`);
    const match = document.cookie.match(matcher);

    if (match && match[1]) {
      return match[1].split('.')[0];
    } else {
      return false;
    }
  }

  function pollUUID() {
    return new Promise((resolve, reject) => {
      let intervalTimer = null;
      const timeoutTimer = setTimeout(() => {
        clearInterval(intervalTimer);
        reject(
          new Error(`Snowplow cookie not available after ${maxTimeout}ms`),
        );
      }, maxTimeout);

      intervalTimer = setInterval(() => {
        uuid = readCookie();

        if (uuid) {
          resolve(uuid);
          clearInterval(intervalTimer);
          clearTimeout(timeoutTimer);
        }
      }, 100);

      if (uuid) {
        resolve(uuid);
        clearInterval(intervalTimer);
        clearTimeout(timeoutTimer);
      }
    });
  }

  async function getUUID() {
    try {
      uuid = await pollUUID();
      return uuid;
    } catch (err) {
      throw new Error(err);
    }
  }

  return Object.freeze({
    get hasSnowplow() {
      return (uuid.length === 0);
    },
    getUUID,
    shareArticle,
    likeArticle,
    unlikeArticle,
    readArticle,
    quizStep,
  });
}

export default spFactory();
