import {Observable} from "../observable/observable"

export const debounce = <T>(durationSelector:(value:T) => Observable) => (observable:Observable<T>) => {
  return observable.switchMap(value => durationSelector(value).mapTo(value))
}

declare module "../observable/observable" {
  interface Observable<T> {
    debounce(durationSelector:(value:T) => Observable):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.debounce = function() {return debounce(...arguments)(this)}