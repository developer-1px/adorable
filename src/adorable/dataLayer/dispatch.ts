import {Asyncable, Observable, Subject} from "../rx"
import type {Action, SingleActionCreator} from "./action"

export const actions$ = new Subject<Action<any>>()

/// on
const memo = Object.create(null)


type OnAble<T> = SingleActionCreator<T>|Observable<T>|string

const _on = <T>(type:OnAble<T>):Observable<T> => {
  // @ts-ignore
  if (type && typeof type.subscribe === "function") return type

  type = type.toString()
  return memo[type] = memo[type] || actions$
    .filter(action => action[0] === type)
    .map(action => action[1])
    .share()
}

export const on = <T>(...type:OnAble<T>[]):Observable<T> => Observable.merge(...type.map(_on))


/// dispatch
const makeAction = <T>(type:string, payload:T) => {
  if (Array.isArray(type)) [type, payload] = type
  return [type.toString(), payload]
}

const next = <T>(type:string, payload:T) => (actions$.next([type, payload]), payload)

let index = 0

const _dispatch = <T>(type:string, payload:T):T => {

  const hasLog = type && type.charAt(0) !== "#"

  if (hasLog) {
    console.log("")
    console.group("#" + index + " " + type)
    console.log("#" + index + " " + type, payload)
    index++
  }

  next(type, payload)

  if (hasLog) {
    console.groupEnd()
    console.log("")
  }

  return payload
}


// @TODO: 라이브러리로 이동할것!
const _splitByIndex = (index:number) => (string:string, i:number = index < 0 ? string.length : index) => [string.slice(0, i), string.slice(i)]
const _splitByCallback = (callback:(str:string) => number) => (string:string) => _splitByIndex(callback(string))(string)
const _splitByExt = _splitByCallback(str => str.lastIndexOf("."))

const isAsync = (value:any) => {
  if (value instanceof Observable) return true
  if (value instanceof Promise) return true
  if (typeof value === "function") return true
  if (value && typeof value.then === "function") return true
  if (value && typeof value.subscribe === "function") return true
  return false
}

export function dispatch<T>(params:Action<T>):T
export function dispatch<T>(type:SingleActionCreator<T>|string, payload?:T):T
export function dispatch<T>(type:SingleActionCreator<T>|string, payload?:Asyncable<T>, startValue?:T):Asyncable<T>
export function dispatch<T, R>(type:SingleActionCreator<T>|string, payload?:Asyncable<R>, startValue?:T):Asyncable<R>
export function dispatch<T>(type:Action<T>|SingleActionCreator<T>|string, payload?:T|Asyncable<T>, startValue?:T):T|Asyncable<T> {

  if (!type) {
    throw new TypeError("'action' must be required. Do not use dispatch() only.")
  }

  const [_type, __payload] = makeAction(type, payload)


  /// @TODO: Epic => 추후 미들웨어로 분리할 것! [2020. 5. 28]
  const [__type, _extend] = _splitByExt(_type)

  if (isAsync(__payload)) {
    if (_extend === ".START") {
      const subject = new Subject<T>()
      _dispatch(_type, startValue)
      Observable.castAsync(__payload)
        .tap(
          value => _dispatch(__type + ".NEXT", value),
          error => _dispatch(__type + ".ERROR", error),
          () => _dispatch(__type + ".COMPLETE")
        )
        .createEffect(subject)

      return subject
    }

    if (_extend === ".REQUEST") {
      const subject = new Subject<T>()
      _dispatch(_type, startValue)
      Observable.castAsync(__payload)
        .tap(
          value => _dispatch(__type + ".SUCCESS", value),
          error => _dispatch(__type + ".FAILURE", error),
          () => {}
        )
        .createEffect(subject)

      return subject
    }
  }

  return _dispatch(_type, __payload)
}



declare module "../rx/observable/observable" {
  interface Observable<T> {
    dispatch<R>(type:Action<R>):R
    dispatch<T>(type:SingleActionCreator<T>|string):T
    dispatch<R>(type:SingleActionCreator<R>|string, payload:R):R
    dispatch<R>(type:SingleActionCreator<R>|string, payload:(value:T) => R):R
  }
}

Observable.prototype.dispatch = function <T>(type:Action<T>|SingleActionCreator<T>|string, payload?:T) {
  if (!type) return this.createEffect()

  // case1. .dispatch(GO("내 정보"));
  if (arguments.length === 1 && Array.isArray(type)) {
    return this.mergeMap(() => dispatch(type)).createEffect()
  }

  // case2. 	.dispatch(data => GO(data.id, data.params))
  if (arguments.length === 1 && typeof type === "function") {
    return this.map(type).mergeMap(action => dispatch(action)).createEffect()
  }

  // case2-2. 	.dispatch("ACTION")
  if (arguments.length === 1 && typeof type === "string") {
    return this.mergeMap(params => dispatch(type, params)).createEffect()
  }

  // case3. 	.dispatch(학습진도현황_조회하기.REQUEST, account => aicms.retrieveMypageInfo(account.email))
  if (arguments.length === 2 && typeof payload === "function") {
    return this.map(payload).mergeMap(payload => dispatch(type, payload)).createEffect()
  }

  throw new TypeError("[Observable.prototype.dispatch] invalid arguments. " + type + " " + payload)
}