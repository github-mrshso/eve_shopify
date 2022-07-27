function markdown(str, el = 'p') {
  return str
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^(?![-><])(.*)$/gim, (el ? `<${el}>$1</${el}>` : '$1'))
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*([^*]*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*([^*]*)\*/gi, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    .replace(/^-\s+(.*$)/gmi, '<li>$1</li>')
    .replace(/^(<li>(.|\n)*<\/li>)/gim, '<ul>$1</ul>')
    .replace(/\n$/gim, '<br />')
    .trim();
}

export default markdown;

