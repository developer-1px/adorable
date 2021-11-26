import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const bufferCount = <T>(bufferSize:number, startBufferEvery:number = bufferSize) => lift<T, T[]>(observer => {
  let buffer:T[] = []

  return {
    next(value:T) {
      buffer.push(value)
      if (buffer.length === bufferSize) {
        observer.next(buffer)
        buffer = buffer.slice(startBufferEvery)
      }
    },

    cleanup() {
      buffer = []
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    bufferCount(bufferSize:number, startBufferEvery:number):Observable<T[]>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.bufferCount = function() {return bufferCount(...arguments)(this)}