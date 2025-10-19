const format = require('html-format');
const { Marked } = require('marked');

const { BasicConvertor } = require('./BasicConvertor');
const { footnotesRenderer } = require('../markedExt');
const { validateFtn } = require('../textValidation');

/**/
const footnotesParser = new Marked({ renderer: footnotesRenderer });

/**
 *
 */
class ToHTML extends BasicConvertor {
	/**/
	processFootnotes(slug) {
		if (this.notesStartPosition < 0 || !this.notesMd) {
			this.footnotes = '';
		} else {
			const str = format(footnotesParser.parse(this.notesMd).replace(/^\s+|\s+$/gi, ''));
			validateFtn(str, slug);
			this.footnotes = str;
		}
	}
	
	/**
	 * Public method.
	 * @return {string} - stringified JSON output, formatted.
	 */
	convert() {
		return `
			<!DOCTYPE html>
			<html lang="en">
			
				<head>
					<meta charset="UTF-8">
					<title>${this.title}</title>
					<link rel="stylesheet" href="../styles.css">
					<!-- For the old articles -->
					<link rel="stylesheet" href="../../styles.css">
				</head>
				
				<body>
					<main>
						<div class="Meta">
							<details>
								<summary>Meta data</summary>
								<pre><code>${JSON.stringify(this.meta, null, 2)}</code></pre>
							</details>
						</div>
						
						<div class="Article">
							<h1>${this.title}</h1>
							<div>${this.textHtml}</div>
							<div class="Article__footnotes">${this.footnotes}</div>
						</div>
					</main>
				</body>
			</html>
  	`;
	}
}

/**/
module.exports = { ToHTML };
