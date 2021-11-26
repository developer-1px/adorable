import {adorable} from "../../adorable"
import type {Config} from "../types"

let hmrVersion = 1
const storyRecord = Object.create(null)

export const story = (desc:string, callback:Function):Function|Promise<Function|void>|void => {
  console.info("[Story]", desc)
  storyRecord[desc] = callback
}

let id:number

export const run = (config:Config = {}) => {
  if (id || hmrVersion > 1) {
    console.warn("run: ", id)

    clearTimeout(id)
    id = setTimeout(_run)
  }
  else {
    _run(config)
  }
}

const _run = (config:Config = {}) => {
  console.clear()
  console.warn("hmrVersion", hmrVersion)
  hmrVersion++
  adorable.config = config
  Object.values(storyRecord).forEach(story => story())
}