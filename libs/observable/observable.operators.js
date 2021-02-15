import {__isFunction, filterCallback, mapCallback} from "../fp"
import {Observable} from "./observable.js"
import {Subject, BehaviorSubject} from "./subject"
import {no_console} from "../plugins/no-console-log"
import {audit, auditTime} from "./operators/audit"

const console = no_console

/// -------------------------------------------------------------------------------------------
/// Operators
/// -------------------------------------------------------------------------------------------
const noop = () => {
}

const just = _ => _

export const pipe = Observable.pipe = (...pipes) => (value) => pipes.reduce((f, g) => g(f), value)

export const lift = (callback) => (observable) => new Observable(observer => {
  const o = callback(observer) || {}
  const subscription = observable.subscribe(Object.setPrototypeOf(o, observer))
  observer.subscription = subscription

  return () => {
    subscription.unsubscribe()
    o.finalize && o.finalize()
  }
})

Observable.prototype.pipe = function (...operators) {return pipe(...operators)(this)}


/// -------------------------------------------------------------------------------------------
/// Operators
/// -------------------------------------------------------------------------------------------
export const map = (callback) => lift((observer, index = 0) => ({
  next(value) {
    observer.next(mapCallback(callback)(value, index++))
  }
}))

export const mapTo = (value) => lift(observer => ({
  next() {
    observer.next(value)
  }
}))

export const filter = (callback, elseCallback = noop) => lift((observer, index = 0, prev) => ({
  next(value) {
    if (filterCallback(callback)(value, index++, prev)) {
      observer.next(value)
    } else {
      elseCallback(value)
    }
    prev = value
  }
}))

export const scan = (accumulator, seed) => lift((observer, ret = seed) => ({
  next(value) {
    observer.next((ret = accumulator(ret, value)))
  }
}))

export const reject = (callback, elseCallback = noop) => filter((...args) => !filterCallback(callback)(...args), elseCallback)

export const bind = (onStart, onNext, onError = noop, onComplete = noop) => {
  if (!__isFunction(onStart)) onStart = noop
  if (!__isFunction(onNext)) onNext = noop
  if (!__isFunction(onError)) onError = noop
  if (!__isFunction(onComplete)) onComplete = noop

  return lift((observer, index = 0) => ({
    start() {
      onStart()
    },

    next(value) {
      onNext(value, index++)
      observer.next(value)
    },

    error(error) {
      onError(error)
      observer.error(error)
    },

    complete() {
      onComplete()
      observer.complete()
    }
  }))
}


export const tap = (onNext, onError = noop, onComplete = noop) => {
  if (!__isFunction(onNext)) onNext = noop
  if (!__isFunction(onError)) onError = noop
  if (!__isFunction(onComplete)) onComplete = noop

  let prev
  return lift((observer, index = 0) => ({
    next(value) {
      onNext(value, index++, prev)
      observer.next(value)
      prev = value
    },

    error(error) {
      onError(error)
      observer.error(error)
    },

    complete() {
      onComplete()
      observer.complete()
    }
  }))
}

export const take = (count) => lift((observer, _count = count) => ({
  start() {
    if (_count <= 0) observer.complete()
  },

  next(value) {
    observer.next(value)
    if (--_count <= 0) observer.complete()
  }
}))

export const takeLast = (count = 1) => lift((observer, res = []) => ({
  next(value) {
    res.push(value)
    res = res.slice(-count)
  },

  complete() {
    observer.next(res)
    observer.complete()
  }
}))

export const finalize = (finalize) => lift(() => ({finalize}))

export const initialize = (initialize) => (observable) => new Observable(observer => {

  const o = Object.setPrototypeOf({
    next(value) {
      initialize(value)
      observer.next(value)
      delete o.next
    }
  }, observer)

  return observable.subscribe(o)
})

export const count = () => lift((observer, count = 0) => ({
  next() {
    count++
  },
  complete() {
    observer.next(count)
  }
}))


export const concat = (...observables) => (observable) => Observable.concat(observable, ...observables)

