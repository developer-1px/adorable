import {Observable} from "../observable/observable"
import type {Asyncable, Defer, ObservableLike} from "../types"
import {defer} from "./defer"
import {fromPromise} from "./fromPromise"

const thenable = <T>(value:Asyncable<T>):value is PromiseLike<T> => value && typeof value === "object" && "then" in value && typeof value.then === "function"
const subscribable = <T>(value:Asyncable<T>):value is ObservableLike<T> => value && typeof value === "object" && "subscribe" in value && typeof value.subscribe === "function"

export const castAsync = <T>(value:Asyncable<T>) => {
  if (value instanceof Observable) return value
  if (value instanceof Promise) return fromPromise(value)
  if (subscribable(value)) return Observable.from(value)
  if (thenable(value)) return fromPromise(value)
  if (typeof value === "function") return defer(value as Defer<T>)
  return Observable.of(value)
}

declare module "../observable/observable" {
  namespace Observable {
    export function castAsync<T>(value:Observable<T>):Observable<T>
    export function castAsync<T>(value:Promise<T>):Observable<T>
    export function castAsync<T>(value:ObservableLike<T>):Observable<T>
    export function castAsync<T>(value:PromiseLike<T>):Observable<T>
    export function castAsync<T>(value:T):Observable<T>
  }
}

Observable.castAsync = castAsync