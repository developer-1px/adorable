import {BehaviorSubject} from "../rx"
import {Ref, ref} from "./ref"

const memo = Object.create(null)

export function dict<T>(value:T|undefined, path:string, callback:(id$:BehaviorSubject<string>) => (ref$:Ref<T>) => void):(id:string|number) => Ref<T> {

  return (_id) => {
    const id = String(_id)
    const key = path + "#" + id

    const id$ = new BehaviorSubject<string>(id)
    if (!memo[key]) {
      const ref$ = memo[key] = ref(value, key)
      console.log("dictdictdictdictdictdictdictdictdictdictdictdictdictdict", key)
      callback(id$)(ref$)
      ref$.subscribe()
    }

    id$.next(id)
    return memo[key]
  }
}