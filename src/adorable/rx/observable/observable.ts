// @ts-ignore
if (!Symbol.observable) Object.defineProperty(Symbol, "observable", {value: Symbol("observable")})

export type Subscriber<T> = (observer:SubscriptionObserver<T>) => Subscription|Function|void

export type OnStart<T> = (subscription:Subscription) => void
export type OnNext<T> = (value:T) => void
export type OnError = (value:Error|any) => void
export type OnComplete = () => void

export interface Observer<T> {
  start?:OnStart<T>
  next?:OnNext<T>
  error?:OnError
  complete?:OnComplete
}

function cleanupSubscription(subscription:Subscription) {
  const cleanup = subscription.cleanup
  // @ts-ignore
  delete subscription.observer
  delete subscription.cleanup
  if (cleanup) cleanup()
}

export class SubscriptionObserver<T> implements Observer<T> {
  constructor(private subscription:Subscription) {}

  get closed() { return this.subscription.closed }

  next(value?:T) {
    if (this.closed) return
    try {
      // @ts-ignore
      if (this.subscription.observer.next) this.subscription.observer.next(value)
    }
    catch (error) {
      // @ts-ignore
      Observable.hostErrorHandler(error)
      this.error(error)
    }
  }

  error(error?:any) {
    if (this.closed) return
    try {
      // @ts-ignore
      if (this.subscription.observer.error) this.subscription.observer.error(error)
      cleanupSubscription(this.subscription)
    }
    catch (error) {
      // @ts-ignore
      Observable.hostErrorHandler(error)
    }
  }

  complete() {
    if (this.closed) return
    try {
      // @ts-ignore
      if (this.subscription.observer.complete) this.subscription.observer.complete()
      cleanupSubscription(this.subscription)
    }
    catch (error) {
      // @ts-ignore
      Observable.hostErrorHandler(error)
    }
  }
}


export class Subscription {
  cleanup:Function|undefined

  constructor(public observer:Observer<any>, subscriber:Subscriber<any>) {
    observer.start && observer.start(this)
    if (this.closed) {
      return
    }

    const subscriptionObserver = new SubscriptionObserver(this)

    try {
      const cleanup = subscriber.call(undefined, subscriptionObserver)
      if (cleanup instanceof Subscription) {
        this.cleanup = () => cleanup.unsubscribe()
      }
      else if (typeof cleanup === "function") {
        this.cleanup = cleanup
      }
    }
    catch (error) {
      // @ts-ignore
      Observable.hostErrorHandler(error)
      subscriptionObserver.error(error)
      return
    }

    if (this.closed) {
      cleanupSubscription(this)
    }
  }

  get closed() { return this.observer === undefined }

  unsubscribe() {
    if (this.closed) return
    cleanupSubscription(this)
  }
}

export class Observable<T = any> {
  constructor(private subscriber:Subscriber<T>) {
    if (typeof subscriber !== "function") {
      throw new TypeError("Observable initializer must be a function.")
    }
  }

  subscribe(observer:Observer<T>):Subscription
  subscribe(next?:OnNext<T>, error?:OnError, complete?:OnComplete):Subscription
  subscribe(observer?:Observer<T>|OnNext<T>, error?:OnError, complete?:OnComplete):Subscription {
    if (typeof observer === "function") observer = {next: observer, error, complete}
    else if (typeof observer !== "object") observer = {}
    return new Subscription(observer, this.subscriber)
  }

  // @ts-ignore
  [Symbol.observable]() {
    return this
  }

  static from(x:any):Observable {
    if (Object(x) !== x) {
      throw new TypeError(x + " is not an object")
    }

    const cls = (typeof this === "function") ? this : Observable

    // observable
    // @ts-ignore
    let method = x[Symbol.observable]
    if (method) {
      const observable = method.call(x)

      if (Object(observable) !== observable) {
        throw new TypeError(observable + " is not an object")
      }

      if (observable instanceof cls) {
        return observable
      }

      return new cls(observer => observable.subscribe(observer))
    }


    // iterable
    method = x[Symbol.iterator]
    if (method) {
      // @ts-ignore
      return new cls(observer => {
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
    const cls = typeof this === "function" ? this : Observable

    // @ts-ignore
    return new cls(observer => {
      for (const item of items) {
        observer.next(item)
        if (observer.closed) {
          return
        }
      }

      observer.complete()
    })
  }

  pipe(...operators:Function[]):Observable<T> {
    return pipe(...operators)(this)
  }
}


declare module "../observable/observable" {
  namespace Observable {
    export function pipe(...pipes:Function[]):any

    export function hostErrorHandler(error:any):void
  }
}

export const pipe = (...pipes:Function[]):any => (value:any) => pipes.reduce((f, g) => g(f), value)
Observable.pipe = pipe

Observable.hostErrorHandler = (error) => {
  if (error instanceof Error) {
    console.error(error)
  }
}