export const startWith = (value) => (observable) => Observable.of(value).concat(observable)

export const skip = (count) => (observable) => observable.filter((value, index) => index >= count)

export const skipUntil = (notifier) => {

  let hasValue = false

  return lift(observer => ({
    start() {
      notifier.take(1).subscribe(() => hasValue = true)
    },

    next(value) {
      if (!hasValue) return
      observer.next(value)
    }
  }))
}

export const last = () => lift((observer, ret) => ({
  next(value) {
    ret = value
  },

  complete() {
    observer.next(ret)
    observer.complete()
  }
}))


export const catchError = (callback = noop) => (observable) => {
  const createCaught = () => lift((observer) => ({
    error(error) {
      const caught = createCaught()
      const o$ = Observable.castAsync(callback(error, caught))
      o$.subscribe(observer)
    }
  }))(observable)

  return createCaught()
}


export const distinctUntilChanged = (compare = Object.is) => lift((observer, prev, index = 0) => ({
  next(value) {
    if (0 === index++ || !compare(prev, value)) {
      observer.next(value)
      prev = value
    }
  }
}))


export const debounce = (dueTime) => { throw new Error("not implemented yet.") }

export const debounceTime = (dueTime) => lift((observer, timer) => ({
  next(value) {
    clearTimeout(timer)
    timer = setTimeout(() => observer.next(value), dueTime)
  }
}))

export const delay = (delayTime) => lift((observer, id, completed = false) => ({
  next(value) {
    id = setTimeout(() => {
      observer.next(value)
      if (completed) observer.complete()
    }, delayTime)
  },

  complete() {
    completed = true
  },

  finalize() {
    clearTimeout(id)
  }
}))


export const duration = (durationTime) => lift((observer, id, queue = [], completed = false) => ({
  next(value) {
    if (!id) {
      observer.next(value)
    } else {
      queue.push(value)
    }

    id = setTimeout(() => {
      if (queue.length) {
        observer.next(queue.shift())
      }
      if (completed) observer.complete()
    }, durationTime)
  },

  complete() {
    completed = true
  },

  finalize() {
    clearTimeout(id)
  }
}))


export const timeout = (duration, error) => lift((observer, id) => ({
  start() {
    clearTimeout(id)
    id = setTimeout(() => {
      observer.error(error)/// @TODO: 여기에 뭘 보내야 할까??
    }, duration)
  },

  next(value) {
    clearTimeout(id)
    id = setTimeout(() => {
      observer.error(error)/// @TODO: 여기에 뭘 보내야 할까??
    }, duration)

    observer.next(value)
  },

  finalize() {
    clearTimeout(id)
  }
}))


export const timeoutFirstOnly = (duration, error) => lift((observer, id) => ({
  start() {
    clearTimeout(id)
    id = setTimeout(() => {
      observer.error(error)
    }, duration)
  },

  next(value) {
    observer.next(value)
    clearTimeout(id)
  },

  finalize() {
    clearTimeout(id)
  }
}))


export const debug = (...tag) => lift(observer => ({
  start() {
    console.warn(...tag, ".start")
  },

  next(value) {
    console.warn(...tag, ".next", value)
    observer.next(value)
  },

  error(error) {
    console.error(...tag, ".error", error)
    observer.error(error)
  },

  complete() {
    console.warn(...tag, ".completed")
    observer.complete()
  },

  finalize() {
    console.warn(...tag, ".finalized")
  }
}))

export const trace = (...tag) => lift((observer, prev, index = 0) => ({
  next(value) {

    if (Observable.enableLog) {
      console.log(...tag.map(tag => "\x1b[35m " + tag), ":", prev, "→", value)
    }

    observer.next(value)
    prev = value
  },

  error(error) {
    console.error(...tag, error)
    observer.error(error)
  }

  // complete() {
  // 	console.log(...tag, "completed!");
  // 	observer.complete();
  // },

  // finalize() {
  // 	// console.groupEnd();
  // }
}))

