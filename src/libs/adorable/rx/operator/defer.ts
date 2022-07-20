import {Observable} from "../observable/observable"
import type {Asyncable} from "../types"

export const defer = <T>(callback:(...args:any[]) => Asyncable<T>, thisObj?:any, ...args:any[]) => new Observable<T>(observer =>
  Observable.castAsync(Function.prototype.apply.call(callback, thisObj, args)).subscribe(observer)
)

declare module "../observable/observable" {
  namespace Observable {
    export function defer<T>(callback:(...args:any[]) => Asyncable<T>, thisObj?:any, ...args:any[]):Observable<T>
  }
}

// @ts-ignore
Observable.defer = defer