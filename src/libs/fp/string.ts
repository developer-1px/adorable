// @ts-ignore
export const __encodeHTML = (html:string) => document.createElement("div").appendChild(document.createTextNode(html)).parentNode.innerHTML

export const __decodeHTML = (html:string) => {
  const div = document.createElement("div")
  div.innerHTML = html
  return div.innerText
}

export const stricmp = (a:string|number, b:string|number) => String(a ?? "").localeCompare(String(b ?? ""))

export const autolink = (str:string, attrs:string, url_filter = (url:string) => url) => {
  const link = (url:string) => `<a href="${url_filter(url)}" ${attrs}>${url}</a>`
  return str.replace(/(https?:\/\/[^\s]+)/g, link)
}