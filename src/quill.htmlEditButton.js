import './styles.css';

function $create(elName) {
  return document.createElement(elName);
}
function $setAttr(el, key, value) {
  return el.setAttribute(key, value);
}

let debug = false;
const Logger = {
  prefixString() {
    return `</> quill-html-edit-button: `;
  },
  get log() {
    if (!debug) {
      return (...any) => {};
    }
    const boundLogFn = console.log.bind(console, this.prefixString());
    return boundLogFn;
  }
};

class htmlEditButton {
  constructor(quill, options) {
    debug = options && options.debug;
    Logger.log("logging enabled");
    // Add button to all quill toolbar instances
    let toolbars = quill.container.parentElement.querySelectorAll(
      ".ql-toolbar"
    );
    toolbars = [].slice.call(toolbars);
    toolbars.forEach(toolbarEl => {
      const buttonContainer = $create("span");
      $setAttr(buttonContainer, "class", "ql-formats");
      const button = $create("button");
      button.innerHTML = "&lt;&gt;";
      button.title = "Show HTML source";
      button.onclick = function(e) {
        e.preventDefault();
        launchPopupEditor(quill);
      };
      buttonContainer.appendChild(button);
      toolbarEl.appendChild(buttonContainer);
    });
  }
}

function launchPopupEditor(quill) {
  const htmlFromEditor = quill.container.querySelector(".ql-editor").innerHTML;
  const popupContainer = $create("div");
  const overlayContainer = $create("div");
  $setAttr(overlayContainer, "class", "ql-html-overlayContainer");
  $setAttr(popupContainer, "class", "ql-html-popupContainer");
  const popupTitle = $create("i");
  $setAttr(popupTitle, "class", "ql-html-popupTitle");
  popupTitle.innerText =
    'Edit HTML here, when you click "OK" ' +
    "the quill editor's contents will be replaced";
  const textContainer = $create("div");
  textContainer.appendChild(popupTitle);
  $setAttr(textContainer, "class", "ql-html-textContainer");
  const textArea = $create("textarea");
  $setAttr(textArea, "class", "ql-html-textArea");
  textArea.value = formatHTML(htmlFromEditor);
  const buttonCancel = $create("button");
  buttonCancel.innerHTML = "Cancel";
  $setAttr(buttonCancel, "class", "ql-html-buttonCancel");
  const buttonOk = $create("button");
  buttonOk.innerHTML = "Ok";
  const buttonGroup = $create("div");
  $setAttr(buttonGroup, "class", "ql-html-buttonGroup");

  buttonGroup.appendChild(buttonCancel);
  buttonGroup.appendChild(buttonOk);
  textContainer.appendChild(textArea);
  textContainer.appendChild(buttonGroup);
  popupContainer.appendChild(textContainer);
  overlayContainer.appendChild(popupContainer);
  document.body.appendChild(overlayContainer);

  buttonCancel.onclick = function() {
    document.body.removeChild(overlayContainer);
  };
  overlayContainer.onclick = buttonCancel.onclick;
  popupContainer.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
  };
  buttonOk.onclick = function() {
    const output = textArea.value.split(/\r?\n/g).map(el => el.trim());
    const noNewlines = output.join("");
    quill.container.querySelector(".ql-editor").innerHTML = noNewlines;
    document.body.removeChild(overlayContainer);
  };
}

// Adapted FROM jsfiddle here: https://jsfiddle.net/buksy/rxucg1gd/
function formatHTML(code) {
  "use strict";
  let stripWhiteSpaces = true;
  let stripEmptyLines = true;
  const whitespace = " ".repeat(2); // Default indenting 4 whitespaces
  let currentIndent = 0;
  const newlineChar = "\n";
  let char = null;
  let nextChar = null;

  let result = "";
  for (let pos = 0; pos <= code.length; pos++) {
    char = code.substr(pos, 1);
    nextChar = code.substr(pos + 1, 1);

    const isBrTag = code.substr(pos, 4) === "<br>";
    const isOpeningTag = char === "<" && nextChar !== "/" && !isBrTag;
    const isClosingTag = char === "<" && nextChar === "/" && !isBrTag;
    if (isBrTag) {
      // If opening tag, add newline character and indention
      result += newlineChar;
      currentIndent--;
      pos += 4;
    }
    if (isOpeningTag) {
      // If opening tag, add newline character and indention
      result += newlineChar + whitespace.repeat(currentIndent);
      currentIndent++;
    }
    // if Closing tag, add newline and indention
    else if (isClosingTag) {
      // If there're more closing tags than opening
      if (--currentIndent < 0) currentIndent = 0;
      result += newlineChar + whitespace.repeat(currentIndent);
    }

    // remove multiple whitespaces
    else if (stripWhiteSpaces === true && char === " " && nextChar === " ")
      char = "";
    // remove empty lines
    else if (stripEmptyLines === true && char === newlineChar) {
      //debugger;
      if (code.substr(pos, code.substr(pos).indexOf("<")).trim() === "")
        char = "";
    }

    result += char;
  }
  Logger.log("formatHTML", {
    before: code,
    after: result
  });
  return result;
}

window.htmlEditButton = htmlEditButton;
export default htmlEditButton;
export { htmlEditButton };
