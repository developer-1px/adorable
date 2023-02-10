import {Observable} from "../observable/observable"

export function fromPromise<T>(promise:Promise<T>|PromiseLike<T>):Observable<T> {
  return new Observable<T>(observer => {
    promise.then(value => void observer.next(value) || observer.complete(), error => observer.error(error))
  })
}

declare module "../observable/observable" {
  namespace Observable {
    export function fromPromise<T>(promise:Promise<T>):Observable<T>
  }
}

Observable.fromPromise = fromPromise