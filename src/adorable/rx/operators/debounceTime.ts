import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const debounceTime = <T>(dueTime:number) => lift<T, T>(observer => {
  let timer:ReturnType<typeof setTimeout>

  return {
    next(value:T) {
      clearTimeout(timer)
      timer = setTimeout(() => observer.next(value), dueTime)
    },

    cleanup() {clearTimeout(timer)}
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    debounceTime(dueTime:number):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.debounceTime = function() {return debounceTime(...arguments)(this)}