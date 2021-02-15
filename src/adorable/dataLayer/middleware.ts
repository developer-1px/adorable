// /// @TODO: Logger => 추후 미들웨어로 분리할 것! [2020. 5. 28]
// import {Observable, Subject} from "../observable"
// import {actions$, dispatch} from "./action"
// import {writes$} from "./writable"
//
//
// let __actions = []
//
// let DEV_TOOL
//
// const postMessage = (data) => {
//   try {
//     if (DEV_TOOL) return DEV_TOOL.postMessage(data, "*")
//     else __actions.push(data)
//   } catch (e) {}
// }
//
// window.START_DEV_TOOL = (_window) => {
//   DEV_TOOL = _window
//   for (const params of __actions) {
//     postMessage(params)
//   }
//   __actions = []
// }
//
//
// const state = window.state = Object.create(null)
// const safe_equal = (a, b) => a === b && Object(a) !== a
//
// Observable.enableLog = true
// if (Observable.enableLog) {
//
//   let depth = 0
//
//   // actions$
//   //   .tap((action, index) => {
//   //     /// @FIXME: 임시 로그 flag
//   //     const [type, payload] = action
//   //     if (type.charAt(0) === "#") return
//   //     depth++
//   //     console.log("")
//   //     console.log("")
//   //     console.group("#" + index + " " + type)
//   //     console.log("#" + index + " " + type, payload)
//   //     Promise.resolve().then(() => {
//   //       depth--
//   //       console.groupEnd()
//   //     })
//   //   })
//   //
//   //   .tap((action, index) => {
//   //     const params = ["action", ...action]
//   //     postMessage(params)
//   //   })
//   //   .createEffect()
//
//
//   writes$
//     .filter(([path, stream]) => path && path.charAt(0) !== "#")
//     .mergeMap(([path, stream]) => stream
//       .distinctUntilChanged(safe_equal)
//       // .tap(() => {
//       //   if (depth === 0) dispatch("<<side-effect>>")
//       // })
//       .trace(path)
//       .tap(value => {
//         const params = ["state", path, value]
//         postMessage(params)
//       })
//     )
//     .createEffect()
//
// }