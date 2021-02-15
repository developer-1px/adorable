/// -------------------------------------------------------------------------------------------
/// Subject
/// -------------------------------------------------------------------------------------------
import {Observable} from "./observable"

const noop = () => {}

class MulticastedObservables extends Observable {
  constructor(subscriber) {
    super(observer => {
      if (this.closed) return subscriber(observer)
      this.observers.push(observer)
      subscriber(observer)
      return () => this.observers = this.observers.filter(o => o !== observer)
    })

    this.observers = []
  }

  get closed() {
    return this.observers === undefined
  }

  next(value) {
    if (this.closed) return
    for (const observer of this.observers) observer.next(value)
  }

  error(error) {
    if (this.closed) return
    for (const observer of this.observers) observer.error(error)
    delete this.observers
  }

  complete() {
    if (this.closed) return
    for (const observer of this.observers) observer.complete()
    delete this.observers
  }
}

export class Subject extends MulticastedObservables {
  constructor() {
    super(noop)
  }
}

export class BehaviorSubject extends MulticastedObservables {
  constructor(value) {
    super(observer => {
      if (this.hasOwnProperty("value")) {
        observer.next(this.value)
      }
    })

    if (arguments.length > 0) {
      this.value = value
    }
  }

  next(value) {
    this.value = value
    super.next(value)
  }
}

export class AsyncSubject extends MulticastedObservables {
  constructor() {
    super(observer => {
      if (this.closed) {
        observer.next(this.value)
        observer.complete()
      }
    })
  }

  next(value) {
    if (this.closed) return
    this.value = value
  }

  complete() {
    if (this.closed) return
    for (const observer of this.observers) observer.next(this.value)
    super.complete()
  }
}


export class ReplaySubject extends MulticastedObservables {
  constructor(bufferSize) {
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

  next(value) {
    if (this.closed) return
    this.value.push(value)
    this.value = this.value.slice(-this.bufferSize)
    super.next(value)
  }
}