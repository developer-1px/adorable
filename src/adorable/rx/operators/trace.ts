import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const trace = <T>(...tag:string[]) => {
  // const stack = (new Error).stack?.split(" at ") || []
  // const line = stack[stack.length - 1]

  return lift<T, T>(observer => {
    let prev:T

    return {
      next(value) {
        // @ts-ignore
        console.log(...tag.map(tag => "\x1b[35m " + `${tag}`), prev, "→", value)
        observer.next(value)
        prev = value
      },

      error(error) {
        console.error(...tag, error)
        observer.error(error)
      }
    }
  })
}

declare module "../observable/observable" {
  interface Observable<T> {
    trace(...tag:string[]):Observable<T>
  }
}

// @ts-ignore
Observable.prototype.trace = function() { return trace(...arguments)(this) }