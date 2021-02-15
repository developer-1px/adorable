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
  COMPLETE:SingleActionCreator<void>
  CANCELLED:SingleActionCreator<void>
}

const createAction = <T = void>(type:string):SingleActionCreator<T> => {
  const actionCreator:SingleActionCreator<T> = (payload:T) => [type, payload]
  actionCreator.toString = ():string => type
  return actionCreator
}


export function action<T = void, S = T, F = any>(type:string):ActionCreator<T, S, F> {
  const actionCreator:ActionCreator<T, S, F> = createAction(type) as ActionCreator<T, S, F>

  actionCreator.REQUEST = createAction<T>(type + ".REQUEST")
  actionCreator.SUCCESS = createAction<S>(type + ".SUCCESS")
  actionCreator.FAILURE = createAction<F>(type + ".FAILURE")

  actionCreator.START = createAction<T>(type + ".START")
  actionCreator.NEXT = createAction<S>(type + ".NEXT")
  actionCreator.ERROR = createAction<F>(type + ".ERROR")
  actionCreator.COMPLETE = createAction<void>(type + ".COMPLETE")
  actionCreator.CANCELLED = createAction<void>(type + ".CANCELLED")

  return actionCreator
}