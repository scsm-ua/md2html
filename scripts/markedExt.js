/**
 * Footnote link [^_ftn1234]
 * Footnote [^_ftn1234]: Text...
 */
const FOOTNOTE_LINK_START = '[^_ftn';
const FOOTNOTE_LINK_END = ']';
const FOOTNOTE_END = ']:';
const FOOTNOTE_REGEX = /\[\^_ftn(\d+)]:/;


/**
 * Footnote custom renderer.
 */
function processFootnotes(text) {
  if (
    text.trimStart().startsWith(FOOTNOTE_LINK_START) &&
    FOOTNOTE_REGEX.test(text.slice(0, 12))
  ) {
    const number = FOOTNOTE_REGEX.exec(text.slice(0, 12))[1];
    const ftn = `
        <a class="Article__link" href="#ftn-link-${number}">
          [${number}]
        </a>
      `;
    
    const content = text.replace(FOOTNOTE_LINK_START + number + FOOTNOTE_END, ftn);
    return `
        <p class="Article__footnote" id="ftn-${number}">
          ${content}
        </p>
      `;
  }
  
  return `<p>${text}</p>`;
}


/**
 * Footnote link custom renderer.
 */
function processFootnoteLinks(text) {
  if (
    text.trimStart().startsWith(FOOTNOTE_LINK_START) &&
    text.slice(0, 12).trimEnd().endsWith(FOOTNOTE_LINK_END)
  ) {
    const number = /\d+/.exec(text);
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
