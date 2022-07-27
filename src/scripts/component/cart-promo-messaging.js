/**
 * Component: Promo Messaging Cart
 * --------------------------------------------------------------
 * @namespace CartPromoMessaging
 */

class CartPromoMessaging extends HTMLElement {
    constructor() {
        super();

        this.notificationTemplate = '[js-promo-messaging="notification"]';
        this.nodeSelectors = {
            cartContainer: document.querySelector('#main-cart-items'),
            cartDrawer: document.querySelector('#cart-drawer'),
            drawerContainer: document.querySelector('#cart-drawer-body'),
        };
        this.promoMessage = '';

        this.addEventListener('update', this.getNotifications.bind(this))

        this.init();
    }

    buildNotifications(response) {
        let container;

        if (!response.items) {
            return;
        }

        const freeGift = response.items
            .map((item) => (item.properties ? item.properties.__free_gift : null))
            .filter((item) => item);

        if (this.nodeSelectors.cartContainer) {
            container = this.nodeSelectors.cartContainer;
        } else {
            container = this.nodeSelectors.cartDrawer;
        }

        const notifActive = container.querySelector(this.notificationTemplate);

        const uniqFreeGiftArray = [...new Set(freeGift)];

        if (uniqFreeGiftArray.length > 0) {
            if (notifActive && !notifActive.classList.contains('error')) {
                return;
            }
            this.deleteNotifications();
            this.postNotifications('added', uniqFreeGiftArray);
        } else if (this.promoMessage && this.promoMessage.length > 0) {
            this.deleteNotifications();
            this.postNotifications('removed', uniqFreeGiftArray);
        }
    }

    async getNotifications(response) {
        let notifications = response;

        if (!notifications) {
            await fetch(`${routes.cart_url}`, getConfig())
                .then((response) => response.json())
                .then((response) => {
                    notifications = response;
                });
        }

        this.buildNotifications(notifications)
    }


    init() {    
        this.getNotifications();      
        
        window.gwp.EventBus.listen('AjaxCart:updated', (response) => {
            this.getNotifications(response);
        });
    }
  
    /**
     * Unscape string
     */
    renderUnsupportedCharacters(message) {
      const e = document.createElement('div');
      e.innerHTML = message;
      return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
    }
  
    /**
     * Posts a notification to cart drawer/table.
     */
    postNotifications(state, freeGift) {
        const notification = document.createElement('div');
        let title = this.renderUnsupportedCharacters(
            theme.strings.free_gift_added.replace('{{ gift }}', freeGift),
        );
        let container = this.nodeSelectors.drawerContainer;
  
        if (state === 'removed') {
            title = theme.strings.free_gift_removed.replace(
                '{{ gift }}', this.promoMessage,
            );
            notification.classList.add('error');
        }

        if (this.nodeSelectors.cartContainer) {
            container = this.nodeSelectors.cartContainer;
            notification.classList.add('cart-page');
        }

        notification.classList.add(
            'notification',
            'appear-animation',
            'appear-delay-1',
        );
  
        notification.style.opacity = '0';
        notification.setAttribute('js-promo-messaging', 'notification');
        const notifScript = document.getElementById('promo-messaging-template');
        if (!notifScript) { return; }
  
        const notifTemplate = window.handlebars.compile(notifScript.innerHTML);
        notification.innerHTML = notifTemplate({title}).replace(freeGift, `<span>${freeGift}</span>`)
    
        this.promoMessage = freeGift;
        container.insertAdjacentElement('beforebegin', notification);

        
    
        window.setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);
  
        if (state === 'removed') {
            window.setTimeout(() => {
                notification.style.opacity = '0';
            }, 4000);
    
            window.setTimeout(() => {
                this.deleteNotifications();
            }, 4850);
        }
    }
  
    /**
     * Deletes all notifications.
     */
    deleteNotifications() {
        const items = [...document.querySelectorAll(this.notificationTemplate)];
  
        items.forEach((notification) => {
            notification.remove();
        });
    }
}

if (!customElements.get('cart-promo-messaging')) {
    customElements.define('cart-promo-messaging', CartPromoMessaging);
}
