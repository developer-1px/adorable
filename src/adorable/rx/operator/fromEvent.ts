import {Observable} from "../observable/observable"
import {fromEventPattern} from "./fromEventPattern"

export function fromEvent<T>(target:EventTarget, type:string, options?:boolean|AddEventListenerOptions):Observable<T> {
  return fromEventPattern<T>(
    (handler) => target.addEventListener(type, handler, options),
    handler => target.removeEventListener(type, handler, options)
  )
}

declare module "../observable/observable" {
  namespace Observable {
    export function fromEvent<T = Event>(target:EventTarget, type:string, options?:boolean|AddEventListenerOptions):Observable<T>
  }
}

// @ts-ignore
Observable.fromEvent = fromEvent