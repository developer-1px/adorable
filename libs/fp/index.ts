const __is = (a) => (b) => Object.is(a, b)

export const filterCallback = (callback) => {
  if (Object(callback) !== callback) return __is(callback)
  if (typeof callback === "function") return callback

  return (object) => {
    for (let [key, _callback] of Object.entries(callback)) {
      if (typeof _callback !== "function") _callback = __is
      // @ts-ignore
      if (_callback(object[key])) return true
    }
    return false
  }
}

export const mapCallback = (callback) => {
  if (Object(callback) !== callback) return callback
  if (typeof callback === "function") return callback

  return (object) => {
    object = {...object}
    for (let [key, _callback] of Object.entries(callback)) {
      if (typeof _callback !== "function") {
        object[key] = _callback
      }
      else {
        object[key] = _callback(object[key])
      }
    }

    return object
  }
}


/// localStorage
export const __localStorage = {
  getItem: (key, defaults = undefined) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || defaults
    }
    catch (e) {
      return defaults
    }
  },
  setItem: (key) => (value) => localStorage.setItem(key, JSON.stringify(value))
}

export const __sessionStorage = {
  getItem: (key, defaults = undefined) => {
    try {
      return JSON.parse(sessionStorage.getItem(key)) || defaults
    }
    catch (e) {
      return defaults
    }
  },
  setItem: (key) => (value) => sessionStorage.setItem(key, JSON.stringify(value))
}

/// common.js
export const __itself = (value) => () => value
export const __isFunction = (value) => typeof value === "function"


/// Util
export const __typeof = (value) => {
  const s = typeof value

  if ("object" === s) {
    if (value) {
      if (value instanceof Array) {
        return "array"
      }
      if (value instanceof Object) {
        return s
      }

      const className = Object.prototype.toString.call(value)

      if ("[object Window]" === className) {
        return "object"
      }

      if ("[object Array]" === className || "number" == typeof value.length && "undefined" != typeof value.splice && "undefined" != typeof value.propertyIsEnumerable && !value.propertyIsEnumerable("splice")) {
        return "array"
      }

      if ("[object Function]" === className || "undefined" != typeof value.call && "undefined" != typeof value.propertyIsEnumerable && !value.propertyIsEnumerable("call")) {
        return "function"
      }
    }
    else {
      return "null"
    }
  }
  else {
    if ("function" === s && "undefined" == typeof value.call) {
      return "object"
    }
  }

  return s
}


/// object.js
export const __cloneObject = (obj, circular = [], cloned = []) => {

  const type = __typeof(obj)
  if ("object" === type || "array" === type) {
    if ("function" === typeof obj.clone) {
      return obj.clone()
    }

    const index = circular.indexOf(obj)
    if (index >= 0) {
      return cloned[index]
    }

    let clone = "array" === type ? [] : {}, key
    for (key in obj) {
      clone[key] = __cloneObject(obj[key], circular)
    }

    circular.push(obj)
    cloned.push(clone)
    return clone
  }

  return obj
}


/// array.js
export const __push = (item) => (array) => [...array, item]
export const __isArray = (item) => Array.isArray(item)
export const __castArray = (a) => __isArray(a) ? a : [a]
export const __array_difference = (a, b, callback = __itself) => a.filter(x => !b.map(callback).includes(callback(x))).concat(b.filter(x => !a.map(callback).includes(callback(x))))


export const __memoize1 = (func) => {
  const cache = Object.create(null)
  return (key, ...args) => {
    return (cache[key] = key in cache ? cache[key] : func(key, ...args))
  }
}


export const __array_unique = (array, callback = a => a): any[] => {
  let result = Object.create(null)
  array.forEach(item => {
    const key = callback(item)
    // @ts-ignore
    result[key] = result[key] || item
  })

  return Object.values(result)
}


export const __array__group_by = (array, makeKeyCallback) => {
  const groupBy = Object.create(null)
  array.forEach(row => {
    const key = makeKeyCallback(row)
    groupBy[key] = groupBy[key] || []
    groupBy[key].push(row)
  })

  return groupBy
}