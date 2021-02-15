import {__localStorage} from "../fp"

export const localCache = (reducer) => {
  return (initValue, path, callback) => reducer(initValue, path, ref$ => {
    ref$.set(__localStorage.getItem(path, initValue))
    callback(ref$)
    ref$.createEffect(__localStorage.setItem(path))
  })
}