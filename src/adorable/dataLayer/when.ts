import {Observable} from "../rx"

export const when = <T>(flag$:Observable<boolean>, stream:() => Observable<T>) => flag$
  .distinctUntilChanged()
  .switchMap(flag => flag ? stream() : Observable.NEVER)
  .createEffect()
