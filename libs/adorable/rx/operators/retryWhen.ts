import {Observable, Subscription} from "../observable/observable"
import {Subject} from "../observable/subject"

export const retryWhen = <T>(receives:(errors:Observable<any>) => Observable) => (observable:Observable<T>) => {

  return new Observable<T>(observer => {
    let s2:Subscription, s3:Subscription
    // 에러 Subject
    const errors = new Subject<any>()

    const s1 = observable.subscribe(Object.setPrototypeOf({
      error(error:any) {
        s2 = s2 || receives(errors).subscribe(() => {
          s3 = observable.subscribe(Object.setPrototypeOf({
            error: (err:any) => errors.next(err)
          }, observer))
        })

        errors.next(error)
      }
    }, observer))

    return () => {
      errors.complete()
      s1.unsubscribe()
      s2 && s2.unsubscribe()
      s3 && s3.unsubscribe()
    }
  })
}

declare module "../observable/observable" {
  interface Observable<T> {
    retryWhen(receives:(errors:Observable<any>) => Observable):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.retryWhen = function() {return retryWhen(...arguments)(this)}