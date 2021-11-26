import {Observable} from "../observable/observable"

declare module "../observable/observable" {
  namespace Observable {
    export function hostReportErrors(error:any):void
  }
}

Observable.hostReportErrors = (error:any) => {
  if (error instanceof Error) {
    console.error(error)
  }
}