export const throttle = (callback) => lift((observer, pending = false, s) => ({

  next(value) {
    if (!pending) {
      observer.next(value)
    }

    pending = true

    s = Observable.castAsync(callback(value)).subscribe({
      complete() {
        pending = false
      }
    })
  },

  finalize() {
    if (s) s.unsubscribe()
  }
}))

export const throttleTime = (duration) => throttle(() => Observable.timer(duration))

export const withLatestFrom = (...other) => lift((observer, s, value2, subject = new Subject()) => ({
  start() {
    s = Observable.combineLatest(...other, subject).subscribe({
      next(value) {
        value2 = [...value.slice(-1), ...value.slice(0, -1)]
      },

      error(error) {
        observer.error(error)
      }
    })
  },

  next(value) {
    subject.next(value)
    if (!value2) return
    observer.next(value2)
  },

  finalize() {
    if (s) s.unsubscribe()
    subject.complete()
  }
}))


export const waitFor = (...other) => lift((observer, s, value2, subject = new Subject(), isWaiting = false) => ({
  next(value) {
    s = s || Observable.combineLatest(...other, subject).subscribe({
      next(value) {
        value2 = [...value.slice(-1), ...value.slice(0, -1)]
        if (isWaiting) {
          isWaiting = false
          observer.next(value2)
        }
      },

      error(error) {
        observer.error(error)
      }
    })

    subject.next(value)
    if (!value2) return isWaiting = true

    observer.next(value2)
  },

  finalize() {
    if (s) s.unsubscribe()
    subject.complete()
  }
}))


export const takeUntil = (notifier) => (observable) => {
  return new Observable(observer => {
    const complete = observer.complete.bind(observer)
    const s = observable.subscribe(observer)
    const s2 = notifier.subscribe(complete, complete, complete)

    return () => {
      s.unsubscribe()
      s2.unsubscribe()
    }
  })
}

export const until = (notifier) => (observable) => {
  return new Observable(observer => {
    const s = observable.subscribe(observer)

    const unsubscribe = () => s.unsubscribe()
    const s2 = notifier.subscribe(unsubscribe, unsubscribe, unsubscribe)

    return () => {
      s.unsubscribe()
      s2.unsubscribe()
    }
  })
}

export const mergeAll = () => lift((observer, ret = []) => ({
  next(value) {
    ret.push(value)
  },
  complete() {
    observer.next(ret)
  }
}))


/// @TODO: inclusive
export const takeWhile = (callback = just, inclusive) => lift((observer, index = 0) => ({
  next(value) {
    Observable.castAsync(callback(value, index++)).subscribe(cond => {
      observer.next(value)
      if (!cond) observer.complete()
    })
  }
}))


export const share = () => (observable) => {
  let subscription, observers = []

  return new Observable(observer => {
    observers.push(observer)

    subscription = subscription || observable.subscribe({
      next(value) {
        for (const observer of observers) observer.next(value)
      },
      error(error) {
        for (const observer of observers) observer.error(error)
      },
      complete() {
        for (const observer of observers) observer.complete()
      }
    })

    return () => {
      observers = observers.filter(o => o !== observer)

      if (observers.length === 0) {
        subscription.unsubscribe()
        subscription = null
      }
    }
  })
}


export const shareReplay = (bufferSize = Infinity) => (observable) => {
  let buffer = []
  let observers = []
  let subscription

  return new Observable(observer => {
    if (subscription) {
      for (const value of buffer) {
        observer.next(value)
      }

      if (subscription.closed) {
        observer.complete()
        return
      }
    }

    observers.push(observer)

    subscription = subscription || observable.subscribe({
      next(value) {
        buffer.push(value)
        buffer = buffer.slice(-bufferSize)
        for (const observer of observers) observer.next(value)
      },

      error(error) {
        for (const observer of observers) observer.error(error)
      },

      complete() {
        for (const observer of observers) observer.complete()
      }
    })

    return () => {
      observers = observers.filter(o => o !== observer)
      if (observers.length === 0) {
        subscription.unsubscribe()
        subscription = null
      }
    }
  })
}


