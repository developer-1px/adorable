/// Subject
import {Observable, Observer, Subscriber, SubscriptionObserver} from "./observable"

const noop = () => {}

class MulticastedObservables<T> extends Observable<T> implements Observer<T> {
  protected observers:SubscriptionObserver<T>[]|undefined = []

  constructor(subscriber:Subscriber<T>) {
    super(observer => {
      if (!this.observers) return subscriber(observer)
      this.observers.push(observer)
      subscriber(observer)
      return () => {
        if (!this.observers) return
        this.observers = this.observers.filter(o => o !== observer)
      }
    })
  }

  get closed() { return this.observers === undefined }

  next(value?:T) {
    if (!this.observers) return
    for (const observer of this.observers) observer.next(value)
  }

  error(error?:any) {
    if (!this.observers) return
    for (const observer of this.observers) observer.error(error)
    delete this.observers
  }

  complete() {
    if (!this.observers) return
    for (const observer of this.observers) observer.complete()
    delete this.observers
  }
}

export class Subject<T> extends MulticastedObservables<T> {
  constructor() {
    super(noop)
  }
}

export class BehaviorSubject<T> extends MulticastedObservables<T> {
  public value:T|undefined

  constructor(value?:T) {
    super(observer => {
      if (this.hasOwnProperty("value")) {
        observer.next(this.value)
      }
    })

    if (arguments.length > 0) {
      this.value = value
    }
    else {
      delete this.value
    }
  }

  next(value:T) {
    this.value = value
    super.next(value)
  }
}

export class AsyncSubject<T> extends MulticastedObservables<T> {
  public value:T|undefined

  constructor() {
    super(observer => {
      if (this.closed) {
        observer.next(this.value)
        observer.complete()
      }
    })
  }

  next(value:T) {
    if (!this.observers) return
    this.value = value
  }

  complete() {
    if (!this.observers) return
    for (const observer of this.observers) observer.next(this.value)
    super.complete()
  }
}


export class ReplaySubject<T> extends MulticastedObservables<T> {
  public value:T[] = []

  constructor(private readonly bufferSize:number) {
    super(observer => {
      for (const value of this.value) {
        observer.next(value)
      }

      if (this.closed) {
        observer.complete()
      }
    })

    this.value = []
    this.bufferSize = bufferSize
  }

  next(value:T) {
    if (this.closed) return
    this.value.push(value)
    this.value = this.value.slice(-this.bufferSize)
    super.next(value)
  }
}