const { getFootnoteId, getUniqueLinkId, getFtnLinkId, getFootnoteNumber } = require('./helpers');
const { REGEXP } = require('./const');

/**/
const TEMPORARY_INSERT = '@#@';

/**
 * Footnote custom renderer.
 */
// TODO: how its used?
function processFootnotes(text) {
  if (REGEXP.FOOTNOTE_REGEXP.test(text)) {
    const footnote_id = REGEXP.FOOTNOTE_REGEXP.exec(text)[1];
    // Keep inline to fix whitespaces.
    const ftn = `<a class="Article__link Article__foot-link" href="#${getFootnoteId(footnote_id)}">[${getFootnoteNumber(footnote_id)}]</a>`;
    
    const _text = text.replace(REGEXP.FOOTNOTE_REGEXP, ftn)
      .replace('.md"', '.html"');
    
    // TOOD: can we use `getUniqueLinkId`?
    return `<p class="Article__footnote" id="${getFootnoteId(footnote_id)}">${_text}</p>`;
  }
  
  return `<p>${text}</p>`;
}


/**
 * Creates a stateful text renderer. Must be called once per document so the
 * seenLinkIds Set resets between files.
 */
function createTextRenderer() {
  const linkIdCounts = new Map();

  function linkRenderer(_, footnote_id) {
    // Keep inline to fix whitespaces.
    return `<a class="Article__link Article__foot-link" href="#${getFootnoteId(footnote_id)}" id="${getUniqueLinkId(footnote_id, linkIdCounts)}">[${getFootnoteNumber(footnote_id)}]</a>`;
  }

  function processFootnoteLinks(text) {
    if (REGEXP.FOOTNOTE_LINK_REGEXP.test(text)) {
      const update = text.replaceAll(REGEXP.FOOTNOTE_LINK_REGEXP, linkRenderer);
      return `<p>${update}</p>`;
    }

    return `<p>${text}</p>`;
  }

  function processVerse(text) {
    const ftnPosition = text.search(REGEXP.FOOTNOTE_LINK_REGEXP);

    if (ftnPosition < 0) return `
    <div class="Article__verse">
      <pre><code>${text}</code></pre>
    </div>
  `;

    const verse = text.slice(0, ftnPosition).trimEnd();
    const ftn = text.slice(ftnPosition);
    let last_footnote_id;

    const anchor = ftn.replaceAll(REGEXP.FOOTNOTE_LINK_REGEXP, (_, footnote_id) => {
      last_footnote_id = footnote_id;
      // Keep inline to fix whitespaces.
      return `<a class="Article__link Article__foot-link" href="#${getFootnoteId(footnote_id)}">[${getFootnoteNumber(footnote_id)}]</a>`;
    });

    return `
    <div class="Article__verse-wrapper" id="${getUniqueLinkId(last_footnote_id, linkIdCounts)}">
      <div class="Article__verse">
        <pre><code>${verse}</code></pre>
      </div>
      
      <div class="Article__verse-ref">${anchor}</div>
    </div>
  `;
  }

  return {
    code: processVerse,
    em: markTimeStamps,
    heading: ignoreTitle,
    paragraph: processFootnoteLinks
  };
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

/**/
module.exports = {
  footnotesRenderer: {
    paragraph: processFootnotes
  },
  preprocessText,
  postprocessText,
  createTextRenderer
};
