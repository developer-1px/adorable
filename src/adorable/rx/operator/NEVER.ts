import {Observable} from "../observable/observable"

export const NEVER = new Observable<never>(() => {})

declare module "../observable/observable" {
  namespace Observable {
    export let NEVER:Observable<never>
  }
}

Observable.NEVER = NEVER