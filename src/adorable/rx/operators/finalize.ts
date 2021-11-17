import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const finalize = <T>(finalize:() => void) => lift<T, T>(() => ({cleanup: finalize}))

declare module "../observable/observable" {
  interface Observable<T> {
    finalize(finalize:() => void):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.finalize = function() {return finalize(...arguments)(this)}