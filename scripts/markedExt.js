/**
 * Footnote link [^_ftn1234]
 * Footnote [^_ftn1234]: Text...
 */
const FOOTNOTE_REGEX = /\[\^_ftn(\d+)]:/;
const FOOTNOTE_LINK_REGEX = /\[\^_ftn(\d+)]/;

/**
 * Footnote custom renderer.
 */
function processFootnotes(text) {
  if (FOOTNOTE_REGEX.test(text.slice(0, 12))) {
    const number = FOOTNOTE_REGEX.exec(text.slice(0, 12))[1];
    const ftn = `
        <a class="Article__link" href="#ftn-link-${number}">
          [${number}]
        </a>
      `;
    
    return `
        <p class="Article__footnote" id="ftn-${number}">
          ${text.replace(FOOTNOTE_REGEX, ftn)}
        </p>
      `;
  }
  
  return `<p>${text}</p>`;
}


/**
 * Footnote link custom renderer.
 */
function processFootnoteLinks(text) {
  if (FOOTNOTE_LINK_REGEX.test(text)) {
    const number = FOOTNOTE_LINK_REGEX.exec(text)[1];
    return `
        <div class="Article__foot-link-container" id="ftn-link-${number}">
          <a class="Article__link" href="#ftn-${number}">
            [${number}]
          </a>
        </div>
      `;
  }
  
  return `<p>${text}</p>`;
}


/**
 * Ignore H1 tag.
 */
function ignoreTitle(text, depth) {
  return depth === 1 ? '' : `<h${depth}>${text}</h${depth}>`;
}


/**
 * Emphasis custom renderer. Sets 'class' attribute over timestamps and the rest of EM tags.
 */
function markTimeStamps(text) {
  return text.startsWith('#') && text.endsWith('#')
    ? `<em data-type="time">${text}</em>`
    : `<em>${text}</em>`;
}


/**/
module.exports = {
  footnotesRenderer: {
    paragraph: processFootnotes
  },
  textRenderer: {
    em: markTimeStamps,
    heading: ignoreTitle,
    paragraph: processFootnoteLinks
  }
};
