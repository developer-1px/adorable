import {Observable, Subscription} from "../observable/observable"
import {Subject} from "../observable/subject"

export const retryWhen = <T>(notifier:(error$:Observable<any>) => Observable) => (observable:Observable<T>) => {

  return new Observable<T>(observer => {
    let s2:Subscription
    let s3:Subscription
    const error$ = new Subject<any>()

    const s1 = observable.subscribe2(Object.setPrototypeOf({
      error(originalError:any) {
        s2 = notifier(error$).subscribe2(proxyError => {
          if (originalError !== proxyError) {
            s2.unsubscribe()
            return
          }
          s3 = observable.subscribe2(Object.setPrototypeOf({
            error: (error:any) => error$.next(originalError = error)
          }, observer))
        })

        error$.next(originalError)
      }
    }, observer))

    return () => {
      s3 && s3.unsubscribe()
      s2 && s2.unsubscribe()
      s1.unsubscribe()
      error$.complete()
    }
  })
}

declare module "../observable/observable" {
  interface Observable<T> {
    retryWhen(receives:(errors:Observable<any>) => Observable):Observable<T>
  }
}

// eslint-disable-next-line prefer-rest-params
Observable.prototype.retryWhen = function() {return retryWhen(...arguments)(this)}