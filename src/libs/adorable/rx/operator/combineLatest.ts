import {Observable} from "../observable/observable"

export function combineLatest<T>(observable:Observable<T>):Observable<T[]>
export function combineLatest<T1, T2>(o1:Observable<T1>, o2:Observable<T2>):Observable<[T1, T2]>
export function combineLatest<T1, T2, T3>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>):Observable<[T1, T2, T3]>
export function combineLatest<T1, T2, T3, T4>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>):Observable<[T1, T2, T3, T4]>
export function combineLatest<T1, T2, T3, T4, T5>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>, o5:Observable<T5>):Observable<[T1, T2, T3, T4, T5]>
export function combineLatest<T1, T2, T3, T4, T5, T6>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>, o5:Observable<T5>, o6:Observable<T6>):Observable<[T1, T2, T3, T4, T5, T6]>
export function combineLatest<T1, T2, T3, T4, T5, T6, T7>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>, o5:Observable<T5>, o6:Observable<T6>, o7:Observable<T7>):Observable<[T1, T2, T3, T4, T5, T6, T7]>
export function combineLatest<T1, T2, T3, T4, T5, T6, T7, T8>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>, o5:Observable<T5>, o6:Observable<T6>, o7:Observable<T7>, o8:Observable<T8>):Observable<[T1, T2, T3, T4, T5, T6, T7, T8]>
export function combineLatest<T1, T2, T3, T4, T5, T6, T7, T8, T9>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>, o5:Observable<T5>, o6:Observable<T6>, o7:Observable<T7>, o8:Observable<T8>, o9:Observable<T9>):Observable<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>
export function combineLatest<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>, o5:Observable<T5>, o6:Observable<T6>, o7:Observable<T7>, o8:Observable<T8>, o9:Observable<T9>, o10:Observable<T10>):Observable<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>
export function combineLatest<T>(...observables:Observable<T>[]):Observable<T[]>

export function combineLatest(...observables:Observable[]) {
  return new Observable(observer => {
    if (observables.length === 0) {
      observer.next([])
      return
    }

    const arr = Array(observables.length)
    let combined = false
    let num_completed = 0

    const combine = (observable:Observable, index:number) => observable.subscribe2({
      next(value) {
        arr[index] = value

        if (!combined) {
          let count = 0
          for (let i = 0; i < arr.length; i++) {count += +(i in arr)}
          combined = count === arr.length
        }

        combined && observer.next(arr.slice())
      },

      error(error) {
        observer.error(error)
      },

      complete() {
        num_completed++
        if (num_completed === arr.length) {
          observer.complete()
        }
      }
    })

    const subscriptions = observables.map(combine)

    return () => {
      for (const s of subscriptions) s.unsubscribe()
    }
  })
}


declare module "../observable/observable" {
  namespace Observable {
    export function combineLatest<T>(observable:Observable<T>):Observable<T[]>
    export function combineLatest<T1, T2>(o1:Observable<T1>, o2:Observable<T2>):Observable<[T1, T2]>
    export function combineLatest<T1, T2, T3>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>):Observable<[T1, T2, T3]>
    export function combineLatest<T1, T2, T3, T4>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>):Observable<[T1, T2, T3, T4]>
    export function combineLatest<T1, T2, T3, T4, T5>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>, o5:Observable<T5>):Observable<[T1, T2, T3, T4, T5]>
    export function combineLatest<T1, T2, T3, T4, T5, T6>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>, o5:Observable<T5>, o6:Observable<T6>):Observable<[T1, T2, T3, T4, T5, T6]>
    export function combineLatest<T1, T2, T3, T4, T5, T6, T7>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>, o5:Observable<T5>, o6:Observable<T6>, o7:Observable<T7>):Observable<[T1, T2, T3, T4, T5, T6, T7]>
    export function combineLatest<T1, T2, T3, T4, T5, T6, T7, T8>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>, o5:Observable<T5>, o6:Observable<T6>, o7:Observable<T7>, o8:Observable<T8>):Observable<[T1, T2, T3, T4, T5, T6, T7, T8]>
    export function combineLatest<T1, T2, T3, T4, T5, T6, T7, T8, T9>(o1:Observable<T1>, o2:Observable<T2>, o3:Observable<T3>, o4:Observable<T4>, o5:Observable<T5>, o6:Observable<T6>, o7:Observable<T7>, o8:Observable<T8>, o9:Observable<T9>):Observable<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>
    export function combineLatest<T>(...observables:Observable<T>[]):Observable<T[]>
  }
}

Observable.combineLatest = combineLatest