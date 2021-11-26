export const __is = (a:any) => (b:any) => Object.is(a, b)

/// localStorage
export const __localStorage = {
  getItem: <T>(key:string, defaults:T):T => {
    try {
      const item = localStorage.getItem(key)
      return item === null ? defaults : JSON.parse(item)
    }
    catch (e) {
      return defaults
    }
  },
  setItem: <T>(key:string) => (value:T) => localStorage.setItem(key, JSON.stringify(value))
}

export const __sessionStorage = {
  getItem: <T>(key:string, defaults = undefined):T|undefined => {
    try {
      const item = sessionStorage.getItem(key)
      return item === null ? defaults : JSON.parse(item)
    }
    catch (e) {
      return defaults
    }
  },
  setItem: <T>(key:string) => (value:T) => sessionStorage.setItem(key, JSON.stringify(value))
}

/// common.js
export const __itself = (value:any) => () => value


/// Util
export const __typeof = (value:any) => {
  const s = typeof value

  if (s === "object") {
    if (value) {
      if (value instanceof Date) {
        return "date"
      }
      if (value instanceof Array) {
        return "array"
      }
      if (value instanceof Object) {
        return s
      }

      const className = Object.prototype.toString.call(value)

      if (className === "[object Window]") {
        return "object"
      }

      // eslint-disable-next-line no-prototype-builtins
      if (className === "[object Array]" || (typeof value.length === "number" && typeof value.splice !== "undefined" && typeof value.propertyIsEnumerable !== "undefined" && !value.propertyIsEnumerable("splice"))) {
        return "array"
      }

      // eslint-disable-next-line no-prototype-builtins
      if (className === "[object Function]" || (typeof value.call !== "undefined" && typeof value.propertyIsEnumerable !== "undefined" && !value.propertyIsEnumerable("call"))) {
        return "function"
      }
    }
    else {
      return "null"
    }
  }
  else {
    if (s === "function" && typeof value.call === "undefined") {
      return "object"
    }
  }

  return s
}


/// object.js
export const __cloneObject = (obj, circular = [], cloned = []) => {

  const type = __typeof(obj)
  if (type === "object" || type === "array") {
    if (typeof obj.clone === "function") {
      return obj.clone()
    }

    const index = circular.indexOf(obj)
    if (index >= 0) {
      return cloned[index]
    }

    const clone = type === "array" ? [] : {}; let key
    for (key in obj) {
      clone[key] = __cloneObject(obj[key], circular)
    }

    circular.push(obj)
    cloned.push(clone)
    return clone
  }

  return obj
}

export const __memoize1 = (func) => {
  const cache = Object.create(null)
  return (key, ...args) => {
    return (cache[key] = key in cache ? cache[key] : func(key, ...args))
  }
}