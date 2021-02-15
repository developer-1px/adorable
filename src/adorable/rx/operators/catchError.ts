import {Observable} from "../observable/observable"
import {lift} from "../internal/lift"
import {castAsync} from "../operator/castAsync"

export const catchError = <T>(callback:(error:any, caught:Observable<T>) => Observable<T>) => (observable:Observable<T>) => {

  const createCaught = () => lift<T, T>((observer) => ({
    error(error) {
      const caught:Observable<T> = createCaught()
      const o$ = castAsync(callback(error, caught) ?? caught)
      o$.subscribe(observer)
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
Observable.prototype.catchError = function() { return catchError(...arguments)(this) }