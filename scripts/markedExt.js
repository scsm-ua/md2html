const { REGEXP } = require('./const');

/**
 * Footnote custom renderer.
 */
function processFootnotes(text) {
  if (REGEXP.FOOTNOTE_REGEXP.test(text.slice(0, 12))) {
    const number = REGEXP.FOOTNOTE_REGEXP.exec(text.slice(0, 12))[1];
    const ftn = `
        <a class="Article__link" href="#ftn-link-${number}">
          [${number}]
        </a>
      `;
    
    return `
        <p class="Article__footnote" id="ftn-${number}">
          ${text.replace(REGEXP.FOOTNOTE_REGEXP, ftn)}
        </p>
      `;
  }
  
  return `<p>${text}</p>`;
}


/**
 * Footnote link custom renderer.
 */
function processFootnoteLinks(text) {
  if (REGEXP.FOOTNOTE_LINK_REGEXP.test(text)) {
    const update = text.replaceAll(REGEXP.FOOTNOTE_LINK_REGEXP, linkRenderer);
    return `<p>${update}</p>`;
  }
  
  return `<p>${text}</p>`;
}


/**
 *
 */
function linkRenderer(_, number) {
  return `
    <a class="Article__link Article__foot-link" href="#ftn-${number}" id="ftn-link-${number}">
      [${number}]
    </a>
  `;
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
