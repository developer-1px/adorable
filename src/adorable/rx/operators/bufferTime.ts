import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const bufferTime = <T>(duration:number) => lift<T, T[]>(observer => {

  let timer:NodeJS.Timeout
  let group:T[] = []

  return {
    start() {
      timer = setInterval(() => {
        const value = [...group]
        group = []
        observer.next(value)
      }, duration)
    },

    next(value) {
      group.push(value)
    },

    finalize() {
      clearInterval(timer)
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    bufferTime(duration:number):Observable<T[]>
  }
}

// @ts-ignore
Observable.prototype.bufferTime = function() { return bufferTime(...arguments)(this) }