'use strict'
import rangy from 'rangy'

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
    this.focus = false;
    this.inputChangeTimer = null;
    this.options = {};
    let baseOptions = {
      placeholder: 'Type Something...',
      buttons:[
        {
         key: 'p',
          html: '<button class="btn btn-default">P</button>',
          action: (e) => this.onButtonAction(e, 'formatBlock', false, '<p>')
        },
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
        {
          key: 'justifyLeft',
          html: '<button class="btn btn-default">LEFT</button>',
          action: (e) => this.onButtonAction(e, 'justifyLeft', false, null)
        },
        {
          key: 'justifyCenter',
          html: '<button class="btn btn-default">CENTER</button>',
          action: (e) => this.onButtonAction(e, 'justifyCenter', false, null)
        },
        {
          key: 'justifyRight',
          html: '<button class="btn btn-default">RIGHT</button>',
          action: (e) => this.onButtonAction(e, 'justifyRight', false, null)
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
          action: (e) => this.onButtonAction(e, 'insertOrderedList', false, null)
        },
        //FIXME: DUMMY
        {
          key: 'unorderedlist',
          html: '<button class="btn btn-default">UL</button>',
          action: (e) => this.onButtonAction(e, 'insertUnorderedList', false, null)
        },
        {
          key: 'removeFormat',
          html: '<button class="btn btn-default">Clear Format</button>',
          action: (e) => this.onButtonAction(e, 'removeFormat', false, null)
        },
        {
          key: 'RESET',
          html: '<button class="btn btn-default">RESET</button>',
          action: (e) => this.onReset(e)
        },
        {
          key: 'SAVE',
          html: '<button class="btn btn-default">SAVE</button>',
          action: (e) => this.onSave(e)
        }
      ]
    };

    // Extend default.
    this.options = extend(baseOptions, options);
  }

  createFloatingTbar() {
    if (this.floatingTbar) { return; }

    this.floatingTbar = document.createElement('div');
    this.floatingTbar.className = 'floating-tbar'
    this.floatingTbar.setAttribute('style',
      `
        position: absolute;
        display: block;
        opacity: 0;
        top: 100px;
        left: 100px;
      `);
    for (var option of this.options.buttons) {
      let button = this.createToolbarButton(option);
      this.floatingTbar.appendChild(button);
    }
    this.editor.parentNode.insertBefore(this.floatingTbar, this.editor);
  }

  hideTbar(delay = 100) {
    setTimeout( () => this.floatingTbar.style.opacity = 0, delay);
  }

  showTbar(delay = 100) {
    setTimeout( () => this.floatingTbar.style.opacity = 1, delay);
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
    //this.createToolbar();
    this.createFloatingTbar();
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
    this.editor.addEventListener('input', (e) => this.onChange(e));
    this.editor.addEventListener('blur', (e) => this.onBlur(e));
    this.editor.addEventListener('mouseup', (e) => this.onMouseUp(e));
    this.editor.addEventListener('mousedown', (e) => this.onMouseDown(e));
    document.addEventListener('keyup', (e) => this.onKeyup(e));
    document.addEventListener('keydown', (e) => this.onKeydown(e));
  }

  save() {
    this.updateValue();
    this.dispatchEvent('editor.save');
    return this.value;
  }
  reset() {
    this.editor.innerHTML =this.options.placeholder;
    this.value = '';
    this.empty = true;
    this.dispatchEvent('editor.update')
  }

  dispatchEvent(eventName, ...args) {
    let e = new Event(eventName);
    this.editor.dispatchEvent(e);
  }

  setValue(val) {
    this.value = val;
    this.editor.innerHTML =this.value;
    this.empty = false;
    this.dispatchEvent('editor.update')
  }

  updateValue() {
    this.value = this.editor.innerHTML;
    this.dispatchEvent('editor.update')
  }

  exec(cmd, ...options) {
    document.execCommand(cmd, ...options);
    console.debug(cmd, ...options);
    this.updateValue();
  }

  onButtonAction(e, ...args) {
    e.preventDefault();
    e.stopPropagation();
    this.exec(...args);
  }

  onSave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.save();
  }

  onReset(e) {
    e.preventDefault();
    e.stopPropagation();
    this.reset();
  }

  onFocus(e) {
    if (this.empty) {
      this.editor.innerHTML = '<p><br/></p>';
    }
    this.focus = true;
  }

  onChange(e) {
    if (this.inputChangeTimer) {
      clearTimeout(this.inputChangeTimer);
    }
    this.inputChangeTimer = setTimeout(() => this.updateValue(), 300);
  }

  onBlur(e) {
    let value = this.editor.innerHTML;

    if (this.stripTag(value) === '') {
      this.reset();
    } else {
      this.setValue(value);
    }

    this.hideTbar();
    this.focus = false;
  }

  onMouseUp(e) {
    this.getSelection();
    this.setMousePosition(e.pageX, e.pageY, e.target.clientHeight);
  }

  onMouseDown(e) {
    this.getSelection();
    this.setMousePosition(e.pageX, e.pageY, e.target.clientHeight);
  }

  onKeyup(e) {
    if (!this.focus) { return; }
    //do Something when Shift + Enter.
  }

  onKeydown(e) {
    if (!this.focus || !e.type === 'keydown') { return; }
    if (!e.metaKey) { return; }

    switch(+e.which) {
      case 65: // Cmd + A
        console.debug('Cmd + A');
        window.getSelection().selectAllChildren(this.editor); // Select all child nodes.
        this.getSelection();
        this.setMousePosition();
        break;

      default:
        return;
    }
  }

  setMousePosition(x = 0, y = 0, height = null) {
    // TODO: 複数行選択のときイケてない
    let sel = document.selection;
    let h = 0;
    let w = 0;

    if (sel) {
      if (sel.type !== 'Control') {
        let range = sel.createRange();
        w = range.boundingWidth;
        h = range.boundingHeight;
      }
    } else if (window.getSelection) {
      //non IE
      sel = window.getSelection();
      if (sel.rangeCount > 0) {
        let range = sel.getRangeAt(0).cloneRange();
        if (range.getBoundingClientRect) {
          let rect = range.getBoundingClientRect();
          w = rect.right - rect.left;
          h = rect.bottom = rect.top;
          x = rect.left;
          y = rect.top;
        }
      }
    } else {
      this.hideTbar();
      return;
    }

    let targetX = x + w / 2 - this.floatingTbar.clientWidth / 2;
    let targetY = y - this.floatingTbar.clientHeight - 20;
    let editorRect = this.editor.getBoundingClientRect();
    if (targetX < editorRect.left) {
      targetX = editorRect.left;
    }
    if (targetY < 1) {
      this.hideTbar();
    } else {
      this.floatingTbar.style.left = `${targetX}px`;
      this.floatingTbar.style.top = `${targetY}px`;
      this.showTbar();
    }
  }


  getSelection() {
    let selection = window.getSelection();
    let rangySelection = rangy.getSelection();
  }

  stripTag(str = '') {
    return  str.replace(/<([^>]+)>/ig, '');
  }

}
