import {Observable, Subscription, SubscriptionObserver} from "../observable/observable"

export const shareReplay = <T>(bufferSize = Infinity) => (observable:Observable<T>) => {
  let buffer:T[] = []
  let observers:SubscriptionObserver<T>[] = []
  let subscription:Subscription|null

  return new Observable(observer => {
    if (subscription) {
      for (const value of buffer) {
        observer.next(value)
      }

      if (subscription.closed) {
        observer.complete()
        return
      }
    }

    observers.push(observer)

    subscription = subscription || observable.subscribe2({
      next(value:T) {
        buffer.push(value)
        buffer = buffer.slice(-bufferSize)
        for (const observer of observers) observer.next(value)
      },

      error(error:any) {
        for (const observer of observers) observer.error(error)
      },

      complete() {
        for (const observer of observers) observer.complete()
      }
    })

    return () => {
      observers = observers.filter(o => o !== observer)
      if (observers.length === 0) {
        subscription?.unsubscribe()
        subscription = null
      }
    }
  })
}

declare module "../observable/observable" {
  interface Observable<T> {
    shareReplay(bufferSize:number):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.shareReplay = function() {return shareReplay(...arguments)(this)}