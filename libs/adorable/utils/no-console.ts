import {env} from "../../../config"
import {__state__} from "../dataLayer"

const noop = () => {}

const _no_console = {
  assert: noop,
  clear: noop,
  context: noop,
  count: noop,
  countReset: noop,
  debug: noop,
  dir: noop,
  dirxml: noop,
  error: noop,
  group: noop,
  groupCollapsed: noop,
  groupEnd: noop,
  info: noop,
  log: noop,
  memory: noop,
  profile: noop,
  profileEnd: noop,
  table: noop,
  time: noop,
  timeEnd: noop,
  timeLog: noop,
  timeStamp: noop,
  trace: noop,
  warn: noop,
}


const useConsole = (flag:boolean) => {
  if (flag) {
    return
  }

  // @ts-ignore
  const _console = window.console

  // @ts-ignore
  window.console = _no_console

  // @ts-ignore
  document.documentElement.debug = () => {
    // @ts-ignore
    window.console = _console
    // @ts-ignore
    window.state = __state__
  }
}

useConsole(env.phase !== "prod")