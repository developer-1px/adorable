import {Observable} from "../observable/observable"
import {throttle} from "./throttle"
import {timer} from "../operator/timer"

export const throttleTime = (duration:number) => throttle(() => timer(duration, duration))

declare module "../observable/observable" {
  interface Observable<T> {
    throttleTime(duration:number):Observable<T>
  }
}

// @ts-ignore
Observable.prototype.throttleTime = function() { return throttleTime(...arguments)(this) }