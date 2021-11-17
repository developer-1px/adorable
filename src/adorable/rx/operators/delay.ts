import {Observable} from "../observable/observable"
import {timer} from "../operator/timer"
import {delayWhen} from "./delayWhen"

export const delay = <T>(delayTime:number) => delayWhen<T>(() => timer(delayTime))

declare module "../observable/observable" {
  interface Observable<T> {
    delay(delayTime:number):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.delay = function() {return delay(...arguments)(this)}