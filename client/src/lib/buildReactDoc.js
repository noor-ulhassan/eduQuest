const buildReactDoc = (userCode, parentOrigin) => `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,system-ui,sans-serif;background:#fff;color:#1a1a1a;padding:16px}button{cursor:pointer}.done{text-decoration:line-through;color:#6b7280}.error{color:#e53e3e}</style>
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

export default buildReactDoc;
