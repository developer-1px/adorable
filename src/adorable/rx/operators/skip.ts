import {Observable} from "../observable/observable"
import {filter} from "./filter"

export const skip = <T>(count:number) => (observable:Observable<T>) => filter<T>((value, index) => index >= count)(observable)

declare module "../observable/observable" {
  interface Observable<T> {
    skip(count:number):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.skip = function() {return skip(...arguments)(this)}