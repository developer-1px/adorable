import {BehaviorSubject} from "../../rx"
import {safe_not_equal} from "../internal"
import type {ReducerCallback, Ref} from "../types"
import {createEffectSubscriptions} from "./createEffect"
import {__state__} from "./middleware"

const itself = <T>(value:T) => value
const guid = (prefix = "") => prefix + Math.random().toString(36).slice(2) + "-" + Math.random().toString(36).slice(2)

const memo = Object.create(null)
const memoDestroyCallback = Object.create(null)
const memoSubscriptions = Object.create(null)

export function ref<T>(value:T|undefined = undefined, path:string = guid("#")):Ref<T> {
  if (memo[path]) return memo[path]

  const r$:Ref<T> = (value === undefined ? new BehaviorSubject<T>() : new BehaviorSubject<T>(value)) as Ref<T>
  r$.path = path

  r$.set = (value) => {
    if (safe_not_equal(r$.value, value)) {
      r$.next(value)
    }
    return value
  }

  r$.update = (project = itself<T>) => r$.set(project(r$.value))

  // @FIXME: 임시 log
  if (path.charAt(0) !== "#") {
    // @ts-ignore // @FIXME: database / store 임시 보관
    r$.tap(value => __state__.store[path] = value)
      .tap(() => {
        console.groupCollapsed("(callStack)")
        console.trace("")
        console.groupEnd()
      })
      .trace(path)
      .createEffect()
  }

  return memo[path] = r$
}

type ToStringable<T> = T extends { toString(): string } ? T : never;

export function reducer<T>(value:T|undefined, path:string|ToStringable, callback:ReducerCallback<T>):Ref<T> {

  path = path.toString()

  if (memoSubscriptions[path]) {
    for (const s of memoSubscriptions[path]) s.unsubscribe()
  }
  if (memoDestroyCallback[path]) {
    memoDestroyCallback[path]()
  }

  const ref$ = ref(value, path)

  Promise.resolve().then(() => {
    const subscriptions = createEffectSubscriptions()
    memoDestroyCallback[path] = callback(ref$)
    memoSubscriptions[path] = [...subscriptions]
  })

  return memo[path] = ref$
}