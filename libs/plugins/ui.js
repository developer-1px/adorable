import {dispatch} from "../dataLayer"

export const showToast = (message) => dispatch("UIToast/SHOW", {message})
export const showToastCenter = (message) => dispatch("UIToast/center/SHOW", {message})