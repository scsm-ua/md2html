const { REGEXP } = require('./const');

/**/
const TEMPORARY_INSERT = '@#@';

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


/**
 *
 */
function preprocessText(markdown) {
  return markdown.replaceAll(REGEXP.VERSE_FOOTNOTE_REGEXP, (match) =>
    match.replace('\n', ' ') + '\r' + TEMPORARY_INSERT
  );
}


/**
 *
 */
function postprocessText(html) {
  return html.replaceAll(`<p>${TEMPORARY_INSERT}</p>`, '');
}

/**
 *
 */
function processVerse(text) {
  const ftnPosition = text.search(REGEXP.FOOTNOTE_LINK_REGEXP);
  
  if (ftnPosition < 0) return `
    <div class="Article__verse">
      <pre><code>${text}</code></pre>
    </div>
  `;
  
  const verse = text.slice(0, ftnPosition).trimEnd();
  const ftn = text.slice(ftnPosition);
  let ftnNumber;
  
  const anchor = ftn.replaceAll(REGEXP.FOOTNOTE_LINK_REGEXP, (_, number) => {
    ftnNumber = number;
    return `
      <a class="Article__link Article__foot-link" href="#ftn-${number}">
        [${number}]
      </a>
    `;
  });
  
  return `
    <div class="Article__verse-wrapper" id="ftn-link-${ftnNumber}">
      <div class="Article__verse">
        <pre><code>${verse}</code></pre>
      </div>
      
      <div class="Article__verse-ref">${anchor}</div>
    </div>
  `;
}


/**/
module.exports = {
  footnotesRenderer: {
    paragraph: processFootnotes
  },
  preprocessText,
  postprocessText,
  textRenderer: {
    code: processVerse,
    em: markTimeStamps,
    heading: ignoreTitle,
    paragraph: processFootnoteLinks
  }
};
