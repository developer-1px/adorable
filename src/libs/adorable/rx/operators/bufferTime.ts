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

Observable.prototype.bufferTime = function(duration:number) {
  return bufferTime(duration)(this)
}