import {__array_unique} from "../../../fp/array"
import {BehaviorSubject, Observable} from "../../rx"
import {itself, safe_not_equal} from "../internal"
import type {Ref} from "../types"
import {__state__, middleware$} from "./middleware"

const get = <T>(path:string, defaultValue:T):T|undefined => {
  let object = __state__.database
  path.split("/").filter(Boolean).every(prop => (object = object[prop]))
  return object === undefined ? defaultValue : object
}

function set<T>(path:string, value:T) {
  if (arguments.length !== 2) throw new Error("value arguments must be required.")

  let object = __state__
  const paths = ["database", ...path.split("/").filter(Boolean)]

  const prop = paths.pop()
  const key = paths.pop()

  if (!key || !prop) throw new Error("invalid path")

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

const memo = Object.create(null)


interface DateBaseRef<T> extends Ref<T> {
  isStopPropagation:boolean

  remove():T
  query():T[]
  toArray():T[]
  orderBy(compareFn?:(a:T, b:T) => number):Observable<T[]>
  orderByChild(key:string):Observable<T[]>
}


let broadcast_paths:string[] = []

function notify(path:string, value:any) {
  if (!memo[path]) return
  if (safe_not_equal(memo[path].value, value)) {
    memo[path].next(value)
  }
}

export function database<T = any>(path:string, defaultValue?:T|undefined):DateBaseRef<T> {
  path = "/" + path.split("/").filter(Boolean).join("/")

  if (path && memo[path]) {
    const r$ = memo[path]
    r$.value = get(path, defaultValue)
    return r$
  }

  const initValue:T|undefined = get(path, defaultValue)
  const r$ = new BehaviorSubject<T|undefined>(initValue) as DateBaseRef<T>

  r$.path = path

  r$.set = (value:T|Observable<T>):T => {

    // @FIXME
    if (r$.prev) {
      r$.prev.unsubscribe()
      delete r$.prev
    }

    // @FIXME
    if (value instanceof Observable) {
      r$.prev = value.subscribe(value => r$.set(value))
      return value
    }

    // console.groupCollapsed("[database]", path, r$.value, "->", value, safe_not_equal(r$.value, value))
    // console.trace("")
    // console.groupEnd()

    // 변경사항 전파
    if (safe_not_equal(r$.value, value)) {

      set(path, value)
      r$.next(value)
      middleware$.next(["database", {path, value}])

      // 이벤트 전파 예약
      if (broadcast_paths.length === 0) {
        Promise.resolve().then(() => {
          const update_broadcast_paths = __array_unique(broadcast_paths)
          broadcast_paths = []
          update_broadcast_paths.forEach(path => notify(path, get(path, defaultValue)))
        })
      }

      // 이벤트 전파 (downcast)
      Object.keys(memo).filter(p => p !== path && p.startsWith(path)).filter(Boolean).forEach(path => {
        broadcast_paths.push(path)
      })

      // 이벤트 전파 (upcast)
      path.split("/").forEach((_, index, A) => {
        const subPath = A.slice(0, A.length - index - 1).join("/")
        if (subPath) {
          broadcast_paths.push(subPath)
        }
      })
    }

    return value
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