import {Observable} from "../rx"
import {dispatch} from "./dispatch"

export const story = (desc:string, callback:Function):Function|Promise<Function|void>|void => {
  console.log("[story]", desc)

  try {
    let given$ = Observable.of(true)
    let when$:Observable<any> = Observable.NEVER
    let when_desc = ""

    const given = (desc:string, observable:Observable) => given$ = observable

    const when = (desc:string, observable:Observable) => {
      when$ = observable
      when_desc = "When " + desc
    }

    const then = (desc:string, callback:Function) => when$
      .waitFor(given$)
      .filter(([, flag]) => flag)
      .map(([value]) => value)
      .tap((value) => dispatch(when_desc, value))
      .pipe(callback)
      .createEffect()

    const onDestroy = callback(given, when, then)

    return onDestroy
  }
  catch (e) {
    return Promise.resolve().then(() => story(desc, callback))
  }
}