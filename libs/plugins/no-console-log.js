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

export const no_console = window.console