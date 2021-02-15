import {Observable, Subject} from "../observable"
import {onMount} from "svelte"
import {no_console} from "../plugins/no-console-log"

const console = no_console
const itself = (value) => value

let autoUnSubscribe = [s => {

  try {
    s.refCount = s.refCount || 0
    s.refCount++

    onMount(() => () => {
      s.unsubscribe()
    })
  } catch (e) {}

}]

Observable.prototype.createEffect = function (...args) {
  const s = this.catchError(error => console.error(error)).subscribe(...args)
  autoUnSubscribe[0](s)
  return s
}

Observable.prototype.createEffect.enter = (callback) => {
  let old = autoUnSubscribe.slice()
  autoUnSubscribe.unshift(callback)
  return () => autoUnSubscribe = old
}

const _createAction = (type, constructor = itself) => {
  const f = (...payload) => [type, constructor(...payload)]
  f.toString = () => type
  return f
}

export const action = (type, constructor = itself) => {
  type = type.toString()
  const f = _createAction(type, constructor)

  f.REQUEST = _createAction(type + ".REQUEST")
  f.SUCCESS = _createAction(type + ".SUCCESS")
  f.FAILURE = _createAction(type + ".FAILURE")

  f.START = _createAction(type + ".START")
  f.NEXT = _createAction(type + ".NEXT")
  f.ERROR = _createAction(type + ".ERROR")
  f.COMPLETE = _createAction(type + ".COMPLETE")

  f.CANCEL = _createAction(type + ".CANCEL")
  return f
}

export const actions$ = new Subject()

const makeAction = (type, payload) => {
  if (Array.isArray(type)) {
    [type, payload] = type
  }

  return [type.toString(), payload]
}

let index = 0

const queue = []
let isPending = false

const next = (type, payload) => (actions$.next([type, payload]), payload)

const _dispatch = (type, payload) => {

  if (isPending) {
    console.log("isPending", type, payload)
    queue.push([type, payload])
    return payload
  }

  if (type.charAt(0) !== "#") {
    console.log("")
    console.group("#" + index + " " + type)
    console.log("#" + index + " " + type, payload)
    index++

    // isPending = true
    next(type, payload)
    // isPending = false

    while (queue.length) {
      const [type, payload] = queue.shift()
      _dispatch(type, payload)
    }

    console.groupEnd()
    console.log("")
  }
  else {
    // isPending = true
    next(type, payload)
    // isPending = false

    while (queue.length) {
      const [type, payload] = queue.shift()
      _dispatch(type, payload)
    }
  }

  return payload
}


// @TODO: 라이브러리로 이동할것!
const _splitByIndex = (index) => (string, i = index < 0 ? string.length : index) => [string.slice(0, i), string.slice(i)]

const _splitByCallback = (callback) => (string) => _splitByIndex(callback(string))(string)

const _splitByExt = _splitByCallback(str => str.lastIndexOf("."))




const isAsync = (value) => {
  if (value instanceof Observable) return true
  if (value instanceof Promise) return true
  if (typeof value === "function") return true
  if (value && typeof value.then === "function") return true
  if (value && typeof value.subscribe === "function") return true
  return false
}



export const dispatch = (type, payload, startValue) => {
  if (!type) {
    throw new TypeError("'action' must be required. Do not use dispatch()")
  }

  [type, payload] = makeAction(type, payload)

  /// @TODO: Epic => 추후 미들웨어로 분리할 것! [2020. 5. 28]
  const [_type, _extend] = _splitByExt(type)

  if (isAsync(payload)) {
    if (_extend === ".START") {
      const subject = new Subject()
      _dispatch(type, startValue)
      Observable.castAsync(payload)
        .tap(
          value => _dispatch(_type + ".NEXT", value),
          error => _dispatch(_type + ".ERROR", error),
          () => _dispatch(_type + ".COMPLETE")
        )
        .createEffect(subject)
      return subject
    }

    if (_extend === ".REQUEST") {
      const subject = new Subject()
      _dispatch(type, startValue)
      Observable.castAsync(payload)
        .tap(
          value => _dispatch(_type + ".SUCCESS", value),
          error => _dispatch(_type + ".FAILURE", error),
          () => {}
        )
        .createEffect(subject)
      return subject
    }
  }

  return _dispatch(type, payload)
}


Observable.prototype.dispatch = function (type, payload) {
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


/// on
const memo = {}
const _on = (type) => {

  if (type && typeof type.subscribe === "function") {
    return type
  }

  type = type.toString()
  return memo[type] = memo[type] || actions$
    .filter(action => action[0] === type)
    .map(action => action[1])
    .share()
}

export const on = (...type) => Observable.merge(...type.map(_on))

Observable.prototype.todo = function (message) {
  return this.tap(() => console.log("\x1b[43m" + message))
}