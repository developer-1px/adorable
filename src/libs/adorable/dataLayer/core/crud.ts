import {database} from "./database"

export interface Collection<T> {
  [id:string|number]:T
}

// @ts-ignore
const createPathProxy = (path:string) => {
  return new Proxy(Object.create(null), {
    get(obj, prop) {
      if (prop === "toString") return () => path
      return createPathProxy(path + "/" + prop.toString())
    },
  })
}

export const createAppState = <T>():T => createPathProxy("")

export const INSERT = <T>(path:T, value:T) => {}

export const GET = <T>(path:T) => database<T>(path.toString()).value

export const SELECT = <T>(path:T) => database<T>(path.toString())

export const UPDATE = <T>(path:T) => database<T>(path.toString())

export const DELETE = <T>(path:T) => database<T>(path.toString()).remove()