import {Editor} from './editor/editor'

let MyEditor = new Editor('editor');
MyEditor.createRichEditor();


/**
 * Dummy controller for debug.
 */
class DebugCtrl {
  constructor(target, editor) {
    this.editor = editor;
    this.element = document.getElementById(target);
      this.createTextArea();

    this.editor.editor.addEventListener('editor.change', (e) => {
      this.textArea.innerHTML = this.editor.value;
    });
  }

  createTextArea() {
    this.textArea = document.createElement('textarea');
    this.textArea.setAttribute('style', 'height:100%; width:100%;');
    this.element.appendChild(this.textArea);
  }
}

let EditorDebugger = new DebugCtrl('console', MyEditor);
