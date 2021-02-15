import {Observable} from "../observable/observable"
import {fromEventPattern} from "./fromEventPattern"

export function fromEvent<T>(target:EventTarget, type:string, useCapture?:boolean):Observable<T> {
  return fromEventPattern<T>(
    (handler) => target.addEventListener(type, handler, useCapture),
    handler => target.removeEventListener(type, handler, useCapture)
  )
}

declare module "../observable/observable" {
  namespace Observable {
    export function fromEvent<T = Event>(target:EventTarget, type:string, useCapture?:boolean):Observable<T>
  }
}

// @ts-ignore
Observable.fromEvent = fromEvent