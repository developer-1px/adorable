import {Observable} from "../observable/observable"
import {timer} from "../operator/timer"
import {throttle} from "./throttle"

export const throttleTime = (duration:number) => throttle(() => timer(duration, duration))

declare module "../observable/observable" {
  interface Observable<T> {
    throttleTime(duration:number):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.throttleTime = function() {return throttleTime(...arguments)(this)}