import {Observable} from "./observable.js"
import {__castArray} from "../fp"

const noop = () => {}

/// -------------------------------------------------------------------------------------------
/// Static Operators
/// -------------------------------------------------------------------------------------------
export const never = Observable.never = () => new Observable(noop)
export const empty = Observable.empty = () => new Observable(observer => observer.complete())

export const NEVER = Observable.NEVER = Observable.never()
export const EMPTY = Observable.EMPTY = Observable.empty()


/// -------------------------------------------------------------------------------------------
/// Creation
/// -------------------------------------------------------------------------------------------
export const defer = Observable.defer = (callback, thisObj, ...args) => new Observable(observer =>
  Observable.castAsync(Function.prototype.apply.call(callback, thisObj, args)).subscribe(observer)
)

export const timer = (initialDelay, period) => new Observable((observer, i = 0, id1, id2) => {
  id1 = setTimeout(() => {
    if (observer.closed) return

    observer.next(i++)
    if (!period) return observer.complete()
    if (!id1) return

    id2 = setInterval(() => {
      if (observer.closed) return
      observer.next(i++)
    }, period)

  }, initialDelay)

  return () => {
    clearTimeout(id1)
    clearInterval(id2)
    id1 = undefined
    id2 = undefined
  }
})

export const fromEvent = Observable.fromEvent = (el, type, useCapture) => new Observable(observer => {
  type = __castArray(type)
  const handler = observer.next.bind(observer)
  type.forEach(type => el.addEventListener(type, handler, useCapture))
  return () => type.forEach(type => el.removeEventListener(type, handler, useCapture))
}).share()

export const throwError = Observable.throwError = (error) => new Observable(observer => observer.error(error))


export const fromPromise = Observable.fromPromise = (promise) => new Observable(observer => {
  promise.then(
    res => {
      observer.next(res)
      observer.complete()
    },

    err => observer.error(err)
  )
})


/// -------------------------------------------------------------------------------------------
/// Utils
/// -------------------------------------------------------------------------------------------
// @FIXME: 내가 만든거
export const castAsync = Observable.castAsync = (value) => {
  if (value instanceof Observable) return value
  if (value instanceof Promise) return Observable.fromPromise(value)
  if (typeof value === "function") return Observable.defer(value)
  if (value && typeof value.then === "function") return Observable.fromPromise(value)
  if (value && typeof value.subscribe === "function") return Observable.from(value)
  return Observable.of(value)
}


/// -------------------------------------------------------------------------------------------
/// Combination
/// -------------------------------------------------------------------------------------------
export const forkjoin = Observable.forkjoin = (...observables) => new Observable(observer => {
  let ret = new Array(observables.length)
  let count = 0

  if (ret.length === 0) {
    observer.next(ret)
    observer.complete()
    return
  }

  observables.forEach((observable, index) => {
    observable.last().subscribe(value => {
      ret[index] = value
      if (++count === ret.length) {
        observer.next(ret)
        observer.complete()
      }
    })
  })
})

const concat = Observable.concat = (...observables) => Observable.of(...observables).concatMap(Observable.castAsync)

export const zip = Observable.zip = (...observables) => new Observable(observer => {
  const stack = new Array(observables.length).fill(null).map(() => [])
  const subscriptions = observables.map((observable, index) => {

    return observable.subscribe(value => {
      stack[index].push(value)

      if (stack.every(v => v.length > 0)) {
        const ret = []
        stack.forEach(v => ret.push(v.shift()))
        observer.next(ret)
      }
    })
  })

  return () => {
    for (const s of subscriptions) s.unsubscribe()
  }
})

export const merge = Observable.merge = (...observables) => new Observable(observer => {
  const length = observables.length
  let count = 0

  const mergeObserver = Object.setPrototypeOf({
    complete() {
      if (++count === length) {
        observer.complete()
      }
    }
  }, observer)

  const subscriptions = observables.map(observable => observable && observable.subscribe(mergeObserver))

  return () => {
    for (const s of subscriptions) s.unsubscribe()
  }
})

export const combineLatest = Observable.combineLatest = (...observables) => new Observable(observer => {
  const arr = Array(observables.length)
  let combined = false
  let num_completed = 0

  const combine = (observable, index) => observable.subscribe({
    next(value) {
      arr[index] = value

      if (!combined) {
        let count = 0
        for (let i = 0; i < arr.length; i++) { count += (i in arr)}
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

  const subscriptions = observables.map(castAsync).map(combine)

  return () => {
    for (const s of subscriptions) s.unsubscribe()
  }
})


export const combineAnyway = Observable.combineAnyway = (...observables) => {
  return new Observable(observer => {
    let arr = Array(observables.length)

    if (!arr.length) {
      observer.next([])
      observer.complete()
      return
    }

    for (let i = 0; i < arr.length; i++) {
      arr[i] = undefined
    }

    const combine = (observable, index) => observable.subscribe({
      next(value) {
        arr[index] = value
        observer.next(arr)
      },

      error(error) {
        observer.error(error)
      },

      complete() {

      }
    })

    const subscriptions = observables.map(combine)

    return () => {
      for (const s of subscriptions) s.unsubscribe()
    }
  })
}

Observable.timer = timer