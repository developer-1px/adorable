import {BehaviorSubject, Observable} from "../rx"

// Data Layer - (Action)
export type Action<T> = [string, T]

export interface SingleActionCreator<T> {
  (payload:T):Action<T>
}

export interface ActionCreator<T = any, S = any, F = any> extends SingleActionCreator<T> {
  REQUEST:SingleActionCreator<T>
  SUCCESS:SingleActionCreator<S>
  FAILURE:SingleActionCreator<F>

  START:SingleActionCreator<T>
  NEXT:SingleActionCreator<S>
  ERROR:SingleActionCreator<F>
  COMPLETE:SingleActionCreator<S>
  CANCELLED:SingleActionCreator<void>
}


// Data Layer - (Ref)
export interface Ref<T> extends BehaviorSubject<T> {
length:number
  path:string
  value:T
  set(value:T):T
  set(value:Observable<T>):T
  update(project:(value:T) => T):T
  update():T
}


// Data Layer - (Reducer)
export type ReducerCallback<T> = (ref:Ref<T>) => Function|void
export type Reducer<T> = (value:T|undefined, path:string, callback:ReducerCallback<T>) => Ref<T>


// Adorable
export interface Config {
  dev?:boolean
  verbose?:boolean
}

export interface Adorable {
  config:Config
}