import {Observable, Subscription} from "../observable/observable"

export const retry = <T>(count:number, error?:any) => (observable:Observable<T>) => {
  if (count <= 0) return Observable.throwError(error)

  return new Observable<T>(observer => {
    let s2:Subscription

    const s1 = observable.subscribe2(Object.setPrototypeOf({
      error(error:any) {
        s1.unsubscribe()
        s2 = retry<T>(--count, error)(observable).subscribe2(observer)
      }
    }, observer))

    return () => {
      s1.unsubscribe()
      s2 && s2.unsubscribe()
    }
  })
}

declare module "../observable/observable" {
  interface Observable<T> {
    retry(count:number):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.retry = function() {return retry(...arguments)(this)}