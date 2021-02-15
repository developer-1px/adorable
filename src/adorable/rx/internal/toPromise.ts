import {Observable} from "../observable/observable"

export const toPromise = <T>() => (observable: Observable<T>) => new Promise<T>((resolve, reject) => {
  observable.subscribe(resolve, reject)
})

declare module "../observable/observable" {
  interface Observable<T> {
    toPromise():Promise<T>
  }
}

// @ts-ignore
Observable.prototype.toPromise = function() { return toPromise(...arguments)(this) }