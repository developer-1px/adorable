import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const trace = <T>(...tag:string[]) => {
  // const stack = (new Error).stack?.split(" at ") || []
  // const line = stack[stack.length - 1]

  return lift<T, T>(observer => {
    let prev:T

    return {
      next(value:T) {
        // @ts-ignore
        console.log(...tag.map(tag => "\x1b[35m " + `${tag}`), prev, "→", value)
        observer.next(value)
        prev = value
      },

      error(error:any) {
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
// eslint-disable-next-line prefer-rest-params
Observable.prototype.trace = function() {return trace(...arguments)(this)}