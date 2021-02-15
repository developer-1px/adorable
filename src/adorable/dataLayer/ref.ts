import {Subject, BehaviorSubject} from "../rx"

export interface Ref<T> extends BehaviorSubject<T> {
  path:string
  value:T
  set(value:T):T
  update(project:(value:T) => T):T
  update():T
}

const itself = (value:any) => value
const guid = (prefix = "") => prefix + Math.random().toString(36).slice(2) + "-" + Math.random().toString(36).slice(2)

const memo = Object.create(null)

export const writes$ = new Subject()

export function ref<T>(value:T|undefined = undefined, path:string = guid("#")):Ref<T> {
  if (path && memo[path]) return memo[path]

  const r:Ref<T> = (value === undefined ? new BehaviorSubject<T>() : new BehaviorSubject<T>(value)) as Ref<T>
  r.path = path
  r.set = (value) => !void r.next(value) && value
  r.update = (project = itself) => r.set(project(r.value))

  writes$.next([path, r])

  // @FIXME: 임시 log
  if (path.charAt(0) !== "#") {
    r.trace(path).createEffect()
  }

  return memo[path] = r
}



const memo2 = Object.create(null)

export type ReducerCallback<T> = (ref:Ref<T>) => Function|void

export type Reducer<T> = (value:T|undefined, path:string, callback:ReducerCallback<T>) => Ref<T>

export function reducer<T>(value:T|undefined, path:string, callback:ReducerCallback<T>):Ref<T> {
  if (!callback && path && memo2[path]) return memo2[path]

  const ref$ = ref(value, path)
  let destroyCallback:Function|void

  try {
    destroyCallback = callback(ref$)
  }
  catch (e) {
    Promise.resolve().then(() => destroyCallback = callback(ref$))
  }

  return memo2[path] = ref$
}