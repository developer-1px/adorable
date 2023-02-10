import {Observable} from "../observable/observable"
import {concat} from "../operator/concat"

declare module "../observable/observable" {
  interface Observable<T> {
    concatWith(...observables:Observable<T>[]):Observable<T>
  }
}

// eslint-disable-next-line prefer-rest-params
Observable.prototype.concatWith = function() {return concat(this, ...arguments)}