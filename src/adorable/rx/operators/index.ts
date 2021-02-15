import {Observable} from "../observable/observable"

declare module "../observable/observable" {
  namespace Observable {
    export function pipe(...pipes:Function[]):any
  }

  interface Observable<T> {
    pipe(...operators:Function[]):Observable<T>
  }
}

export const pipe = (...pipes:Function[]):any => (value:any) => pipes.reduce((f, g) => g(f), value)
Observable.pipe = pipe

// @ts-ignore
Observable.prototype.pipe = function(...operators) {return pipe(...operators)(this)}