import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const duration = <T>(durationTime:number) => lift<T, T>(observer => {
  let id:ReturnType<typeof setTimeout>; let completed = false
  const queue:T[] = []

  return {
    next(value:T) {
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

    cleanup() {
      clearTimeout(id)
    }
  }
})


declare module "../observable/observable" {
  interface Observable<T> {
    duration(durationTime:number):Observable<T>
  }
}

// eslint-disable-next-line prefer-rest-params
Observable.prototype.duration = function() {return duration(...arguments)(this)}