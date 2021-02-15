import {tick} from "svelte"
import {lift} from "../observable"

export const delayTick = lift(observer => ({
  next: (value) => tick().then(() => observer.next(value))
}))