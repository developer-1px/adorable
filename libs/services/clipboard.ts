export const copyToClipboard = (text:string) => {
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.style.cssText = "position:absolute;left:-9999px;top:-9999px"
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand("copy")
  document.body.removeChild(textarea)
}