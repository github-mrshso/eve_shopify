import translate from '../utils/translations';

class EcoTax {
  constructor(el, config) {
    this.el = document.querySelector(el);
    this.productList = [...this.el.children];
    this.currency = config.currency;
    this.ecoTaxValues = config.ecoTax;

    this.productLabel = translate('eco_tax_product_label');
    this.orderSummaryTotal = translate('order_summary_total');

    this.selectors = {
      products: '[data-order-summary-section="line-items"]',
      productDescription: '.product__description',
      totalPriceTable: '.payment-due-label',
    };

    this.elementStyles = {
      productDesriptionVariant: 'product__description__variant',
      orderSummarySmallText: 'order-summary__small-text',
      taxLabel: 'payment-due-label__taxes',
    };
  }

  init() {
    this.appendEcoTaxValues();
    this.appendEcoTaxTotal();
  }

  appendEcoTaxValues() {
    this.productList.forEach((element, index) => {
      const productEcoTaxValue = this.ecoTaxValues[index].eco_tax;
      const productQuantity = Number(this.ecoTaxValues[index].quantity);
      const totalEcoTaxValue = productEcoTaxValue * productQuantity;

      if (productEcoTaxValue !== 0) {
        const description = element.querySelector(
          this.selectors.productDescription,
        );
        const ecoTaxProductLabel = document.createElement('span');

        ecoTaxProductLabel.classList.add(
          this.elementStyles.productDesriptionVariant,
          this.elementStyles.orderSummarySmallText,
        );
        ecoTaxProductLabel.innerHTML = this.formatEcoTaxCaption(
          totalEcoTaxValue,
          this.productLabel,
        );
        description.appendChild(ecoTaxProductLabel);
      }
    });
  }

  appendEcoTaxTotal() {
    const total = this.ecoTaxValues.reduce(this.getTotal, 0);
    const totalEcoTaxCaption = this.formatEcoTaxCaption(
      total,
      this.orderSummaryTotal,
    );
    const totalPriceTable = document.querySelectorAll(
      this.selectors.totalPriceTable,
    );

    totalPriceTable.forEach((table) => {
      const totalEcoTaxLabel = document.createElement('span');

      totalEcoTaxLabel.classList.add(
        this.elementStyles.taxLabel,
        this.elementStyles.orderSummarySmallText,
      );
      totalEcoTaxLabel.innerHTML = totalEcoTaxCaption;
      table.appendChild(totalEcoTaxLabel);
    });
  }

  currencyFormatter(value) {
    return value.toLocaleString('en', {
      useGrouping: false,
      minimumFractionDigits: 2,
    });
  }

  formatEcoTaxCaption(value, label) {
    const currencySymbol = this.currency.EUR;
    const newCurrency = this.currencyFormatter(value);

    return `${label}
      <span class="nowrap">${newCurrency} ${currencySymbol}</span>`;
  }

  getTotal(total, value) {
    const quantity = Number(value.quantity);
    const amount = value.eco_tax;
    const productTotal = quantity * amount;

    return total + productTotal;
  }
}

export default EcoTax;
