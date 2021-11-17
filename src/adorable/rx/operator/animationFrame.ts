import {Observable} from "../observable/observable"

export const animationFrame = () => new Observable<number>(observer => {
  const s = requestAnimationFrame(value => {
    observer.next(value)
    observer.complete()
  })
  return () => cancelAnimationFrame(s)
})

declare module "../observable/observable" {
  namespace Observable {
    export function animationFrame():Observable<number>
  }
}

Observable.animationFrame = animationFrame