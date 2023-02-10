import type {Observer, OnComplete, OnError, OnNext, Subscriber} from "../types"

if (!Symbol.observable) Object.defineProperty(Symbol, "observable", {value: Symbol("@@observable")})

function cleanupSubscription<T>(subscription:Subscription<T>) {
  const {cleanup} = subscription
  delete subscription.observer
  delete subscription.cleanup
  if (cleanup) cleanup()
}

export class SubscriptionObserver<T> implements Observer<T> {

  constructor(private subscription:Subscription<T>) {}

  get closed() {return this.subscription.closed}

  next(value?:T) {
    if (this.closed) return
    try {
      if (this.subscription.observer.next) this.subscription.observer.next(value)
    }
    catch (error) {
      Observable.hostReportErrors(error)
      this.error(error)
    }
  }

  error(error?:any) {
    if (this.closed) return
    try {
      if (this.subscription.observer.error) this.subscription.observer.error(error)
      cleanupSubscription(this.subscription)
    }
    catch (error) {
      Observable.hostReportErrors(error)
    }
  }

  complete() {
    if (this.closed) return
    try {
      if (this.subscription.observer.complete) this.subscription.observer.complete()
      cleanupSubscription(this.subscription)
    }
    catch (error) {
      Observable.hostReportErrors(error)
    }
  }
}


export class Subscription<T> {
  cleanup:() => void

  constructor(public observer:Observer<T>, subscriber:Subscriber<T>) {
    observer.start && observer.start(this)
    if (this.closed) {
      return
    }

    const subscriptionObserver = new SubscriptionObserver(this)

    try {
      const cleanup = subscriber(subscriptionObserver)
      if (cleanup instanceof Subscription) {
        this.cleanup = () => cleanup.unsubscribe()
      }
      else if (typeof cleanup === "function") {
        this.cleanup = cleanup
      }
    }
    catch (error) {
      Observable.hostReportErrors(error)
      subscriptionObserver.error(error)
      return
    }

    if (this.closed) {
      cleanupSubscription(this)
    }
  }

  get closed() {return this.observer === undefined}

  unsubscribe() {
    if (this.closed) return
    cleanupSubscription(this)
  }
}

export class Observable<T = unknown> implements PromiseLike<T> {

  constructor(private subscriber:Subscriber<T>) {
    if (typeof subscriber !== "function") {
      throw new TypeError("Observable initializer must be a function.")
    }
  }

  subscribe(next?:OnNext<T>, error?:OnError, complete?:OnComplete) {
    if (typeof next === "object") this.subscribe2(next)
    return this.subscribe2({next, error, complete})
  }

  subscribe2(observer:Observer<T>):Subscription<T>
  subscribe2(next?:OnNext<T>, error?:OnError, complete?:OnComplete):Subscription<T>
  subscribe2(observer?:Observer<T>|OnNext<T>, error?:OnError, complete?:OnComplete):Subscription<T> {
    if (typeof observer === "function") observer = {next: observer, error, complete}
    else if (typeof observer !== "object") observer = {}
    return new Subscription(observer, this.subscriber)
  }

  toPromise() {
    return new Promise<T>((resolve, reject) => {
      let s = null
      s = this.subscribe(
        (value) => {
          resolve(value)
          s && s.unsubscribe()
        },
        (error) => reject(error)
      )
    })
  }

  then<TResult1 = T, TResult2 = never>(onfulfilled?:((value:T) => TResult1|PromiseLike<TResult1>)|undefined|null, onrejected?:((reason:unknown) => TResult2|PromiseLike<TResult2>)|undefined|null):Promise<TResult1|TResult2> {
    return this.toPromise().then(onfulfilled, onrejected)
  }

  [Symbol.observable]() {
    return this
  }

  static from(x:unknown):Observable {
    if (Object(x) !== x) {
      throw new TypeError(x + " is not an object")
    }

    const Cls = (typeof this === "function") ? this : Observable

    if (typeof x.subscribe === "function") {
      return new Cls(observer => x.subscribe(observer))
    }

    // observable
    let method = x[Symbol.observable]
    if (method) {
      const observable = method.call(x)

      if (Object(observable) !== observable) {
        throw new TypeError(observable + " is not an object")
      }

      if (observable instanceof Cls) {
        return observable
      }

      return new Cls(observer => observable.subscribe(observer))
    }


    // iterable
    method = x[Symbol.iterator]
    if (method) {
      return new Cls(observer => {
        for (const item of method.call(x)) {
          observer.next(item)
          if (observer.closed) {
            return
          }
        }
        observer.complete()
      })
    }

    throw new TypeError(x + " is not observable")
  }

  static of<T>(...items:T[]):Observable<T> {
    const Cls = typeof this === "function" ? this : Observable

    return new Cls(observer => {
      for (const item of items) {
        observer.next(item)
        if (observer.closed) {
          return
        }
      }

      observer.complete()
    })
  }
}