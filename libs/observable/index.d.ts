import {Action, Writable} from "../dataLayer"

type Subscriber = (subscriber: SubscriptionObserver) => Subscription | (() => void) | void
type OnNextCallback = (value: any) => void
type OnErrorCallback = (value: any) => void
type OnCompleteCallback = () => void

interface Observer {
  next: OnNextCallback
  error: OnErrorCallback
  complete: OnCompleteCallback
}

interface SubscriptionObserver extends Observer {
  readonly closed: Boolean
}

interface Subscription {
  readonly closed: Boolean
  unsubscribe(): void
}

export interface Observable {
  subscribe(observer: Observer | OnNextCallback, error?: OnErrorCallback, complete?: OnCompleteCallback): Subscription
  pipe(...operators): Observable
  toPromise(): Promise

  audit(callback: (value: any) => any): Observable
  auditTime(duration: number): Observable
  bind(onStart, onNext, onError, onComplete): Observable
  // bufferCount(bufferSize: number, startBufferEvery?: number)
  // bufferTime(duration: number)
  // catchError(callback): Observable
  concat(...observables: Observable[]): Observable
  concatMap(callback): Observable
  connectMap(callback): Observable
  // count(): Observable
  debounce(debounceTime: number): Observable
  // debounceTime(dueTime: number): Observable
  debug(tag: string): Observable
  // delay(delayTime: number): Observable
  // distinctUntilChanged(compare: (a, b) => boolean): Observable
  duration(durationTime: number): Observable
  // exhaustMap(callback): Observable
  // filter(callback: Function, elseCallback?: Function): Observable
  // finalize(callback): Observable
  // initialize(callback): Observable
  // last(): Observable
  // map(callback): Observable
  // mapTo(value): Observable
  // mergeAll(): Observable
  // mergeMap(callback): Observable
  reject(callback: Function, elseCallback?: Function): Observable
  retry(count: number): Observable
  repeat(count: number): Observable
  // scan(accumulator, seed): Observable
  // share(): Observable
  // shareReplay(bufferSize: number): Observable
  // skip(count: number): Observable
  // skipUntil(notifier: Observable): Observable
  startWith(value): Observable
  switchMap(callback): Observable
  tap(onNext, onError?, onComplete?): Observable
  take(count: number): Observable
  takeLast(num: number): Observable
  takeUntil(notifier: Observable): Observable
  takeWhile(callback): Observable
  timeout(duration: number): Observable
  throttle(callback): Observable
  throttleTime(time: number): Observable
  trace(tag: string): Observable
  withLatestFrom(...observables): Observable
  waitFor(...observables): Observable
  until(notifier): Observable

  createEffect(observer?: Observer | OnNextCallback, error?: Function, complete?: Function): Subscription;
  dispatch(action: any[]): Subscription;
  dispatch(type: Action | String, callback?: Function): Subscription;
  writeTo(writable: Writable, value?: any): Observable
  writeTo(writable: Writable, update?: Function): Observable
}

export declare const Observable: {
  new(subscriber: Subscriber): Observable;
  from(observable: Observable): Observable;
  of(...args: any[]): Observable

  // NEVER: Observable
  // EMPTY: Observable
  // never(): Observable
  // empty(): Observable

  // timer(duration: number): Observable
  // timer(initialDelay: number, period?: number): Observable
  // defer(callback, thisObj?, ...args): Observable
  // fromEvent(el: HTMLElement | Window, type: string, useCapture: Boolean): Observable
  throwError(error): Observable
  // fromPromise(promise: Promise<any>): Observable
  // castAsync(value): Observable
  forkjoin(...observables): Observable
  // concat(...observables): Observable
  zip(...observables): Observable
  // merge(...observables): Observable
  // combineLatest(...observables): Observable
  combineAnyway(...observables): Observable
  reduce(...defs): Observable
}


export interface Subject extends Observable {
  next: OnNextCallback
  error: OnErrorCallback
  complete: OnCompleteCallback
}

export interface BehaviorSubject extends Subject {
  value: any
}

export interface AsyncSubject extends Subject {
  value: any
}

export interface ReplaySubject extends Subject {
  value: any
}


export declare const Subject
export declare const BehaviorSubject
export declare const AsyncSubject
export declare const ReplaySubject

export declare function lift(callback): (observable) => Observable