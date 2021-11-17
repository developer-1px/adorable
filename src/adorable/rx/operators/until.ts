import {Observable} from "../observable/observable"

export const until = <T>(notifier:Observable<any>) => (observable:Observable<T>) => new Observable<T>(observer => {
  const s = observable.subscribe(observer)

  const unsubscribe = () => s.unsubscribe()
  const s2 = notifier.subscribe(unsubscribe, unsubscribe, unsubscribe)

  return () => {
    s.unsubscribe()
    s2.unsubscribe()
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    until(notifier:Observable<any>):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.until = function() {return until(...arguments)(this)}