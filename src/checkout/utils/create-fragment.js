/**
 * Creates a document fragment from an html string.
 *
 * https://love2dev.com/blog/inserting-html-using-createdocumentfragment
 * -instead-of-using-jquery/
 *
 * @param      {string}  html    The html string
 * @return     {Node}    A document fragment from the html string
 */
function createFragmentFromHTML(html) {
  const frag = document.createDocumentFragment();
  const temp = document.createElement('div');

  temp.innerHTML = html.trim();

  while (temp.firstChild) {
    frag.appendChild(temp.firstChild);
  }

  return frag;
}

export default createFragmentFromHTML;
