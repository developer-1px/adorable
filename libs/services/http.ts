import {Observable} from "../observable"
import {no_console} from "../plugins/no-console-log"
import {dispatch} from "../dataLayer"

const console = no_console

let timerId = 0

export const urlencoded = (object) => Object.keys(object).map(key => `${key}=${encodeURIComponent(object[key])}`).join("&")

class HttpService {
  private readonly init: any

  constructor(init = {}, http = null) {
    this.init = http ? {...http.init, ...init} : {...init}
  }

  /// Request
  request(data) { return new HttpService(data, this) }

  host(host) { return this.request({host}) }

  url(url) { return this.request({url}) }

  headers(headers) { return this.request({headers}) }

  header(key, value) { return this.request({headers: {...this.init.headers, [key]: value}}) }

  mode(mode) { return this.request({mode}) }

  body(body) { return this.request({body}) }

  credentials(credentials) { return this.request({credentials}) }

  preScript(preScript) {return this.request({preScript}) }

  onBeforeSend(onBeforeSend) {return this.request({onBeforeSend}) }


  /// Request - methods
  method(method, ...url) { return this.request({method, url: url.join("/")}) }

  GET(...url) { return this.method("GET", ...url) }

  POST(...url) { return this.method("POST", ...url) }

  PUT(...url) { return this.method("PUT", ...url) }

  DELETE(...url) { return this.method("DELETE", ...url) }

  PATCH(...url) { return this.method("PATCH", ...url) }

  HEAD(...url) { return this.method("HEAD", ...url) }

  OPTIONS(...url) { return this.method("OPTIONS", ...url) }

  /// Response
  response(response) { return this.request({response}) }


  /// Request -> Response
  send(body = {}) {
    const _body = body

    let init = this.init
    let url = (this.init.host || "") + this.init.url

    /// @FIXME:
    if (init.method === "GET" || init.method === "DELETE" || init.method === "HEAD") {
      init = {...this.init}

      url += "?" + Object.entries(body)
        .filter(([key, value]) => value !== undefined && value !== null)
        // @ts-ignore
        .map(([key, value]) => encodeURIComponent(key) + "=" + encodeURIComponent(value)).join("&")

      delete init.body
    }
    else if (body) {
      body = init.body ? init.body(body) : body
      init = {...this.init, body}
    }

    // if (typeof init.preScript === "function") {
    // 	init = {...init, ...init.preScript(init)};
    // }

    const response = init.response || ((res) => res.text())
    const mock = init.mock
    const method = init.method

    return new Observable(observer => {

      if (init.onBeforeSend) {
        init.onBeforeSend(init)
      }

      /// @FIXME: MOCK UP / SUCCESS / FAILURE 분기 처리
      let ok = true
      const request = mock ? Observable.of(mock[method + " " + url]).delay(250) : fetch(url, init).then(res => {
        ok = res.ok
        return res
      }).then(response).then(res => {
        if (!ok) throw res
        return res
      })

      return Observable.castAsync(request)
        .initialize(() => dispatch(init.method + " " + init.url + ".REQUEST", _body))
        .tap(
          res => dispatch(init.method + " " + init.url + ".SUCCESS", res),
          err => dispatch(init.method + " " + init.url + ".FAILURE", err)
        )
        .subscribe(observer)
    })
  }

  useMock(mock) { return this.request({mock}) }
}


export const http$ = new HttpService()