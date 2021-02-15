import {Observable} from "../observable/observable"

export const concat = <T>(...observables:Observable<T>[]):Observable<T> => Observable.of(...observables).concatMap(Observable.castAsync) as Observable<T>

declare module "../observable/observable" {
  namespace Observable {
    export function concat<T>(...observable:Observable<T>[]):Observable<T>
  }
}

Observable.concat = concat