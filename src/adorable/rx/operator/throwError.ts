import {Observable} from "../observable/observable"

export const throwError = (error:any) => new Observable(observer => observer.error(error))

declare module "../observable/observable" {
  namespace Observable {
    export function throwError(error:any):Observable
  }
}

Observable.throwError = throwError