// -------------------------------------------------------------------------------------------
// Observable.timer
// -------------------------------------------------------------------------------------------
import {Observable} from "../observable/observable"

export const timer = (initialDelay:number, period?:number) => new Observable<number>(observer => {
  let i = 0, id1:any, id2:any

  id1 = setTimeout(() => {
    if (observer.closed) return

    observer.next(i++)
    if (!period) return observer.complete()
    if (!id1) return

    id2 = setInterval(() => {
      if (observer.closed) return
      observer.next(i++)
    }, period)

  }, initialDelay)

  return () => {
    clearTimeout(id1)
    clearInterval(id2)
    id1 = undefined
    id2 = undefined
  }
})


declare module "../observable/observable" {
  namespace Observable {
    export function timer(initialDelay:number):Observable<number>
    export function timer(initialDelay:number, period:number):Observable<number>
  }
}

Observable.timer = timer