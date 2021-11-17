import {Observable} from "../../rx"
import type {Ref} from "../types"
import {createEffectSubscriptions} from "./createEffect"
import {reducer} from "./ref"

export function epic(flag$:Observable<boolean>) {

  const _reducer = <T>(value:T|undefined, path:string, callback:(ref$:Ref<T>) => Function|void) => reducer<T>(value, path, ref$ => {

    const a = () => new Observable<T>(observer => {
      const subscriptions = createEffectSubscriptions()
      const destroyCallback = callback(ref$)
      createEffectSubscriptions()
      ref$.createEffect(observer)

      return () => {
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