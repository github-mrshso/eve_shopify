function formatWithDelimiters(
  number, precision = 2, thousands = ',', decimal = '.',
) {
  if (isNaN(number) || number == null) {
    return 0;
  }

  const parts = (number / 100.0).toFixed(precision).split('.');
  const dollars = parts[0]
    .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1 ${thousands}`);
  const cents = parts[1] ? (decimal + parts[1]) : '';

  return dollars + cents;
}

function formatMoney(cents, format) {
  const centsValue = (typeof cents === 'string')
    ? cents.replace('.', '')
    : cents;
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  const formatString = format || theme.settings.moneyFormat;
  let value = '';

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(centsValue, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(centsValue, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(centsValue, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(centsValue, 0, '.', ',');
      break;
    case 'amount_no_decimals_with_space_separator':
      value = formatWithDelimiters(centsValue, 0, ' ');
      break;
    case 'amount_no_round_decimals':
      value = formatWithDelimiters(centsValue, (centsValue % 100 > 0 ? 2 : 0));
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

export default formatMoney;
