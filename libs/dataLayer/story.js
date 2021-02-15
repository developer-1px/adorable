import {no_console} from "../plugins/no-console-log"

const console = no_console

import {Observable, Subject} from "../observable"
import {dispatch} from "./action"

export const story = (desc, callback) => {
  console.log("[story]", desc)

  let given$ = Observable.of(true)
  let when$ = Observable.NEVER
  let when_desc = ""

  const given = (desc, observable) => given$ = observable

  const when = (desc, observable) => {
    when$ = observable
    when_desc = "When " + desc
  }

  const then = (desc, callback) => when$
    .waitFor(given$)
    .filter(([, flag]) => flag)
    .map(([value]) => value)
    .tap((value) => dispatch(when_desc, value))
    .pipe(callback)
    .createEffect()

  const onDestroy = callback(given, when, then)

  return onDestroy
}

export const epic = (desc, callback) => {
  console.log("[epic]", desc)
  return callback()
}