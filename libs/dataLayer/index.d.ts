import {OnNextCallback, Observer, Subscription, Observable} from "../observable"

interface Writable extends Observable {
  set(value: any): any
  update(callback?: Function): any
  value: any
}

interface Action extends Function {
  (...payload: any[]): [string, ...any[]]
  type: string

  REQUEST: Action
  SUCCESS: Action
  FAILURE: Action

  START: Action
  NEXT: Action
  ERROR: Action
  COMPLETE: Action
}

declare function action(type: string, constructor?: Function): Action
declare function ref(initValue?: any, path?: string): Writable
declare function reducer(initValue?: any, path?: string, callback?: Function): Observable

declare function dispatch(action: []): Observable
declare function dispatch(type: string | any, payload?: any): Observable
declare function dispatch(type: string | any, payload?: any, value?: any): Observable
declare function on(...actions: any[]): Observable

declare function story(desc: string, callback: Function): void
declare function epic(desc: string, callback: Function): void