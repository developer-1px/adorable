import {Observable} from "../observable/observable"

export const toPromise = <T>() => (observable:Observable<T>) => new Promise<T>((resolve, reject) => {
  observable.take(1).subscribe(resolve, reject)
})

declare module "../observable/observable" {
  interface Observable<T> {
    toPromise():Promise<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.toPromise = function() {return toPromise(...arguments)(this)}