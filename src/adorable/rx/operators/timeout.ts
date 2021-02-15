import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const timeout = <T>(due:number) => lift<T, T>(observer => {
  let id:NodeJS.Timeout
  return {
    start() {
      clearTimeout(id)
      id = setTimeout(() => observer.error(), due)
    },

    next(value) {
      clearTimeout(id)
      id = setTimeout(() => observer.error(value), due)
      observer.next(value)
    },

    finalize() {
      clearTimeout(id)
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    timeout(due:number):Observable<T>
  }
}

// @ts-ignore
Observable.prototype.timeout = function() { return timeout(...arguments)(this) }