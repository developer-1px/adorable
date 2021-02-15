import {Observable} from "../observable/observable"
import {concat} from "../operator/concat";

declare module "../observable/observable" {
  interface Observable<T> {
    concat(...observables: Observable<T>[]): Observable<T>
  }
}

// @ts-ignore
Observable.prototype.concat = function () {return concat(this, ...arguments)}