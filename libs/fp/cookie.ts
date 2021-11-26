export const setCookie = (name:string, value:string, day = 30) => {
  const date = new Date()
  date.setTime(date.getTime() + day * 60 * 60 * 24 * 1000)
  return (document.cookie = name + "=" + value + ";expires=" + date.toUTCString() + ";path=/")
}

export const getCookie = (name:string) => {
  const value = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)")
  return value ? unescape(value[2]) : undefined
}

export const deleteCookie = (name:string) => {
  return (document.cookie = name + "=; expires=Thu, 01 Jan 1999 00:00:10 GMT;")
}