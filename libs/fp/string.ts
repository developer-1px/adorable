export const __encodeHTML = (html) => document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML

