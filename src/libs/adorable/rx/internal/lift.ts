import {Observable} from "../observable/observable"
import type {LiftCallback} from "../types"

export const lift = <T, U>(liftCallback:LiftCallback<T, U>) => (observable:Observable<T>) => new Observable<U>(observer => {
  const o = liftCallback(observer) || {}
  const subscription = observable.subscribe2(Object.setPrototypeOf(o, observer))
  return () => {
    o.cleanup && o.cleanup()
    subscription.unsubscribe()
  }
})