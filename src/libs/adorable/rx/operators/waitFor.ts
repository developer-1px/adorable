import {lift} from "../internal/lift"
import {Observable, Subscription} from "../observable/observable"
import {Subject} from "../observable/subject"

export function waitFor<T>(...other:Observable<any>[]) {

  return lift<T, any[]>(observer => {

    let s:Subscription
    let value2:any[]
    let isWaiting = false
    const subject = new Subject()

    return ({
      next(value:T) {
        s = s || Observable.combineLatest(...other, subject).subscribe2({
          next(value) {
            value2 = [...value.slice(-1), ...value.slice(0, -1)]
            if (isWaiting) {
              isWaiting = false
              observer.next(value2)
            }
          },

          error(error:any) {
            observer.error(error)
          }
        })

        subject.next(value)
        if (!value2) return isWaiting = true

        observer.next(value2)
      },

      cleanup() {
        if (s) s.unsubscribe()
        subject.complete()
      }
    })
  })
}


declare module "../observable/observable" {
  interface Observable<T> {
    waitFor<T1>(observable:Observable<T1>):Observable<[T, T1]>
    waitFor<T1, T2>(o1:Observable<T1>, o2:Observable<T2>):Observable<[T, T1, T2]>
    waitFor<T1, T2, T3>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>):Observable<[T, T1, T2, T3]>
    waitFor<T1, T2, T3, T4>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>):Observable<[T, T1, T2, T3, T4]>
    waitFor<T1, T2, T3, T4, T5>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>, o5:Observable<T5>):Observable<[T, T1, T2, T3, T4, T5]>
    waitFor<T1, T2, T3, T4, T5, T6>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>, o5:Observable<T5>, o6:Observable<T6>):Observable<[T, T1, T2, T3, T4, T6]>
  }
}

// eslint-disable-next-line prefer-rest-params
Observable.prototype.waitFor = function() {return waitFor(...arguments)(this)}