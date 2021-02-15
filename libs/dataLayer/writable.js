import {BehaviorSubject, Observable, Subject} from "../observable"
import {no_console} from "../plugins/no-console-log"

const console = no_console

const noop = () => {}
const itself = (value) => value
const guid = (prefix = "") => prefix + Math.random().toString(36).slice(2)

const memo = Object.create(null)

export const writes$ = new Subject()

export function ref(initValue, path = guid("#")) {
  if (path && memo[path]) return memo[path]

  const writable = (initValue === undefined ? new BehaviorSubject() : new BehaviorSubject(initValue))
  writable.path = path
  writable.set = (value) => writable.next(value)
  writable.reset = () => writable.next(initValue)
  writable.update = (callback = itself) => writable.next(callback(writable.value))

  writes$.next([path, writable])
  return memo[path] = writable
}

Observable.prototype.writeTo = function (writable, pipe = itself) {
  if (typeof writable.set !== "function") throw new TypeError(writable + " is not writable.")

  const unwrap_thunk = (value) => {
    let callback = pipe

    if (typeof callback !== "function") return callback
    callback = callback(value)

    if (typeof callback !== "function") return callback
    return callback(writable.value)
  }

  const subject = new Subject()
  this.tap(value => writable.set(unwrap_thunk(value))).createEffect(subject)
  return subject
}


const memo2 = Object.create(null)

export function reducer(initValue, path, callback) {
  if (!callback && path && memo2[path]) return memo2[path]

  // console.warn("[reducer]", path, initValue)
  const ref$ = ref(initValue, path)

  const r = new Observable(observer => {
    const destroyCallback = callback(ref$) || noop
    const s = ref$.subscribe(observer)

    return () => {
      console.warn("[reducer::finalize]", path, r.value, ref$)
      destroyCallback()
      s.unsubscribe()
    }

  }).tap(value => r.value = value).shareReplay(1)

  r.value = initValue
  r.path = path
  r.update = () => ref$.update()

  return memo2[path] = r
}