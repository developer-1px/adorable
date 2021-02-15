import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const bufferCount = <T>(bufferSize:number, startBufferEvery:number = bufferSize) => lift<T, T[]>(observer => {
  let buffer:T[] = []

  return {
    next(value) {
      buffer.push(value)
      if (buffer.length === bufferSize) {
        observer.next(buffer)
        buffer = buffer.slice(startBufferEvery)
      }
    },

    finalize() {
      // @ts-ignore
      buffer = null
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    bufferCount(bufferSize:number, startBufferEvery:number):Observable<T[]>
  }
}

// @ts-ignore
Observable.prototype.bufferCount = function() { return bufferCount(...arguments)(this) }