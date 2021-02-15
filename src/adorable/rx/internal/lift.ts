import {Observable, Observer, OnComplete, SubscriptionObserver} from "../observable/observable"

interface LiftObserver<T> extends Observer<T> {
  finalize?:OnComplete
}

type LiftCallback<T, U> = (observer:SubscriptionObserver<U>) => LiftObserver<T>

export const lift = <T, U>(liftCallback:LiftCallback<T, U>) => (observable:Observable<T>) => new Observable<U>(observer => {
  const o = liftCallback(observer) || {}
  const subscription = observable.subscribe(Object.setPrototypeOf(o, observer))
  return () => {
    o.finalize && o.finalize()
    subscription.unsubscribe()
  }
})