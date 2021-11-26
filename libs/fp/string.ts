// @ts-ignore
export const __encodeHTML = (html:string) => document.createElement("div").appendChild(document.createTextNode(html)).parentNode.innerHTML

export const __decodeHTML = (html:string) => {
  const div = document.createElement("div")
  div.innerHTML = html
  return div.innerText
}

export const stricmp = (a:string|number, b:string|number) => String(a ?? "").localeCompare(String(b ?? ""))

export const autolink = (str:string, attr = "", callback = (_url:string) => "") => {
  const pattern = /(^|[\s\n]|<[A-Za-z]*\/?>)((?:https?|ftp):\/\/[-A-Z0-9+\u0026\u2019@#/%?=()~_|!:,.;]*[-A-Z0-9+\u0026@#/%=~()_|])/gi
  return str.replace(pattern, (_, space:string, url:string) => space + `<a href="${url}" ${attr}>${callback(url)}</a>`)
}