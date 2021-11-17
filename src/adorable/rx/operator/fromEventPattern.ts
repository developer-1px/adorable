import {Observable} from "../observable/observable"

type EventHandler = (handler:(...args:any[]) => void) => void

export function fromEventPattern<T>(addHandler:EventHandler, removeHandler:EventHandler) {
  return new Observable<T>(observer => {
    const handler = observer.next.bind(observer)
    addHandler(handler)
    return () => removeHandler(handler)
  })// .share()
}

declare module "../observable/observable" {
  namespace Observable {
    export function fromEventPattern<T>(addHandler:EventHandler, removeHandler:EventHandler):Observable<T>
  }
}

Observable.fromEventPattern = fromEventPattern