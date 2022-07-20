import {Observable, Subject} from "../../rx"
import type {Ref} from "../types"

declare module "../../rx/observable/observable" {
  interface Observable<T> {
    writeTo(w:Ref<T>):Observable<T>
    writeTo(w:Ref<NonNullable<T>|null>):Observable<NonNullable<T>>
    writeTo<T>(w:Ref<T>):Observable<T>
    writeTo<R>(w:Ref<T>):Observable<R>
    writeTo<T>(w:Ref<T>, project:(value:T) => (value:T) => T):Observable<T>
    writeTo<R>(w:Ref<T>, project:(value:T) => R):Observable<T>
    writeTo<R>(ref:Ref<R>, value:R):Observable<R>
  }
}

// @ts-ignore
const itself = t => t
const isFunction = (f:any):f is Function => typeof f === "function"

Observable.prototype.writeTo = function <T>(ref:Ref<T>, pipe = itself) {
  if (typeof ref.set !== "function") throw new TypeError(ref + " is not ref.")

  const unwrap_thunk = (value:T) => {
    let callback = pipe

    if (!isFunction(callback)) return callback
    callback = callback(value)

    if (!isFunction(callback)) return callback
    return callback(ref.value)
  }

  const subject = new Subject()
  const s = this.tap(value => ref.set(unwrap_thunk(value))).createEffect(subject)
  return new Observable(observer => {
    subject.createEffect(observer)
    return s
  })
}
