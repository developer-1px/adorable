import {Observable} from "../observable/observable"
import {pipe} from "../operator/pipe"

declare module "../observable/observable" {
  interface Observable<T> {
    pipe(...operators:Function[]):Observable<T>
  }
}

// eslint-disable-next-line prefer-rest-params
Observable.prototype.pipe = function() {return pipe(...arguments)(this)}