import {Observable, OnComplete, OnError} from "../observable/observable"
import {lift} from "../internal/lift"

const noop = () => {}
const makeFunction = (f:any):Function => typeof f === "function" ? f : noop

export const tap = <T>(onNext:((value:T, index:number) => void)|null = noop, onError:OnError|null = noop, onComplete:OnComplete|null = noop) => lift<T, T>(observer => {
  const _onNext = makeFunction(onNext)
  const _onError = makeFunction(onError)
  const _onComplete = makeFunction(onComplete)

  let index = 0
  return {
    next(value) {
      _onNext(value, index++)
      observer.next(value)
    },

    error(error) {
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
Observable.prototype.tap = function() { return tap(...arguments)(this) }