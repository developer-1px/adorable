import {database, type ReadonlyDateBaseRef} from "./database"

export interface Collection<T> {
  readonly [id:string|number]:T
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

export const createStore = <T>(path:string):T => createPathProxy("")

export const INSERT = <T>(path:T, value:T) => {}

export const GET = <T>(path:T) => database<T>(path.toString()).value

export const SELECT = <T>(path:T, defaultValue?:T):ReadonlyDateBaseRef<T> => database<T>(path.toString(), defaultValue)

export const UPDATE = <T>(path:T, defaultValue?:T) => database<T>(path.toString(), defaultValue)

export const DELETE = <T>(path:T) => database<T>(path.toString()).remove()