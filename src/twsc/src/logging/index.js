import Logger from 'js-logger';
import Bugsnag from '@bugsnag/js';

function logger() {
  Logger.setHandler((messages, context) => {
    for (const message of messages) {
      Bugsnag.notify(message, (event) => {
        event.severity = context.level;
      });
    }
  });

  return Logger;
}

export default logger;
