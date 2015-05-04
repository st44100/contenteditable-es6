'use strict'
import rangy from 'rangy'

console.log(rangy);

export class Editor {

  constructor(id = null, options = {}) {
    this.id = id;
    this.editor = null;
    this.empty = true;
    this.options = {};
    let baseOptions = {
      placeholder: 'Type Something...'
    };

    Object.keys(baseOptions).forEach((k) => {
      this.options[k] = options[k] ? options[k] : baseOptions[k];
    })
  }

  createToolbar() {

    if (this.tbar) { return; }
    this.tbar = document.createElement('div');
    let buttons = [
      {
        key: 'h3',
        html: '<div class="toolbar__button">h3</div>',
        action: (e) => console.log('h3 action')
      },
      {
        key: 'bold',
        html: '<div class="toolbar__button"><b>B</b></div>',
        action: (e) => this.onButtonAction('bold')
      }
    ]

    for (var option of buttons) {
      let button = this.createToolbarButton(option);
      this.tbar.appendChild(button);
    }
    this.editor.parentNode.insertBefore(this.tbar, this.editor);
  }

  onButtonAction(e, ...args) {
    e.preventDefault();
    e.stopPropagation();
    this.exec(...arg);
  }

  createToolbarButton(options = null) {
    if (!options) {return;}
    let button = document.createElement('div')
    button.innerHTML = options.html;
    button.addEventListener('click', options.action)
    return button
  }

  createRichEditor() {
    if (this.id == null) {
      throw new Error("Missing ID for editor");
    }
    this.createContentEditable();
    this.createToolbar();
    this.reset();
    this.initEvent();
  }

  createContentEditable() {
    if (this.editor) {return;} //Already initialized.

    this.editor = document.getElementById(this.id);
    this.editor.setAttribute('contentEditable', 'true');
  }

  initEvent() {
    if (!this.editor) {
      throw new Error("Missing editor");
    }

    this.editor.addEventListener('focus', (e) => this.onFocus(e));
    this.editor.addEventListener('change', (e) => this.onChange(e));
    this.editor.addEventListener('blur', (e) => this.onBlur(e));
    this.editor.addEventListener('mouseup', (e) => this.onMouseUp(e));
    this.editor.addEventListener('mousedown', (e) => this.onMouseDown(e));
  }

  reset() {
    this.editor.innerHTML =this.options.placeholder;
    this.value = '';
    this.empty = true;
  }

  setValue(val) {
    this.value = val;
    this.editor.innerHTML =this.value;
    this.empty = false;
  }

  exec(cmd, ...options) {
    document.execCommand(cmd, options);
  }

  onFocus(e) {
    console.log('focus', e);
    if (this.empty) {
      this.editor.innerHTML = '<p><br/></p>';
    }
  }

  onChange(e) {
    console.log('change', e);
  }

  onBlur(e) {
    console.log('blur', e);
    let value = this.editor.innerHTML;

    if (this.stripTag(value) === '') {
      this.reset();
    } else {
      this.setValue(value);
    }
    console.log(this.value);
  }

  onMouseUp(e) {
    this.getSelection();
  }

  onMouseDown(e) {
    this.getSelection();
  }

  getSelection() {
    let selection = window.getSelection();
    let rangySelection = rangy.getSelection();
    console.log('Selection', selection, rangySelection);
  }

  stripTag(str = '') {
    return  str.replace(/<([^>]+)>/ig, '');
  }

}
