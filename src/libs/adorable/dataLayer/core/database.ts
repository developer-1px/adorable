import {__array_unique} from "../../../fp/array"
import {BehaviorSubject, castAsync, Observable, Subscription} from "../../rx"
import {itself, safe_not_equal} from "../internal"
import type {Ref} from "../types"
import type {Collection} from "./crud"
import {__state__, middleware$} from "./middleware"

const get = <T>(path:string, defaultValue:T):T|undefined => {
  let object = __state__.database
  path.split("/").filter(Boolean).every(prop => (object = object[prop]))
  return object === undefined ? defaultValue : object
}

const set = <T>(path:string, value:T) => {
  const paths = ["database", ...path.split("/").filter(Boolean)]
  const prop = paths.pop()
  const key = paths.pop()

  if (!key || !prop) throw new Error("invalid path")

  let object = __state__
  paths.every(path => {
    object = object[path] = object[path] || Object.create(null)
    return object
  })

  if (value === undefined && object[key]) {
    object[key] = {...object[key]}
    delete object[key][prop]
    return object[key]
  }

  return (object[key] = {...object[key], [prop]: value})
}

const remove = (path:string) => {
  const paths = ["database", ...path.split("/").filter(Boolean)]
  const prop = paths.pop()
  const key = paths.pop()

  if (!key || !prop) throw new Error("invalid path")

  let object = __state__
  paths.every(prop => (object = object[prop]))

  if (!object[key]) {
    return
  }

  if (Array.isArray(object[key]) && Number.isInteger(prop)) {
    object[key] = [...object[key]]
    const ret = object[key][prop]
    object[key].splice(prop, 1)
    return ret
  }

  object[key] = {...object[key]}
  const ret = object[key][prop]
  delete object[key][prop]
  return ret
}

const memo = Object.create(null)

export interface ReadonlyDateBaseRef<T, U = T> extends Observable<T> {
  path:string
  value:T
  query():T[]
  toArray<R = T extends Collection<U> ? U[] : T>():R[]
  orderBy<R = T>(compareFn?:(a:R, b:R) => number):Observable<R[]>
  orderByChild(key:string):Observable<T[]>
}

interface DateBaseRef<T, U = T> extends Ref<T> {
  prev:Subscription
  isStopPropagation:boolean

  remove():T
  query():T[]
  toArray<R = T extends Collection<U> ? U[] : T>():R[]
  orderBy<R = T>(compareFn?:(a:R, b:R) => number):Observable<R[]>
  orderByChild(key:string):Observable<T[]>
}

function update(path:string) {
  if (!path || !memo[path]) return
  const value = get(path, undefined)
  if (safe_not_equal(memo[path].value, value)) {
    memo[path].value = value
    return path
  }
}

function notify(path:string) {
  memo[path].next(memo[path].value)
}

let broadcast_paths:string[] = []

const broadcast = (path:string) => {

  // 이벤트 전파 예약
  if (broadcast_paths.length === 0) {
    Promise.resolve().then(() => {
      const update_broadcast_paths = __array_unique(broadcast_paths)
      broadcast_paths = []
      update_broadcast_paths.forEach(notify)
    })
  }

  // 이벤트 전파 (downcast)
  Object.keys(memo).filter(p => p !== path && p.startsWith(path + "/")).forEach(downPath => {
    if (update(downPath)) {
      broadcast_paths.push(downPath)
    }
  })

  // 이벤트 전파 (upcast)
  path.split("/").forEach((_, index, A) => {
    const subPath = A.slice(0, A.length - index - 1).join("/")
    if (update(subPath)) {
      broadcast_paths.push(subPath)
    }
  })
}


const transaction_queue = []

export const transaction = (callback:Function) => {

  const my_transaction = []
  transaction_queue.push(my_transaction)
  const cb = callback()
  transaction_queue.splice(transaction_queue.indexOf(my_transaction), 1)

  return castAsync(cb)
    .toPromise()
    .catch(() => {
      my_transaction.forEach(([r$, value]) => r$.set(value))
    })
}

export function database<T = unknown>(path:string, defaultValue?:T|undefined):DateBaseRef<T> {
  path = "/" + path.split("/").filter(Boolean).join("/")

  if (path && memo[path]) {
    const r$ = memo[path]
    r$.value = r$.value ?? defaultValue
    return r$
  }

  const initValue:T|undefined = get(path, defaultValue)
  const r$ = new BehaviorSubject<T|undefined>(initValue) as DateBaseRef<T>

  r$.path = path

  r$.set = (value:T|Observable<T>):T => {

    const setAndNotify = (value:T) => {
      if (safe_not_equal(r$.value, value)) {
        transaction_queue[transaction_queue.length - 1]?.push([r$, r$.value])
        set(path, value)
        r$.next(value)
        middleware$.next(["database", {path, value}])
        broadcast(path)
      }
      return value
    }

    // @FIXME
    if (r$.prev) {
      r$.prev.unsubscribe()
      delete r$.prev
    }

    // @FIXME
    if (value instanceof Observable) {
      r$.prev = value.subscribe(setAndNotify)
      return value
    }

    // console.groupCollapsed("[database]", path, r$.value, "->", value, safe_not_equal(r$.value, value))
    // console.trace("")
    // console.groupEnd()

    // 변경사항 전파
    return setAndNotify(value)
  }
  r$.update = (project = itself) => r$.set(project(r$.value))

  r$.remove = () => {
    const {value} = r$
    r$.set(undefined)
    return value
  }


  r$.orderBy = (compareFn?:(a:T, b:T) => number):Observable<T[]> => {
    const makeCollection = (value:Record<string, T>) => Object.values(value || {}).filter(a => a !== undefined && a !== null).sort(compareFn)
    return r$
      .map(items => makeCollection(items))
      .startWith(() => makeCollection(r$.value))
  }

  r$.query = ():T[] => {
    return Object.values(r$.value || {}).filter(a => a !== undefined && a !== null)
  }

  r$.toArray = ():T[] => {
    return Object.values(r$.value || {}).filter(a => a !== undefined && a !== null)
  }

  return (memo[path] = r$)
}