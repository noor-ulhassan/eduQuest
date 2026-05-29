export const getLanguageIconUrl = (lang) => {
  switch (lang?.toLowerCase()) {
    case "python":      return "/python.png";
    case "javascript":  return "/js.png";
    case "react":       return "/react.png";
    case "html":        return "/html.png";
    case "css":         return "/css.png";
    case "java":        return "/java.png";
    default:            return null;
  }
};

export const buildReactDoc = (userCode, parentOrigin) => `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,system-ui,sans-serif;background:#fff;color:#1a1a1a;padding:16px}button{cursor:pointer}.done{text-decoration:line-through;color:#6b7280}.error{color:#e53e3e}<\/style>
</head><body><div id="root"><\/div>
<script>const{useState,useEffect,useRef,useCallback,useMemo,useReducer}=React;<\/script>
<script type="text/babel">
${userCode}
try{ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));}catch(e){document.getElementById("root").innerHTML='<div style="color:#c0392b;background:#fff5f5;border:1px solid #f5c6cb;border-radius:4px;padding:10px;font-family:monospace;font-size:12px;white-space:pre-wrap"><b>Error:<\/b> '+e.message+'<\/div>';}
<\/script>
<script>
var __origin__="${parentOrigin}";
window.__runTest__=function(s){try{var r=new Function("win","doc",s)(window,document);window.parent.postMessage({type:"TEST_RESULT",success:r.success,message:r.message},__origin__);}catch(e){window.parent.postMessage({type:"TEST_RESULT",success:false,message:"Test error: "+e.message},__origin__);}};
window.addEventListener("message",function(e){if(e.data&&e.data.type==="RUN_TEST")window.__runTest__(e.data.fn);});
setTimeout(function(){window.parent.postMessage({type:"IFRAME_READY"},__origin__);},250);
<\/script></body></html>`;

export const ERROR_HINTS = {
  ReferenceError:
    "Check that this variable or function is declared before you use it. Look for typos.",
  TypeError:
    "You're using a value the wrong way — e.g. calling something that isn't a function, or reading a property of null/undefined.",
  SyntaxError:
    "Your code has a formatting mistake — look for a missing bracket, parenthesis, colon, or quote near this line.",
  RangeError:
    "A value is out of the allowed range — common cause is infinite recursion or an invalid array size.",
  NameError:
    "This name doesn't exist here. Check spelling and make sure it's defined before this line.",
  AttributeError:
    "This object doesn't have that property or method. Check the object type and spelling.",
  IndexError:
    "List index out of range — your index is larger than the list length.",
  KeyError:
    "Key not found in dictionary — double-check the key name for typos.",
  ValueError:
    "Wrong value passed — e.g. passing a non-number string to int(), or an invalid argument.",
  IndentationError:
    "Python requires consistent indentation. Use 4 spaces per level and don't mix tabs with spaces.",
  TabError:
    "Mixed tabs and spaces. Stick to spaces only (4 per indent level) in Python.",
  ZeroDivisionError:
    "You're dividing by zero. Add a check to make sure the divisor isn't 0 before dividing.",
  ImportError:
    "This module couldn't be imported — it may not be available in the sandbox.",
  ModuleNotFoundError:
    "Module not found — this package isn't available in the sandbox.",
  RecursionError:
    "Too many recursive calls. Make sure your base case is reachable and correct.",
  "cannot find symbol":
    "You used a variable or method that hasn't been declared. Declare it before this line.",
  "';' expected":
    "Missing semicolon — Java requires `;` at the end of every statement.",
  "incompatible types":
    "Type mismatch — you're assigning or returning the wrong type. Cast it or change the type.",
  "reached end of file":
    "Unclosed block — a `}` is missing somewhere. Check your opening and closing braces match.",
  "illegal start of expression":
    "Unexpected character — check for a stray symbol or a misplaced keyword on this line.",
  NullPointerException:
    "You're calling a method or accessing a field on a null object. Check that the object is initialised before use.",
  ArrayIndexOutOfBoundsException:
    "Array index out of bounds — your index is >= the array length.",
  StackOverflowError:
    "Stack overflow — your recursion has no reachable base case, or it's too deep.",
  NumberFormatException:
    "Can't convert this string to a number — make sure the input only contains digits.",
  ArithmeticException: "Arithmetic error — most likely division by zero.",
  ClassCastException:
    "Invalid cast — the object isn't the type you're trying to cast it to.",
};

export function parseRawError(raw, lang) {
  if (!raw?.trim()) return null;
  const r = raw.trim();
  let type = "";
  let message = "";
  let line = null;

  if (lang === "python") {
    const lineMatch = r.match(/line (\d+)/);
    if (lineMatch) line = lineMatch[1];
    const errMatch = r.match(
      /^([A-Z]\w*(?:Error|Exception|Warning|Interrupt)):\s*(.*)$/m,
    );
    if (errMatch) {
      type = errMatch[1];
      message = errMatch[2].trim();
    }
  } else if (lang === "javascript") {
    const lineMatch = r.match(/[/\\]?main\.js:(\d+)/);
    if (lineMatch) line = lineMatch[1];
    const errMatch = r.match(
      /(ReferenceError|TypeError|SyntaxError|RangeError|URIError|EvalError|Error):\s*([^\n]+)/,
    );
    if (errMatch) {
      type = errMatch[1];
      message = errMatch[2].trim();
    }
  } else if (lang === "java") {
    const compileLineMatch = r.match(/\.java:(\d+):/);
    if (compileLineMatch) line = compileLineMatch[1];
    const compileMsg = r.match(/error:\s*([^\n]+)/);
    if (compileMsg) {
      type = "Compile Error";
      message = compileMsg[1].trim();
    }
    const rteMatch = r.match(
      /java\.lang\.(NullPointerException|ArrayIndexOutOfBoundsException|ClassCastException|StackOverflowError|NumberFormatException|ArithmeticException|IllegalArgumentException|IllegalStateException)([:\s]+([^\n]*))?/,
    );
    if (rteMatch) {
      type = rteMatch[1];
      message = rteMatch[3]?.trim() || "";
      const rteLineMatch = r.match(/at [^(]+\(Main\.java:(\d+)\)/);
      if (rteLineMatch) line = rteLineMatch[1];
    }
  }

  const hint =
    ERROR_HINTS[type] ||
    Object.entries(ERROR_HINTS).find(([k]) =>
      message.toLowerCase().includes(k.toLowerCase()),
    )?.[1] ||
    "Read the message carefully and inspect the line it points to.";

  if (!type && !line) {
    const firstMeaningful = r
      .split("\n")
      .find(
        (l) =>
          l.trim() &&
          !l.trim().startsWith("at ") &&
          !l.trim().startsWith("File ") &&
          !l.trim().match(/^\^+$/) &&
          !l.trim().startsWith("Traceback"),
      );
    return firstMeaningful?.trim() || r.split("\n")[0];
  }

  const parts = [];
  parts.push(line ? `Line ${line}  ·  ${type || "Error"}` : type || "Error");
  if (message) parts.push(message);
  parts.push(`\n💡 ${hint}`);
  return parts.join("\n");
}
