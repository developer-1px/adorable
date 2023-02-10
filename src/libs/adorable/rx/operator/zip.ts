import {Observable} from "../observable/observable"

export const zip = <T>(...observables:Observable<T>[]) => new Observable<T[]>(observer => {
  const ret = new Array(observables.length)

  if (ret.length === 0) {
    observer.next(ret)
    observer.complete()
    return
  }

  const s = observables.map((observable, index) => {
    return observable.subscribe(value => {
      ret[index] = value
      observer.next(ret)
    })
  })

  return () => s.forEach(s => s.unsubscribe())
})

declare module "../observable/observable" {
  namespace Observable {
    export function zip<T>(...observables:Observable<T>[]):Observable<T[]>
  }
}

Observable.zip = zip