const { getFootnoteId, getUniqueLinkId, getFtnLinkId, getFootnoteNumber } = require('./helpers');
const { REGEXP } = require('./const');

// Placeholder injected after verse blocks so marked doesn't wrap them in <p> tags.
const TEMPORARY_INSERT = '@#@';

/**
 * Paragraph renderer for footnote definitions ([^id]: ...).
 * Used in ToHTML.js as footnotesRenderer.paragraph.
 * Wraps each definition in <p id="fN"> so back-links can scroll to it.
 */
function processFootnotes(text) {
  if (REGEXP.FOOTNOTE_REGEXP.test(text)) {
    const footnote_id = REGEXP.FOOTNOTE_REGEXP.exec(text)[1];
    // Keep inline to fix whitespaces.
    const ftn = `<a class="Article__link Article__foot-link" href="#${getFootnoteId(footnote_id)}">[${getFootnoteNumber(footnote_id)}]</a>`;
    
    const _text = text.replace(REGEXP.FOOTNOTE_REGEXP, ftn)
      .replace('.md"', '.html"');
    
    return `<p class="Article__footnote" id="${getFootnoteId(footnote_id)}">${_text}</p>`;
  }
  
  return `<p>${text}</p>`;
}


/**
 * Creates a renderer for article body text. Call once per document.
 * linkIdCounts tracks per-footnote reference counts so each back-link
 * gets a unique id: link-fN, link-fN-2, link-fN-3, …
 */
function createTextRenderer() {
  const linkIdCounts = new Map();

  // [^id] → <a> back-link. Inline to avoid extra whitespace.
  function linkRenderer(_, footnote_id) {
    return `<a class="Article__link Article__foot-link" href="#${getFootnoteId(footnote_id)}" id="${getUniqueLinkId(footnote_id, linkIdCounts)}">[${getFootnoteNumber(footnote_id)}]</a>`;
  }

  // Paragraph renderer: replaces [^id] markers with anchors.
  function processFootnoteLinks(text) {
    if (REGEXP.FOOTNOTE_LINK_REGEXP.test(text)) {
      const update = text.replaceAll(REGEXP.FOOTNOTE_LINK_REGEXP, linkRenderer);
      return `<p>${update}</p>`;
    }

    return `<p>${text}</p>`;
  }

  // Code block renderer for verse blocks (fenced code in markdown).
  // A trailing [^id] is split off into a citation div; the wrapper div
  // gets the back-link id via linkIdCounts.
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

    // Citation links have no individual id — the wrapper div carries it.
    const anchor = ftn.replaceAll(REGEXP.FOOTNOTE_LINK_REGEXP, (_, footnote_id) => {
      last_footnote_id = footnote_id;
      // Keep inline to avoid extra whitespace.
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


// Heading renderer. H1 is rendered separately as the post title, so suppress it.
function ignoreTitle(text, depth) {
  return depth === 1 ? '' : `<h${depth}>${text}</h${depth}>`;
}


// Emphasis renderer. *#HH:MM:SS#* → <em data-type="time">; all other <em> pass through.
function markTimeStamps(text) {
  return text.startsWith('#') && text.endsWith('#')
    ? `<em data-type="time">${text}</em>`
    : `<em>${text}</em>`;
}


// Pre-pass: joins trailing footnote refs onto verse code blocks and appends
// TEMPORARY_INSERT so the leftover <p> can be stripped in postprocessText.
function preprocessText(markdown) {
  return markdown.replaceAll(REGEXP.VERSE_FOOTNOTE_REGEXP, (match) =>
    match.replace('\n', ' ') + '\r' + TEMPORARY_INSERT
  );
}


// Post-pass: removes the sentinel <p> tags injected by preprocessText.
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
