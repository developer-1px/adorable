import {Observable, Observer, OnComplete, OnError, OnNext, Subscription, EMPTY} from "../rx"
import {onMount} from "svelte"
import {catchError} from "../rx/operators/catchError"

declare module "../rx/observable/observable" {
  interface Observable<T> {
    createEffect(observer:Observer<T>):Subscription
    createEffect(next?:OnNext<T>, error?:OnError, complete?:OnComplete):Subscription
  }
}

let subscriptions:Subscription[] = []

export function createEffectSubscriptions() {
  subscriptions = []
  return subscriptions
}

export function createEffect<T>(...args:any[]) {
  return function(observable:Observable<T>):Subscription {
    const s = observable.pipe(catchError(error => (console.error(error), EMPTY))).subscribe(...args)
    subscriptions.push(s)
    try {onMount(() => () => s.unsubscribe())}
    catch (e) {}
    return s
  }
}

// @ts-ignore
Observable.prototype.createEffect = function() { return createEffect(...arguments)(this) }