import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const timeout = <T>(due:number) => lift<T, T>(observer => {
  let id:ReturnType<typeof setTimeout>
  return {
    start() {
      clearTimeout(id)
      id = setTimeout(() => observer.error(), due)
    },

    next(value:T) {
      clearTimeout(id)
      id = setTimeout(() => observer.error(value), due)
      observer.next(value)
    },

    cleanup() {
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
// eslint-disable-next-line prefer-rest-params
Observable.prototype.timeout = function() {return timeout(...arguments)(this)}