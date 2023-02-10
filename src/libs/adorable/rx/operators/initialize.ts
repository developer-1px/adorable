import {Observable} from "../observable/observable"

export const initialize = <T>(initialize:(value:T) => void) => (observable:Observable<T>) => new Observable(observer => {
  const o = Object.setPrototypeOf({
    next(value:T) {
      initialize(value)
      observer.next(value)
      delete o.next
    }
  }, observer)

  return observable.subscribe2(o)
})

declare module "../observable/observable" {
  interface Observable<T> {
    initialize(initialize:(value:T) => void):Observable<T>
  }
}

// eslint-disable-next-line prefer-rest-params
Observable.prototype.initialize = function() {return initialize(...arguments)(this)}