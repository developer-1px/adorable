// import App from "./App.svelte"
//
// const app = new App({
//   target: document.body,
// })
//
// export default app
//
// // Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// // Learn more: https://www.snowpack.dev/concepts/hot-module-replacement
// if (import.meta.hot) {
//   import.meta.hot.accept();
//   import.meta.hot.dispose(() => {
//     app.$destroy();
//   });
// }


import type {Ref} from "../adorable"

type ID = string|number

interface Group {
  id:string
  selected:boolean
}

type Path<T> = {
  [K in keyof T]:Path<T[K]>;
}


function database<T>(name:string) {

  const ret = (id:ID) => {


    return {} as (Path<T>|Ref<T>)
  }


  return ret
}

const groups = database<Group>("groups")





