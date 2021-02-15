import {Observable} from "../observable/observable"
import {concat} from "../operator/concat";

declare module "../observable/observable" {
  interface Observable<T> {
    startWith(...value: T[]): Observable<T>
  }
}

// @ts-ignore
Observable.prototype.startWith = function () { return concat(...arguments, this) }