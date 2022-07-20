import {Observable} from "../observable/observable"

export const EMPTY = new Observable<void>(observer => observer.complete())

declare module "../observable/observable" {
  namespace Observable {
    export let EMPTY:Observable<void>
  }
}

Observable.EMPTY = EMPTY