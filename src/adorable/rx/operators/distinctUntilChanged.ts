import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const distinctUntilChanged = <T>(compare:(prev:T, curr:T) => boolean = Object.is) => lift<T, T>(observer => {
  let prev:T
  const next = (value:T) => void observer.next(prev = value) || (ret.next = next2)
  const next2 = (value:T) => !compare(prev, value) && observer.next(prev = value)

  const ret = {next}
  return ret
})

declare module "../observable/observable" {
  interface Observable<T> {
    distinctUntilChanged(compare?:(prev:T, curr:T) => boolean):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.distinctUntilChanged = function() {return distinctUntilChanged(...arguments)(this)}