export const subscribe = (...args) => observable => observable.subscribe(...args)

export const retry = (count = Infinity, error) => (observable) => {
  if (count <= 0) {
    return Observable.throw(error)
  }

  return new Observable(observer => {
    let s1, s2

    s1 = observable.subscribe(Object.setPrototypeOf({
      error: (err) => {
        s1.unsubscribe()
        s2 = retry(--count, err)(observable).subscribe(observer)
      }
    }, observer))

    return () => {
      s1.unsubscribe()
      s2 && s2.unsubscribe()
    }
  })
}


export const retryWhen = (notifier) => (observable) => {
  return new Observable(observer => {
    let s1, s2, s3
    let subject = new Subject()

    s1 = observable.subscribe(Object.setPrototypeOf({
      error: (err) => {
        s2 = s2 || notifier(subject).subscribe(() => {
          s3 = observable.subscribe(Object.setPrototypeOf({
            error: (err) => subject.next(err)
          }, observer))
        })

        subject.next(err)
      }
    }, observer))

    return () => {
      subject.complete()
      s1.unsubscribe()
      s2 && s2.unsubscribe()
      s3 && s3.unsubscribe()
    }
  })
}


export const repeat = (count = Infinity) => (observable) => {
  if (count <= 0) {
    return observable.complete()
  }

  return new Observable(observer => {
    let s1, s2

    s1 = observable.subscribe(Object.setPrototypeOf({
      complete: () => {
        s1.unsubscribe()
        s2 = repeat(--count)(observable).subscribe(observer)
      }
    }, observer))

    return () => {
      s1.unsubscribe()
      s2 && s2.unsubscribe()
    }
  })
}


/// -------------------------------------------------------------------------------------------
/// Flatten Map Functions
/// -------------------------------------------------------------------------------------------
export const mergeMap = (callback = just) => lift((observer) => {
  let completed = false
  let subscriptions = []

  const complete = () => completed && subscriptions.every(s => s.closed) && observer.complete()
  const mergeMapObserver = Object.setPrototypeOf({complete}, observer)

  return {
    next(value) {
      subscriptions.push(Observable.castAsync(callback(value)).subscribe(mergeMapObserver))
    },

    complete() {
      completed = true
      complete()
    },

    finalize() {
      for (const subscription of subscriptions) subscription.unsubscribe()
    }
  }
})

export const switchMap = (callback = just) => lift(observer => {
  let completed = false
  let subscription

  const switchMapObserver = Object.setPrototypeOf({
    complete() {
      completed && observer.complete()
    }
  }, observer)

  return {
    next(value) {
      if (subscription) subscription.unsubscribe()
      subscription = Observable.castAsync(callback(value)).subscribe(switchMapObserver)
    },

    complete() {
      completed = true
      if (!subscription || (subscription && subscription.closed)) {
        observer.complete()
      }
    },

    finalize() {
      if (subscription) subscription.unsubscribe()
    }
  }
})

export const exhaustMap = (callback = just) => lift(observer => {
  let completed = false
  let subscription

  const exhaustMapObserver = Object.setPrototypeOf({
    complete() {
      completed && observer.complete()
    }
  }, observer)

  return {
    next(value) {
      if (subscription && !subscription.closed) return
      subscription = Observable.castAsync(callback(value)).subscribe(exhaustMapObserver)
    },

    complete() {
      completed = true

      if (!subscription || (subscription && subscription.closed)) {
        observer.complete()
      }
    },

    finalize() {
      if (subscription) subscription.unsubscribe()
    }
  }
})

export const connectMap = (callback = just) => lift(observer => {
  let subscription

  return {
    next(value) {
      if (subscription) subscription.unsubscribe()
      subscription = Observable.castAsync(callback(value)).subscribe(observer)
    },

    complete() {
    },

    finalize() {
      if (subscription) subscription.unsubscribe()
    }
  }
})

