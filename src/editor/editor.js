'use strict'
import rangy from 'rangy'

console.log(rangy);

function extend(dest, src) {
  Object.keys(src).forEach((k) => {
    dest[k] = src[k];
  });
  return dest;
}

export class Editor {

  constructor(id = null, options = {}) {
    this.id = id;
    this.editor = null;
    this.empty = true;
    this.value = '';
    this.options = {};
    let baseOptions = {
      placeholder: 'Type Something...',
      buttons:[
        {
          key: 'h2',
          html: '<button class="btn btn-default">H2</button>',
          action: (e) => this.onButtonAction(e, 'formatBlock', false, '<h2>')
        },
        {
          key: 'h3',
          html: '<button class="btn btn-default">H3</button>',
          action: (e) => this.onButtonAction(e, 'formatBlock', false, '<h3>')
        },
        {
          key: 'h4',
          html: '<button class="btn btn-default">H4</button>',
          action: (e) => this.onButtonAction(e, 'formatBlock', false, '<h4>')
        },
        {
          key: 'h5',
          html: '<button class="btn btn-default">H5</button>',
          action: (e) => this.onButtonAction(e, 'formatBlock', false, '<h5>')
        },
        {
          key: 'bold',
          html: '<button class="btn btn-default"><b>B</b></button>',
          action: (e) => this.onButtonAction(e, 'bold', false, null)
        },
        {
          key: 'italic',
          html: '<button class="btn btn-default"><i>I</i></button>',
          action: (e) => this.onButtonAction(e, 'italic', false, null)
        },
        {
          key: 'underline',
          html: '<button class="btn btn-default"><u>U</u></button>',
          action: (e) => this.onButtonAction(e, 'underline', false, null)
        },
        {
          key: 'strikethrough',
          html: '<button class="btn btn-default"><s>A</s></button>',
          action: (e) => this.onButtonAction(e, 'strikethrough', false, null)
        },
        //FIXME: DUMMY
        {
          key: 'anchor',
          html: '<button class="btn btn-default">LINK</button>',
          action: (e) => this.onButtonAction(e, 'anchor', false, null)
        },
        //FIXME: DUMMY
        {
          key: 'orderedlist',
          html: '<button class="btn btn-default">OL</button>',
          action: (e) => this.onButtonAction(e, 'orderedlist', false, null)
        },
        //FIXME: DUMMY
        {
          key: 'unorderedlist',
          html: '<button class="btn btn-default">UL</button>',
          action: (e) => this.onButtonAction(e, 'unorderedlist', false, null)
        }
      ]
    };

    // Extend default.
    this.options = extend(baseOptions, options);
  }

  createToolbar() {
    if (this.tbar) { return; }
    this.tbar = document.createElement('div');
    for (var option of this.options.buttons) {
      let button = this.createToolbarButton(option);
      this.tbar.appendChild(button);
    }
    this.editor.parentNode.insertBefore(this.tbar, this.editor);
  }


  createToolbarButton(options = null) {
    if (!options) {return;}
    let button = document.createElement('div')
    button.className = 'tbar__btn'
    button.innerHTML = options.html;
    button.addEventListener('click', options.action);
    button.addEventListener('mousedown', (e) => e.preventDefault()); //canceling contentEditable will blur.
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

  dispatchEvent(eventName, ...args) {
    let change = new Event(eventName);
    this.editor.dispatchEvent(change);
  }

  setValue(val) {
    this.value = val;
    this.editor.innerHTML =this.value;
    this.empty = false;
    this.dispatchEvent('editor.change')
  }

  updateValue() {
    this.value = this.editor.innerHTML;
    this.dispatchEvent('editor.change')
  }

  exec(cmd, ...options) {
    document.execCommand(cmd, ...options);
    console.log(cmd, ...options);
    this.updateValue();
  }

  onButtonAction(e, ...args) {
    console.log('buttonAction', args);
    e.preventDefault();
    e.stopPropagation();
    this.exec(...args);
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
