import {dispatch} from "src/libs/adorable/dataLayer/core/dispatch"
import {adorable} from "../../adorable"
import type {Config} from "../types"
import {__state__} from "./middleware"

let hmrVersion = 1
const storyRecord = Object.create(null)

export const story = (desc:string, callback:Function):Function|Promise<Function|void>|void => {
  console.info("[Story]", desc)
  storyRecord[desc] = callback
}

let id:number

export const run = (epic:string, config:Config = {}) => {
  if (config.dev) {
    window.state = __state__
    window.dispatch = dispatch
  }

  if (id || hmrVersion > 1) {
    console.warn("run: ", id)

    clearTimeout(id)
    id = setTimeout(_run)
  }
  else {
    _run(epic, config)
  }
}

const _run = (epic:string, config:Config = {}) => {
  console.clear()
  console.warn("hmrVersion", hmrVersion)
  hmrVersion++
  adorable.config = config

  Object.entries(storyRecord)
    .forEach(([tag, story]) => {
      if (tag.includes(epic)) {
        __state__.stories = __state__.stories || {}
        __state__.stories[tag] = true
        story()
      }
    })
}