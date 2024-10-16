/**
 *
 */
function createHtmlOutput({ footnotes, meta, title, text }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <link rel="stylesheet" href="../styles.css">
      <!-- For the old articles -->
      <link rel="stylesheet" href="../../styles.css">
    </head>
    
    <body>
      <main>
        <div class="Meta">
          <details>
            <summary>Meta data</summary>
            <pre><code>${JSON.stringify(meta, null, 2)}</code></pre>
          </details>
        </div>
        
        <div class="Article">
          <h1>${title}</h1>
          <div>${text}</div>
          <div class="Article__footnotes">${footnotes}</div>
        </div>
      </main>
    </body>
    </html>
  `;
}


/**
 *
 */
function createJsonOutput({ footnotes, meta, title, text }) {
  return JSON.stringify({
    meta: meta,
    title,
    text,
    footnotes
  }, null, 2);
}

/**/
module.exports = { createHtmlOutput, createJsonOutput };
