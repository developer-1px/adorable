import {lift} from "../internal/lift"
import {Observable} from "../observable/observable"
import {castAsync} from "../operator/castAsync"

export const catchError = <T>(callback:(error:any, caught:Observable<T>) => Observable<T>) => (observable:Observable<T>) => {

  const createCaught = () => lift<T, T>((observer) => ({
    error(error:any) {
      const caught:Observable<T> = createCaught()
      const o$ = castAsync(callback(error, caught) ?? caught)
      o$.subscribe2(observer)
    }
  }))(observable)

  return createCaught()
}


declare module "../observable/observable" {
  interface Observable<T> {
    catchError(callback:(error:any, caught:Observable<T>) => Observable<T>|void):Observable<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.catchError = function() {return catchError(...arguments)(this)}