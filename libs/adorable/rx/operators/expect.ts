import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"

export const expect = <T>(msg:string) => lift<T, T>(observer => ({
  error(error:any) {
    Observable.hostReportErrors(msg)
    observer.error(error)
  }
}))

declare module "../observable/observable" {
  interface Observable<T> {
    expect(msg:string):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.expect = function() {return expect(...arguments)(this)}