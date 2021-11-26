const noop = () => {}

export const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/g

export const autolink = (str:string) => str.replace(urlRegex, a => `<a href="${encodeURI(a)}" target="_blank">${a}</a>`)

export const autolinkHTML = (html:string) => {
  const div = document.createElement("div")
  div.innerHTML = html
  mutateAutoLinkElement(div)
  return div.innerHTML.trim()
}

export const traversal = (node:Node, fn:(node:Node, ...args:any[]) => false|void, ...args:any[]) => {
  fn = fn || noop
  const stack:Node[] = []
  while (node) {
    // @ts-ignore
    node = fn(node, ...args) === false ? stack.pop() : node.firstChild || stack.pop()
    node && node.nextSibling && stack.push(node.nextSibling)
  }
}

export const mutateAutoLinkElement = (content:HTMLElement) => {
  traversal(content, node => {
    if (node instanceof HTMLElement && node.tagName === "A") return false
    if (node.parentNode && node.nodeType === 3) {
      if (!urlRegex.test(node.nodeValue || "")) return
      const template = document.createElement("template")
      template.innerHTML = autolink(node.nodeValue || "")
      node.parentNode.insertBefore(template.content, node)
      node.parentNode.removeChild(node)
    }
  })
}