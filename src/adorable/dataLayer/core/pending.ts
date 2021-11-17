import {on} from "./dispatch"
import {reducer} from "./ref"

export const pending = (action) => reducer<boolean>(false, action.toString(), ($) => {
  on(action.REQUEST).writeTo($, true)
  on(action.SUCCESS).writeTo($, false)
  on(action.FAILURE).writeTo($, false)

  on(action.START).writeTo($, true)
  on(action.ERROR).writeTo($, false)
  on(action.COMPLETE).writeTo($, false)
})