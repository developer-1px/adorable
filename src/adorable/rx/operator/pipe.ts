import {Observable} from "../observable/observable"

declare module "../observable/observable" {
  namespace Observable {
    export function pipe(...pipes:Function[]):any
  }
}

export const pipe = (...pipes:Function[]):any => (value:any) => pipes.reduce((f, g) => g(f), value)

Observable.pipe = pipe