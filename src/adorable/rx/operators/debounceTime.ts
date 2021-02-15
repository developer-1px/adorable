import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const debounceTime = <T>(dueTime:number) => lift<T, T>(observer => {
  let timer:NodeJS.Timeout

  return {
    next(value) {
      clearTimeout(timer)
      timer = setTimeout(() => observer.next(value), dueTime)
    },

    finalize() {clearTimeout(timer)}
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    debounceTime(dueTime:number):Observable<T>
  }
}

// @ts-ignore
Observable.prototype.debounceTime = function() { return debounceTime(...arguments)(this) }