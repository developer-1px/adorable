import {dispatch, Observable} from "../adorable"

interface RequestInitEx extends RequestInit {
  host?:string
  url?:string
  query?:any
  bodyParser?:(req:any, options:RequestInitEx) => any
  response?:(res:Response) => any
  onBeforeSend?:Function
  catchError?:Function
  preScript?:Function
  cacheKey?:string
}

const cache304 = Object.create(null)

export const uri = (stings:TemplateStringsArray, ...keys:any[]) => {
  let result = stings[0]
  for (let i = 0; i < keys.length; ++i) {
    result += encodeURIComponent(keys[i]) + stings[i + 1]
  }
  return result
}

export const form_urlencode = (object:Record<string, string>) => Object.entries(object).filter(([key, value]) => key && (value !== null && value !== undefined)).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&")

export interface HttpService {}

export type HttpServiceCallback<T> = (http:HttpService) => Promise<T>

export class HttpService {
  private readonly init:RequestInitEx

  constructor(init = {}, http?:HttpService) {
    this.init = http ? {...http.init, ...init} : {...init}
  }

  /// Request
  request(data:Partial<RequestInitEx>) {return new HttpService(data, this)}

  host(host:string) {return this.request({host})}

  url(url:string) {return this.request({url})}

  headers(headers:HeadersInit) {return this.request({headers})}

  header(key:string, value:string) {return this.request({headers: {...this.init.headers, [key]: value}})}

  mode(mode:RequestMode) {return this.request({mode})}

  bodyParser(bodyParser:(req:any, options:RequestInitEx) => any) {return this.request({bodyParser})}

  credentials(credentials:RequestCredentials) {return this.request({credentials})}

  preScript(preScript:Function) {return this.request({preScript})}

  onBeforeSend(onBeforeSend:Function) {return this.request({onBeforeSend})}

  cacheKey(cacheKey:string) {return this.request({cacheKey})}

  /// Request - methods
  method(method:string, ...url:string[]) {return this.request({method, url: url.join("/")})}

  GET(...url:string[]) {return this.method("GET", ...url)}

  POST(...url:string[]) {return this.method("POST", ...url)}

  PUT(...url:string[]) {return this.method("PUT", ...url)}

  DELETE(...url:string[]) {return this.method("DELETE", ...url)}

  PATCH(...url:string[]) {return this.method("PATCH", ...url)}

  HEAD(...url:string[]) {return this.method("HEAD", ...url)}

  OPTIONS(...url:string[]) {return this.method("OPTIONS", ...url)}

  /// Response
  response(response:(res:Response) => any) {return this.request({response})}

  catchError<T>(catchError:(res:T) => any) {return this.request({catchError})}

  query<T>(query:T) {return this.request({query})}

  // @ts-ignore
  body<T>(body:T) {return this.request({body})}

  /// Request -> Response
  send<T>() {
    let {init} = this
    let url = (init.host || "") + init.url

    const {query} = init

    if (query) {
      const params = form_urlencode(query)
      if (params.length) {
        url += "?" + params
      }
    }

    let {body} = init
    if (body) {
      body = init.bodyParser ? init.bodyParser(body, init) : body
      init = {...this.init, body}
    }

    if (typeof init.preScript === "function") {
      init = {...init, ...init.preScript(init)}
    }

    // @NOTE: body가 없으면 content-type을 삭제한다.
    if (!body && init.headers) {
      init.headers = Object.fromEntries(Object.entries(init.headers).filter(([key]) => key.toLowerCase() !== "content-type"))
    }

    const response = init.response || ((res:Response) => res.text())

    const method = (init.method ?? "get").toLowerCase()

    return new Observable<T>(observer => {
      if (init.onBeforeSend) {
        init.onBeforeSend(init)
      }

      /// @FIXME: MOCK UP / SUCCESS / FAILURE 분기 처리
      const request = fetch(url, init)
        .then(async (res) => {
          const {ok, status, url} = res
          const data = await response(res)

          // @FIMX: 304 로컬캐시 기능은 고민할 거리가 많아 보류함.

          // const key = init.cacheKey ?? url
          // if (method === "get" && status === 304) {
          //   console.warn("cache304", res, method, url, cache304, cache304[method + " " + key])
          //   return cache304[method + " " + key]
          // }

          if (status !== 304 && !ok) {
            throw init.catchError ? (init.catchError(data) ?? data) : data
          }

          // if (method === "get") {
          //   cache304[method + " " + key] = await data
          // }

          return data
        })

      return Observable.castAsync<T>(request)
        .initialize(() => dispatch(init.method + " " + url + ".REQUEST", body))
        .tap(
          res => dispatch(init.method + " " + url + ".SUCCESS", res),
          err => dispatch(init.method + " " + url + ".FAILURE", err)
        )
        .subscribe(observer)
    })
  }
}

export const http$ = new HttpService()