export const concatMap = (callback = just) => lift(observer => {

  let sourceCompleted = false
  let running = false
  let subscriptions = []

  const queue = []

  function doQueue() {
    if (running) return

    running = true
    const value = queue.shift()
    const observable = Observable.castAsync(callback(value))

    let completed = false
    const concatMapObserver = Object.setPrototypeOf({complete: () => completed = true}, observer)

    const subscription = observable
      .finalize(() => {
        if (!completed) {
          observer.subscription.unsubscribe()
          return
        }

        running = false

        if (queue.length === 0) {
          if (sourceCompleted) {
            observer.complete()
          }
          return
        }

        doQueue()
      })
      .subscribe(concatMapObserver)

    subscriptions.push(subscription)
  }

  return {
    next(value) {
      queue.push(value)
      doQueue()
    },

    complete() {
      sourceCompleted = true
      if (queue.length === 0 && running === false) {
        observer.complete()
      }
    },

    finalize() {
      for (const subscription of subscriptions) subscription.unsubscribe()
    }
  }
})

export const bufferCount = (bufferSize, startBufferEvery = null) => lift(observer => {

  startBufferEvery = startBufferEvery || bufferSize
  let buffer = []

  return {
    next(value) {
      buffer.push(value)
      if (buffer.length === bufferSize) {
        observer.next(buffer)
        buffer = buffer.slice(startBufferEvery)
      }
    },

    finalize() {
      buffer = null
    }
  }
})


export const bufferTime = (duration) => lift(observer => {

  let timer
  let group = []

  return {
    start() {
      timer = setInterval(() => {
        const value = [...group]
        group = []
        observer.next(value)
      }, duration)
    },

    next(value) {
      group.push(value)
    },

    finalize() {
      clearInterval(timer)
    }
  }
})

export const publishBehavior = (defaultValue) => (observable) => {
  const behaviorSubject = defaultValue === undefined ? new BehaviorSubject() : new BehaviorSubject(defaultValue)
  observable.subscribe(behaviorSubject)
  return behaviorSubject
}

