import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const finalize = <T>(finalize:() => void) => lift<T, T>(observer => ({finalize}))

declare module "../observable/observable" {
  interface Observable<T> {
    finalize(finalize:() => void):Observable<T>
  }
}

// @ts-ignore
Observable.prototype.finalize = function() { return finalize(...arguments)(this) }