// import {__localStorage} from "../../fp"
// import type {Reducer, ReducerCallback} from "./ref"
// import {ref} from "./ref"
//
// export const localCache = <T>(reducer:Reducer<T>) => {
//   // @ts-ignore
//   return (value:T|undefined, path:string, callback:ReducerCallback<T>) => reducer(__localStorage.getItem(path, value), path, ref$ => {
//     callback(ref$)
//     ref$.createEffect(__localStorage.setItem(path))
//   })
// }
//
// export const __distinctUntilChanged = <T>(reducer:Reducer<T>) => {
//   // @ts-ignore
//   return (value:T|undefined, path:string, callback:ReducerCallback<T>) => reducer(value, path, ref$ => {
//     const _ref$ = ref<T>(value)
//     _ref$
//       .distinctUntilChanged()
//       .writeTo(ref$)
//
//     callback(_ref$)
//   })
// }

