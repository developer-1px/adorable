import {Observable, Subscription} from "../observable/observable"

export const race = <T>(...observables:Observable<T>[]) => new Observable<T>(observer => {
  const subscriptions:Subscription<T>[] = []
  let hasWinner = false

  const createRaceObserver = (index:number) => Object.setPrototypeOf({
    next(value:T) {
      hasWinner = true
      delete this.next

      subscriptions.forEach((s, i) => i !== index && s.unsubscribe())
      observer.next(value)
    }
  }, observer)

  for (let i = 0, len = observables.length; i < len; i++) {
    if (hasWinner) break
    subscriptions.push(observables[i].subscribe2(createRaceObserver(i)))
  }

  return () => {
    for (const s of subscriptions) s.unsubscribe()
  }
})

declare module "../observable/observable" {
  namespace Observable {
    export function race<T>(...observables:Observable<T>[]):Observable<T>
  }
}

Observable.race = race