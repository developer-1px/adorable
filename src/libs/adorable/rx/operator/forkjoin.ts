import {Observable} from "../observable/observable"
import {last} from "../operators/last"

export const forkjoin = <T>(...observables:Observable<T>[]) => new Observable<T[]>(observer => {
  let count = 0
  const ret = new Array(observables.length)

  if (ret.length === 0) {
    observer.next(ret)
    observer.complete()
    return
  }

  observables.forEach((observable, index) => {
    last()(observable).subscribe2(value => {
      ret[index] = value
      if (++count === ret.length) {
        observer.next(ret)
        observer.complete()
      }
    })
  })
})


declare module "../observable/observable" {
  namespace Observable {
    export function forkjoin<T>(...observables:Observable<T>[]):Observable<T[]>
  }
}

Observable.forkjoin = forkjoin