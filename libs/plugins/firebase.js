import {Observable} from "../observable"
import {ref, reducer, on, action, dispatch} from "../dataLayer"
import {_FIREBASE_SIGN_IN_WITH_CUSTOM_TOKEN} from "../../store/actions"
import {no_console} from "./no-console-log"

const console = no_console

export const _FIREBASE_WRITE = action("#_FIREBASE_WRITE")

export const firebaseConnected$ = reducer(undefined, "[firebase/접속여부] firebaseConnected$", firebaseConnected$ => {

  const _firebaseConnected$ = ref()

  let connectedRef = firebase.database().ref(".info/connected")
  connectedRef.on("value", function (snap) {
    _firebaseConnected$.next(snap.val())
  })

  _firebaseConnected$
    .distinctUntilChanged()
    .writeTo(firebaseConnected$)
})


const _createFirebaseReadable = (path) => reducer(undefined, path, value$ => {
  const ref = firebase.database().ref(path)

  // alert("start: " + path)

  ref.on("value", snapshot => {
    const value = snapshot.toJSON()

    /// @FIXME: 임시 log flag
    // if (Observable.enableLog) {
    //   console.log("")
    //   console.group("[firebase] " + path)
    // }

    value$.next(value)

    // if (Observable.enableLog) {
    //   console.log("")
    //   console.groupEnd()
    // }
  })

  return () => {
    console.warn("[firebase::finalized] ", path)
    ref.off()
  }
})


// @NOTE: firebase token이 있어야만 조회 시작하도록 수정함.
const firebase_token$ = ref()

on(_FIREBASE_SIGN_IN_WITH_CUSTOM_TOKEN.SUCCESS)
  .writeTo(firebase_token$)

export const createFirebaseReadable = (path) => firebase_token$.switchMap(() => _createFirebaseReadable(path))


export const firebaseServerTimeOffset$ = reducer(undefined, "[firebase] firebaseServerTimeOffset$", value$ => {
  const offsetRef = firebase.database().ref(".info/serverTimeOffset")
  offsetRef.on("value", (snap) => value$.next(snap.val()))
  return () => offsetRef.off()
})

firebaseServerTimeOffset$.createEffect()



///
export const __firebase__set = (path, payload) => {
  const ref = firebase.database().ref(path)
  return dispatch(_FIREBASE_WRITE.REQUEST, ref.set(payload))
}

export const __firebase__set__with__onDisconnect_remove = (path, payload) => {
  const ref = firebase.database().ref(path)
  ref.onDisconnect().remove()
  return dispatch(_FIREBASE_WRITE.REQUEST, ref.set(payload))
}

export const __firebase__update__with__onDisconnect_remove = (path, payload) => {
  const ref = firebase.database().ref(path)
  ref.onDisconnect().remove()
  return dispatch(_FIREBASE_WRITE.REQUEST, ref.update(payload))
}

export const __firebase__remove = (path) => {
  const ref = firebase.database().ref(path)
  return dispatch(_FIREBASE_WRITE.REQUEST, ref.remove())
}

export const __firebase__onDisconnect_remove = (path) => {
  const ref = firebase.database().ref(path)
  return dispatch(_FIREBASE_WRITE.REQUEST, ref.onDisconnect().remove())
}

export const __firebase__onDisconnect__cancel = (path) => {
  const ref = firebase.database().ref(path)
  return dispatch(_FIREBASE_WRITE.REQUEST, ref.onDisconnect().cancel())
}