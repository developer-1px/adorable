import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export function withLatestFrom<T>(...inputs:Observable<any>[]) {

  return lift<T, any[]>(observer => {

    let value2:any[]
    const s = Observable.combineLatest(...inputs).subscribe(value => value2 = value)

    return ({
      next(value:T) {
        observer.next([value, ...value2])
      },
      cleanup() {
        if (s) s.unsubscribe()
      }
    })
  })
}


declare module "../observable/observable" {
  interface Observable<T> {
    withLatestFrom<T1>(observable:Observable<T1>):Observable<[T, T1]>
    withLatestFrom<T1, T2>(o1:Observable<T1>, o2:Observable<T2>):Observable<[T, T1, T2]>
    withLatestFrom<T1, T2, T3>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>):Observable<[T, T1, T2, T3]>
    withLatestFrom<T1, T2, T3, T4>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>):Observable<[T, T1, T2, T3, T4]>
    withLatestFrom<T1, T2, T3, T4, T5>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>, o5:Observable<T5>):Observable<[T, T1, T2, T3, T4, T5]>
    withLatestFrom<T1, T2, T3, T4, T5, T6>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>, o5:Observable<T5>, o6:Observable<T6>):Observable<[T, T1, T2, T3, T4, T6]>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.withLatestFrom = function() {return withLatestFrom(...arguments)(this)}