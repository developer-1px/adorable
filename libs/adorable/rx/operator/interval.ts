import {Observable} from "../observable/observable"

export const interval = (period?:number) => new Observable<number>(observer => {
  let i = 0
  const timerId = setInterval(() => observer.next(i++), period)
  return () => clearInterval(timerId)
})

declare module "../observable/observable" {
  namespace Observable {
    export function interval(period:number):Observable<number>
  }
}

Observable.interval = interval