import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const ignoreElements = <T>() => lift<T, T>(() => ({next() {}}))

declare module "../observable/observable" {
  interface Observable<T> {
    ignoreElements():Observable<T>
  }
}

// @ts-ignore
Observable.prototype.ignoreElements = function() { return ignoreElements(...arguments)(this) }