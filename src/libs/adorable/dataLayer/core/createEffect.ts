import {onMount} from "svelte"
import {Observable, Subscription} from "../../rx"
import {catchError} from "../../rx/operators/catchError"
import type {Observer, OnComplete, OnError, OnNext} from "../../rx/types"

declare module "../../rx/observable/observable" {
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
    const s = observable.pipe(catchError(error => {
      Observable.hostReportErrors(error)
      return Observable.EMPTY
    })).subscribe(...args)

    subscriptions.push(s)
    try {onMount(() => () => s.unsubscribe())}
    catch (e) {}
    return s
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.createEffect = function() {return createEffect(...arguments)(this)}