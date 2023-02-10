import {Observable} from "../observable/observable"

export const merge = <T>(...observables:Observable<T>[]) => new Observable<T>(observer => {
  const {length} = observables
  let count = 0

  const mergeObserver = Object.setPrototypeOf({
    complete() {
      if (++count === length) {
        observer.complete()
      }
    }
  }, observer)

  const subscriptions = observables.map(observable => observable.subscribe2(mergeObserver))

  return () => {
    for (const s of subscriptions) s.unsubscribe()
  }
})

declare module "../observable/observable" {
  namespace Observable {
    export function merge<T>(...observables:Observable<T>[]):Observable<T>
  }
}

Observable.merge = merge