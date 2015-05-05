contentEditable with es6, jspm
===

Testing contentEditable, es6 + babel, jspm + systemjs.

```
$ npm install
$ jspm install
$ gulp watch
```
USAGE
---

### HTML:

```index.html
<div id="editor" contentEditable="true"></div>
```

### JavaScript:

```index.js
import {Editor} from './editor/editor'

let MyEditor = new Editor('editor');
MyEditor.createRichEditor();
```

RichEditor will render to `div#editor`.

log
---

- guardian/scribe is not compatible with systemjs.
- Give up to use guardian/scribe.

