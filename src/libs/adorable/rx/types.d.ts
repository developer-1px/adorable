import type {Observable, Subscription, SubscriptionObserver} from "./observable/observable"

export type Subscriber<T> = (observer:SubscriptionObserver<T>) => Subscription|Function|void|Promise<Subscription|Function|void>

export type OnStart = (subscription:Subscription) => void
export type OnNext<T> = (value:T) => void
export type OnError = (value:Error|any) => void
export type OnComplete = () => void

export interface Observer<T> {
  start?:OnStart
  next?:OnNext<T>
  error?:OnError
  complete?:OnComplete
}
export interface LiftObserver<T> extends Observer<T> {
  start?:OnStart
  next?:OnNext<T>
  error?:OnError
  complete?:OnComplete
  cleanup?:OnComplete
}

export type LiftCallback<T, U> = (observer:SubscriptionObserver<U>) => LiftObserver<T>

export interface ObservableLike<T> {
  subscribe(observer:Observer<T>):any
  subscribe(next?:OnNext<T>, error?:OnError, complete?:OnComplete):any
}

// eslint-disable-next-line no-use-before-define
export type Asyncable<T> = Observable<T>|Promise<T>|Defer<T>|ObservableLike<T>|PromiseLike<T>|T

export type Defer<T> = (...args:any[]) => Asyncable<T>

export type Falsy = null|undefined|false|0|-0|0n|"";