import {Observable} from "../rx"
import {reducer, Ref} from "./ref"
import {createEffectSubscriptions} from "./createEffect"

export function epic(flag$:Observable<boolean>) {

  const _reducer = <T>(value:T|undefined, path:string, callback:(ref$:Ref<T>) => Function|void) => reducer<T>(value, path, ref$ => {

    const a = () => new Observable<T>(observer => {
      const subscriptions = createEffectSubscriptions()
      const destroyCallback = callback(ref$)
      createEffectSubscriptions()
      ref$.subscribe(observer)

      return () => {
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ destroyCallback!!!", path, destroyCallback, subscriptions)

        destroyCallback && destroyCallback()
        for (const s of subscriptions) s.unsubscribe()
      }
    })

    flag$
      .distinctUntilChanged()
      .switchMap(flag => flag ? a() : Observable.NEVER)
      .createEffect()
  })

  return {
    reducer: _reducer
  }
}