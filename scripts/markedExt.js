/**/
const FOOTNOTE_LINK_START = '[^_ftn';
const FOOTNOTE_LINK_END = ']';
const FOOTNOTE_END = ']:';
const FOOTNOTE_REGEX = /\[\^_ftn(\d+)]:/;

/**
 * Emphasis custom renderer.
 */
function em(text) {
  return text.startsWith('#') && text.endsWith('#')
    ? `<em class="Article__time">${text}</em>`
    : `<em class="Article__italic">${text}</em>`;
}

/**
 * Paragraph custom renderer.
 */
function paragraph(text) {
  const ftnStartCondition = text.trimStart().startsWith(FOOTNOTE_LINK_START);
  
  // Footnote links.
  if (ftnStartCondition && text.slice(0, 12).trimEnd().endsWith(FOOTNOTE_LINK_END)) {
    const number = /\d+/.exec(text);
    return `
        <div class="Article__foot-link-container" id="ftn-link-${number}">
          <a class="Article__link" href="#ftn-${number}">
            [${number}]
          </a>
        </div>
      `;
  }
  
  // Footnotes.
  if (ftnStartCondition && FOOTNOTE_REGEX.test(text.slice(0, 12))) {
    // console.log('+++++' + text + '+++++');
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
 * Override function for MD blocks.
 */
const renderer = { em, paragraph };

/**/
module.exports = { htmlRenderer: renderer };
