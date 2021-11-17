import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const bufferTime = <T>(duration:number) => lift<T, T[]>(observer => {

  let timer:ReturnType<typeof setTimeout>
  let group:T[] = []

  return {
    start() {
      timer = setInterval(() => {
        const value = [...group]
        group = []
        observer.next(value)
      }, duration)
    },

    next(value:T) {
      group.push(value)
    },

    cleanup() {
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
// eslint-disable-next-line prefer-rest-params
Observable.prototype.bufferTime = function() {return bufferTime(...arguments)(this)}