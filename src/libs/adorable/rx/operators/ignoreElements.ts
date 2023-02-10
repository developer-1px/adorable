import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const ignoreElements = <T>() => lift<T, T>(() => ({next() {}}))

declare module "../observable/observable" {
  interface Observable<T> {
    ignoreElements():Observable<T>
  }
}

// eslint-disable-next-line prefer-rest-params
Observable.prototype.ignoreElements = function() {return ignoreElements(...arguments)(this)}