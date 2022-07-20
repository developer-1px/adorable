import {Observable} from "../observable/observable"

export const then = <T>(resolve:(value:T) => void, reject:(reason?:any) => void) => (observable:Observable<T>):Promise<T|void> => {
  return observable.toPromise().then(value => {
    resolve(value)
    return value
  }, reject)
}

declare module "../observable/observable" {
  interface Observable<T> {
    then(resolve:(value:T) => void, reject?:(reason?:any) => void):Promise<T>
  }
}

// @ts-ignore
// eslint-disable-next-line prefer-rest-params
Observable.prototype.then = function() {return then(...arguments)(this)}