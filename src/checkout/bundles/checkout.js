import 'mutation-observer';
import Shipment from '../scripts/shipments';
import EcoTax from '../scripts/eco-tax';
import waitForLoaded from '../utils/wait';
import PhoneValidation from '../scripts/phone-validation';
import translate from '../utils/translations';
import "./checkout.scss";

function initShipping() {
  let shipment;

  try {
    const el = document.querySelector('.js-checkout-content');
    const loading = el.querySelector('[data-poll-refresh]');
    const ctx = contextualise('checkout');

    if (loading !== null) {
      return null;
    }

    if (shipment) {
      shipment.cleanup();
    }

    shipment = new Shipment(el, ctx);
    shipment.init();

    return true;
  } catch (e) {
    Bugsnag.notify('Stopping GFS', (err) => {
      err.addMetadata('diagnostic', {reason: e.message});
    });

    return false;
  }
}

function initPayment() {
  const el = document.querySelector('form[data-payment-form]');
  const ctx = contextualise('payment');
  const provider = ctx.financeProvider;
  const threshold = parseInt(ctx.financeThreshold, 10);
  const cartPrice = Shopify.Checkout.estimatedPrice;
  const timeout = parseInt(ctx.financeTimeout, 10);

  if (!ctx.financeEnabled) {
    return null;
  }

  if (!threshold) {
    Bugsnag.notify('Finance threshold is invalid', (err) => {
      err.addMetadata('diagnostic', {threshold});
    });

    return null;
  }

  if (!timeout) {
    Bugsnag.notify('Finance timeout is invalid', (err) => {
      err.addMetadata('diagnostic', {timeout});
    });

    return null;
  }

  if (cartPrice >= threshold) {
    switch (provider) {
      case 'divido':
        waitForLoaded(
          el,
          '[data-calculator-widget]',
          () => {
            // console.log('Finance option loaded');
          },
          (duration) => {
            Bugsnag.notify(
              'Divido has not loaded in time',
              (err) => {
                err.addMetadata('diagnostic', {duration: `${duration}s`});
              },
            );
          },
          (duration) => {
            Bugsnag.notify(
              'Divido loaded after all',
              (err) => {
                err.addMetadata('diagnostic', {duration: `${duration}s`});
              },
            );
          },
          ctx.financeTimeout,
        );
        break;
      case 'alma':
        // Nothing to do for now
        break;
      default:
        Bugsnag.notify('Unknown financing provider', (err) => {
          err.addMetadata('diagnostic', {provider});
        });

        return null;
    }

    return true;
  }

  return true;
}

function initContact() {
  const observer = new MutationObserver(() => {
    const el = document.querySelector('#shipping_cc_search_input');
    const caption = document.createElement('p');

    if (el === null) {
      return null;
    }

    caption.classList.add('form__caption');
    caption.textContent = translate('enter_address');
    el.parentNode.insertBefore(caption, el.nextSibling);

    observer.disconnect();

    return true;
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Setup phone number validation
  const phoneValidation = new PhoneValidation(
    '[data-step="contact_information"]',
  );

  phoneValidation.init();
}

(($) => {
  $(document).on('page:load page:change', () => {
    if (Shopify.Checkout.step === 'shipping_method') {
      initShipping();
    }

    if (Shopify.Checkout.step === 'payment_method') {
      initPayment();
    }

    if (Shopify.Checkout.step === 'contact_information') {
      initContact();
    }
  });

  if (theme.settings.region === 'fr') {
    const selector = '[data-order-summary-section="line-items"]';
    const ctx = contextualise('ecoTax');
    const ecoTax = new EcoTax(selector, ctx);

    $(document).on('page:load', () => {
      ecoTax.init();
      return true;
    });

    $(document).on('page:change', () => {
      ecoTax.appendEcoTaxTotal();
      return true;
    });
  }
})(Checkout.$);
