import {Observable} from "../observable/observable"
import {delayWhen} from "./delayWhen"
import {timer} from "../operator/timer"

export const delay = <T>(delayTime:number) => delayWhen<T>(() => timer(delayTime))

declare module "../observable/observable" {
  interface Observable<T> {
    delay(delayTime:number):Observable<T>
  }
}

// @ts-ignore
Observable.prototype.delay = function() { return delay(...arguments)(this) }