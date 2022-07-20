import {lift} from "../internal/lift"
import {Observable, Subscription} from "../observable/observable"
import type {Asyncable} from "../types"

export const mergeMap = <T, R>(project:(value:T, index:number) => Asyncable<R>) => lift<T, R>((observer) => {
  let index = 0
  let completed = false
  const subscriptions:Subscription[] = []

  const complete = () => completed && subscriptions.every(s => s.closed) && observer.complete()
  const mergeMapObserver = Object.setPrototypeOf({complete}, observer)

  return {
    next(value:T) {
      subscriptions.push(Observable.castAsync(project(value, index++)).subscribe(mergeMapObserver))
    },

    complete() {
      completed = true
      complete()
    },

    cleanup() {
      for (const subscription of subscriptions) subscription.unsubscribe()
    }
  }
})


declare module "../observable/observable" {
  interface Observable<T> {
    mergeMap<R>(project:(value:T, index:number) => Asyncable<R>):Observable<R>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.mergeMap = function() {return mergeMap(...arguments)(this)}