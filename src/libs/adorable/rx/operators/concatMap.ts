import {lift} from "../internal/lift"
import {Observable, Subscription} from "../observable/observable"
import type {Asyncable} from "../types"

export const concatMap = <T, R>(project:(value:T, index:number) => Asyncable<R>) => lift<T, R>(observer => {

  let index = 0
  let sourceCompleted = false
  let running = false
  const subscriptions:Subscription[] = []

  const queue:T[] = []

  function doQueue() {
    if (running) return
    if (queue.length === 0) return

    running = true
    const value = queue.shift() as T
    const observable = Observable.castAsync(project(value, index++))

    let completed = false
    const concatMapObserver = Object.setPrototypeOf({complete: () => (completed = true)}, observer)

    const subscription = observable
      .finalize(() => {
        if (!completed) {
          // @ts-ignore
          observer.subscription.unsubscribe()
          return
        }

        running = false

        if (queue.length === 0) {
          if (sourceCompleted) {
            observer.complete()
          }
          return
        }

        doQueue()
      })
      .subscribe2(concatMapObserver)

    subscriptions.push(subscription)
  }

  return {
    next(value:T) {
      queue.push(value)
      doQueue()
    },

    complete() {
      sourceCompleted = true
      if (queue.length === 0 && !running) {
        observer.complete()
      }
    },

    cleanup() {
      for (const subscription of subscriptions) subscription.unsubscribe()
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    concatMap<R>(project:(value:T, index:number) => Asyncable<R>):Observable<R>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.concatMap = function() {return concatMap(...arguments)(this)}