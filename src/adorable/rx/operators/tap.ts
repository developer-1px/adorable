import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"
import type {OnComplete, OnError} from "../types"

const noop = () => {}
const castFunction = (f:any):Function => typeof f === "function" ? f : noop

export const tap = <T>(onNext:((value:T, index:number) => void)|null = noop, onError:OnError|null = noop, onComplete:OnComplete|null = noop) => lift<T, T>(observer => {
  const _onNext = castFunction(onNext)
  const _onError = castFunction(onError)
  const _onComplete = castFunction(onComplete)

  let index = 0
  return {
    next(value:T) {
      _onNext(value, index++)
      observer.next(value)
    },

    error(error:any) {
      _onError(error)
      observer.error(error)
    },

    complete() {
      _onComplete()
      observer.complete()
    }
  }
})

declare module "../observable/observable" {
  interface Observable<T> {
    tap(onNext:((value:T, index:number) => void)|null, onError?:OnError|null, onComplete?:OnComplete|null):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.tap = function() {return tap(...arguments)(this)}