Observable.prototype.audit = function (callback) { return this.pipe(audit(...arguments))}
Observable.prototype.auditTime = function (duration) { return this.pipe(auditTime(...arguments))}
Observable.prototype.bind = function (action) { return this.pipe(bind(...arguments))}
Observable.prototype.bufferCount = function (bufferSize, startBufferEvery) { return this.pipe(bufferCount(...arguments))}
Observable.prototype.bufferTime = function (duration) { return this.pipe(bufferTime(...arguments))}
Observable.prototype.catchError = function (callback) { return this.pipe(catchError(...arguments))}
Observable.prototype.concat = function (...observables) { return this.pipe(concat(...arguments))}
Observable.prototype.concatMap = function (callback) { return this.pipe(concatMap(...arguments))}
Observable.prototype.connectMap = function (callback) { return this.pipe(connectMap(...arguments))}
Observable.prototype.count = function () { return this.pipe(count())}
Observable.prototype.debounce = function (debounceTime) { return this.pipe(debounce(...arguments))}
Observable.prototype.debounceTime = function (dueTime) { return this.pipe(debounceTime(...arguments))}
Observable.prototype.debug = function (tag) { return this.pipe(debug(...arguments))}
Observable.prototype.delay = function (delayTime) { return this.pipe(delay(...arguments))}
Observable.prototype.distinctUntilChanged = function (compare) { return this.pipe(distinctUntilChanged(...arguments))}
Observable.prototype.duration = function (durationTime) { return this.pipe(duration(...arguments))}
Observable.prototype.exhaustMap = function (callback) { return this.pipe(exhaustMap(...arguments))}
Observable.prototype.filter = function (callback, elseCallback) { return this.pipe(filter(...arguments))}
Observable.prototype.finalize = function (callback) { return this.pipe(finalize(...arguments))}
Observable.prototype.initialize = function (callback) { return this.pipe(initialize(...arguments))}
Observable.prototype.last = function () { return this.pipe(last())}
Observable.prototype.map = function (callback) { return this.pipe(map(...arguments))}
Observable.prototype.mapTo = function (value) { return this.pipe(mapTo(...arguments))}
Observable.prototype.mergeAll = function () { return this.pipe(mergeAll())}
Observable.prototype.mergeMap = function (callback) { return this.pipe(mergeMap(...arguments))}
Observable.prototype.reject = function (callback) { return this.pipe(reject(...arguments))}
Observable.prototype.retry = function (count) { return this.pipe(retry(count))}
Observable.prototype.retryWhen = function (count) { return this.pipe(retryWhen(count))}
Observable.prototype.repeat = function (count) { return this.pipe(repeat(count))}
Observable.prototype.scan = function (accumulator, seed) { return this.pipe(scan(...arguments))}
Observable.prototype.share = function () { return this.pipe(share(...arguments))}
Observable.prototype.shareReplay = function (bufferSize) { return this.pipe(shareReplay(...arguments))}
Observable.prototype.skip = function (count) { return this.pipe(skip(...arguments))}
Observable.prototype.skipUntil = function (notifier) { return this.pipe(skipUntil(...arguments))}
Observable.prototype.startWith = function (value) { return this.pipe(startWith(...arguments))}
Observable.prototype.switchMap = function (callback) { return this.pipe(switchMap(...arguments))}
Observable.prototype.tap = function (callback) { return this.pipe(tap(...arguments))}
Observable.prototype.take = function (count) { return this.pipe(take(...arguments))}
Observable.prototype.takeLast = function (num) { return this.pipe(takeLast(...arguments))}
Observable.prototype.takeUntil = function (notifier) { return this.pipe(takeUntil(...arguments))}
Observable.prototype.takeWhile = function (callback) { return this.pipe(takeWhile(...arguments))}
Observable.prototype.timeout = function (duration) { return this.pipe(timeout(...arguments))}
Observable.prototype.timeoutFirstOnly = function (duration) { return this.pipe(timeoutFirstOnly(...arguments))}
Observable.prototype.throttle = function (callback) { return this.pipe(throttle(...arguments))}
Observable.prototype.throttleTime = function (time) { return this.pipe(throttleTime(...arguments))}
Observable.prototype.trace = function (tag) { return this.pipe(trace(...arguments))}
Observable.prototype.withLatestFrom = function (...observables) { return this.pipe(withLatestFrom(...arguments))}
Observable.prototype.waitFor = function (...observables) { return this.pipe(waitFor(...arguments))}
Observable.prototype.until = function (notifier) { return this.pipe(until(...arguments))}

Observable.prototype.publishBehavior = function (defaultValue) { return this.pipe(publishBehavior(...arguments))}


Observable.prototype.toPromise = function () { return new Promise((resolve, reject) => this.subscribe(resolve, reject))}


/* rxjs full operator *\/
audit
auditTime
buffer
bufferCount
bufferTime
bufferToggle
bufferWhen
catchError
combineAll
combineLatest (deprecated)
concat (deprecated)
concatAll
concatMap
concatMapTo
count
debounce
debounceTime
defaultIfEmpty
delay
delayWhen
dematerialize
distinct
distinctUntilChanged
distinctUntilKeyChanged
elementAt
endWith
every
exhaust
exhaustMap
expand
filter
finalize
find
findIndex
first
flatMap
groupBy
ignoreElements
isEmpty
last
map
mapTo
materialize
max
merge (deprecated)
mergeAll
mergeMap
mergeMapTo
mergeScan
min
multicast
observeOn
onErrorResumeNext
pairwise
partition (deprecated)
pluck
publish
publishBehavior
publishLast
publishReplay
race (deprecated)
reduce
refCount
repeat
repeatWhen
retry
retryWhen
sample
sampleTime
scan
sequenceEqual
share
shareReplay
single
skip
skipLast
skipUntil
skipWhile
startWith
subscribeOn
switchAll
switchMap
switchMapTo
take
takeLast
takeUntil
takeWhile
tap
throttle
throttleTime
throwIfEmpty
timeInterval
timeout
timeoutWith
timestamp
toArray
window
windowCount
windowTime
windowToggle
windowWhen
withLatestFrom
zip (deprecated)
zipAll
*/