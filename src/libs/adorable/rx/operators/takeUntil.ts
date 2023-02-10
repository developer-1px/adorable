import {Observable} from "../observable/observable"

export const takeUntil = <T>(notifier:Observable<any>) => (observable:Observable<T>) => new Observable<T>(observer => {
  const complete = observer.complete.bind(observer)
  const s = observable.subscribe2(observer)
  const s2 = notifier.subscribe2(complete, complete, complete)

  return () => {
    s.unsubscribe()
    s2.unsubscribe()
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    takeUntil(notifier:Observable<any>):Observable<T>
  }
}

// eslint-disable-next-line prefer-rest-params
Observable.prototype.takeUntil = function() {return takeUntil(...arguments)(this)}