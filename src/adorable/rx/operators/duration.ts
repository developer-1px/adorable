import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"

export const duration = <T>(durationTime:number) => lift<T, T>(observer => {
  let id:NodeJS.Timeout, completed = false
  const queue:T[] = []

  return {
    next(value) {
      if (!id) observer.next(value)
      else queue.push(value)

      id = setTimeout(() => {
        if (queue.length) observer.next(queue.shift())
        if (completed) observer.complete()
      }, durationTime)
    },

    complete() {
      completed = true
    },

    finalize() {
      clearTimeout(id)
    }
  }
})



declare module "../observable/observable" {
  interface Observable<T> {
    duration(durationTime:number):Observable<T>
  }
}

// @ts-ignore
Observable.prototype.duration = function() { return duration(...arguments)(this) }