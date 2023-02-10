import {BehaviorSubject, Subject} from "../../rx"

export const middleware$ = new Subject()

export const __state__ = Object.create(null)
__state__.database = Object.create(null)
__state__.store = Object.create(null)

export const state$ = new BehaviorSubject(__state__)
state$.update = () => state$.next(__state__)

middleware$
  .tap(() => {
    state$.update()
  })
  .createEffect()