import {Observable} from "../../rx"
import {__state__} from "./middleware"

__state__.query = Object.create(null)

const memo = Object.create(null)

export const query = <T>(name:string, callback:Function) => (...args:any[]) => {

  const key = name + "/" + JSON.stringify(args)

  if (!memo[key]) {
    // eslint-disable-next-line node/no-callback-literal
    const ret = callback(...args)

    memo[key] = Observable.castAsync(ret)
      .trace(key)
      .tap(value => {
        __state__.query[key] = value
      })
      .shareReplay(1)
  }

  return memo[key] as Observable<T>
}