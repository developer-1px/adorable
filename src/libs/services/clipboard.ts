export const copyToClipboard = (text:string) => {
  // @ts-ignore
  if (window.KwAndroid?.writeToClipboard) {
    // @ts-ignore
    return window.KwAndroid.writeToClipboard(text)
  }

  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.style.cssText = "position:absolute;left:-9999px;top:-9999px"
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, 9999)
  document.execCommand("copy")
  document.body.removeChild(textarea)
}


export const copyToClipboardMobile = async (text:string) => {
  // @ts-ignore
  if (window.KwAndroid?.writeToClipboard) {
    // @ts-ignore
    return window.KwAndroid.writeToClipboard(text)
  }

  try {
    await navigator.clipboard.writeText(text)
  }
  catch (e) {
    location.href = `kakaowork://copy_to_pasteboard?text=${encodeURIComponent(text)}`
  }
}