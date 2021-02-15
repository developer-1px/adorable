function noop() {}

function foreach(arr, callback) {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i], i, arr)
  }
}

function $matches(elm, selector) {
  let matches = (elm.document || elm.ownerDocument).querySelectorAll(selector),
    i = matches.length
  while (--i >= 0 && matches.item(i) !== elm) {}
  return i > -1
}

function matchesSelector(el, selector) {
  if (!el || el.nodeType !== 1) return false
  let matches = el.matches || el.matchesSelector || el.webkitMatchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.oMatchesSelector
  if (!matches) {
    return $matches(el, selector)
  }
  return matches.call(el, selector)
}

function $$closest(element, selector) {

  while (element) {
    if (matchesSelector(element, selector)) {
      return element
    }
    element = element.parentNode
  }

  return null
}

function $isDisabled(element) {
  return $$closest(element, "[disabled]")
}

let LONG_PRESS_DELAY = 750
let SCROLL_CHECK_DELAY = 100

let TOUCH_START = "touchstart"
let TOUCH_MOVE = "touchmove"
let TOUCH_END = "touchend"
let TOUCH_CANCEL = "touchcancel"

if (!("ontouchstart" in document)) {
  TOUCH_START = "mousedown"
  TOUCH_MOVE = "mousemove"
  TOUCH_END = "mouseup"
  //			TOUCH_CANCEL = "contextmenu";
}


///
let activeTouchElements = []

function hasAttribute(el, attr) {
  return el && el.hasAttribute && el.hasAttribute(attr)
}

function arrayPushOnce(array, obj) {
  if (array.indexOf(obj) === -1) {
    array.push(obj)
  }
}

function isTouchFreeze(el) {
  let freeze = $$closest(el, "[wux-touch-freeze]")
  return freeze && freeze !== el
}

function getElementPointersFromTouches(element, touches) {
  let pointers = []
  foreach(touches, function (touch) {
    if (element.$$touch.$touchIds.indexOf(touch.identifier) >= 0) {
      let pointer = Pointer.map[touch.identifier]
      if (!pointer) {
        return
      }

      pointers.push(pointer)
    }
  })

  return pointers
}

function removeActiveTouchElement(element) {
  let index = activeTouchElements.indexOf(element)
  if (index !== -1) {
    element.$isFinished = true
    element.$$touch.$touchIds = []
    scrollCheckRelease(element)
    activeTouchElements.splice(index, 1)
  }
}

function scrollCheck(element, fn) {
  scrollCheckRelease(element)

  let handler = function (e) {
    if (hasAttribute(e.target, "wux-touch-scroll-allow")) {
      return
    }

    // 스크롤된 element에 포함되어 있는지?
    if (!e.target.contains(element)) {
      return
    }

    window.removeEventListener("scroll", handler, true)
    fn(e)
  }
  window.addEventListener("scroll", handler, true)
  element.$$touch.$scrollCheckHandler = handler
}

function scrollCheckRelease(element) {
  window.removeEventListener("scroll", element.$$touch.$scrollCheckHandler, true)
  element.$$touch.$scrollCheckHandler = null
  element.$$touch.$isScrolled = false
}


function Pointer(pointer, event) {
  this.type = event.type
  this.target = event.target
  this.timeStamp = event.timeStamp

  this.pageX = pointer.pageX
  this.pageY = pointer.pageY
  this.clientX = pointer.clientX
  this.clientY = pointer.clientY
  this.screenX = pointer.screenX
  this.screenY = pointer.screenY

  this.start = {
    pageX: this.pageX,
    pageY: this.pageY,
    clientX: this.clientX,
    clientY: this.clientY,
    screenX: this.screenX,
    screenY: this.screenY
  }

  this.deltaX = 0
  this.deltaY = 0
  this.distanceX = 0
  this.distanceY = 0
  this.displacementX = 0
  this.displacementY = 0
  this.displacementXTimeStamp = event.timeStamp
  this.displacementYTimeStamp = event.timeStamp
  this.velocityX = 0
  this.velocityY = 0

  this.scale = 1
  this.d = 0

  this.isPanStart = false
  this.isPanning = false
  this.isPanEnd = false
}

Pointer.map = {}

Pointer.prototype = {
  update: function (pointer, event) {
    let prevTimeStamp = this.timeStamp
    this.timeStamp = event.timeStamp

    this.deltaX = pointer.screenX - this.screenX
    this.deltaY = pointer.screenY - this.screenY
    this.distanceX = pointer.screenX - this.start.screenX
    this.distanceY = pointer.screenY - this.start.screenY

    if (this.velocityY * this.deltaY < 0) {
      this.lastDisplacementY = this.displacementY
      this.displacementY = 0
      this.displacementYTimeStamp = prevTimeStamp
      this.velocityY = 0
    }

    if (this.velocityX * this.deltaX < 0) {
      this.lastDisplacementX = this.displacementX
      this.displacementX = 0
      this.displacementXTimeStamp = prevTimeStamp
      this.velocityX = 0
    }

    this.displacementX += this.deltaX
    this.displacementY += this.deltaY

    this.velocityX = this.displacementX / (this.timeStamp - this.displacementXTimeStamp)
    this.velocityY = this.displacementY / (this.timeStamp - this.displacementYTimeStamp)
    this.velocityX = this.velocityX === this.velocityX ? this.velocityX : 0 // NaN 처리
    this.velocityY = this.velocityY === this.velocityY ? this.velocityY : 0 // NaN 처리

    this.isPanStart = this.type === TOUCH_START && event.type === TOUCH_MOVE
    this.isPanning = this.type === TOUCH_MOVE && event.type === TOUCH_MOVE
    this.isPanEnd = this.type === TOUCH_MOVE && event.type === TOUCH_END

    this.type = event.type
    this.pageX = pointer.pageX
    this.pageY = pointer.pageY
    this.clientX = pointer.clientX
    this.clientY = pointer.clientY
    this.screenX = pointer.screenX
    this.screenY = pointer.screenY
  },

  contains: function (element) {
    let  rect = element.getBoundingClientRect()
    let x = this.clientX
    let y = this.clientY

    return (rect.top <= y && y <= rect.bottom && rect.left <= x && x <= rect.right)
  }
}

function PointerEvent(element, event) {

  // 변경된 터치 계산 값 추출
  let pointers = getElementPointersFromTouches(element, event.changedTouches)

  if (pointers.length >= 2) {
    let p1 = pointers[0]
    let p2 = pointers[1]

    let d = Math.sqrt(Math.pow(p1.screenX - p2.screenX, 2) + Math.pow(p1.screenY - p2.screenY, 2))
    let scale = d / p1.d
    scale = scale === scale ? scale : 1
    p1.scale = p2.scale = scale
    p1.d = p2.d = d
  }

  if (pointers[0]) {
    Object.assign(this, pointers[0])
  }

  this.type = event.type
  this.target = event.target
  this.currentTarget = element
  this.originalEvent = event
  this.pointers = getElementPointersFromTouches(element, event.touches)
}

function dispatchPointerEvent(element, pointerEvent) {
  if ($isDisabled(element)) {
    return
  }

  if (isTouchFreeze(element)) {
    return
  }

  if (element.$$touch.$isFinished) {
    return
  }

  let handlers = element.$$touch.$handlers

  let types = ["press", "down", "panstart", "pan", "pan-x", "pan-y", "panend", "tap", "up", "release", "longpress"]

  for (let i = 0; i < types.length; i++) {

    let type = types[i]

    if (!handlers.hasOwnProperty(type)) {
      continue
    }

    if (typeof dispatchPointerEvent.delegate[type] !== "function") {
      continue
    }

    if (type === "panstart" && (handlers["pan"] || handlers["pan-x"] || handlers["pan-y"])) {
      continue
    }

    let handler = handlers[type]

    if (dispatchPointerEvent.delegate[type].call(handlers, element, pointerEvent, handler) === false) {
      element.$$touch.$isFinished = true
    }

    if (element.$$touch.$isFinished) {
      removeActiveTouchElement(element)
      break
    }
  }

  /// 남아있는 터치가 없으면 터치 프로세스 종료
  if (pointerEvent.pointers.length === 0) {
    element.$$touch.$isFinished = true
    removeActiveTouchElement(element)
  }
}

dispatchPointerEvent.delegate = {

  "press": function (el, event, handler) {
    if (event.type === TOUCH_START && event.pointers.length === 1) {
      return handler(event)
    }
  },

  "down": function (el, event, handler) {
    if (event.type === TOUCH_START) {
      return handler(event)
    }
  },

  "panstart": function (el, event, handler) {
    if (event.type === TOUCH_MOVE && event.isPanStart) {
      return handler(event)
    }
  },

  "pan": function (el, event, handler) {
    if (event.type === TOUCH_MOVE && event.isPanStart) {
      // event.originalEvent.preventDefault();

      let handlers = el.$$touch.$handlers
      if (typeof handlers["panstart"] === "function") {
        if (dispatchPointerEvent.delegate["panstart"].call(handlers, el, event, handlers["panstart"]) === false) {
          return false
        }
      }

      return handler(event)
    }

    if (event.type === TOUCH_MOVE && event.isPanning) {
      // event.originalEvent.preventDefault();
      return handler(event)
    }
  },

  "pan-x": function (el, event, handler) {
    if (event.type === TOUCH_START) {
      scrollCheck(el, function () {
        el.$$touch.$isScrolled = true
      })
      return
    }

    if (event.type === TOUCH_MOVE && event.isPanStart) {
      setTimeout(function () {
        if (el.$$touch.$isScrolled) {
          return
        }

        let handlers = el.$$touch.$handlers
        if (typeof handlers["panstart"] === "function") {
          if (dispatchPointerEvent.delegate["panstart"].call(handlers, el, event, handlers["panstart"]) === false) {
            el.$$touch.$isFinished = true
            return false
          }
        }
      }, SCROLL_CHECK_DELAY)
    }

    if (event.type === TOUCH_MOVE && event.isPanning) {
      if (el.$$touch.$isScrolled) {
        return
      }

      event.originalEvent.preventDefault()
      return handler(event)
    }
  },

  "pan-y": function (el, event, handler) {

    if (event.type === TOUCH_MOVE && event.isPanStart) {
      event.originalEvent.preventDefault()

      let handlers = el.$$touch.$handlers
      if (typeof handlers["panstart"] === "function") {
        if (dispatchPointerEvent.delegate["panstart"].call(handlers, el, event, handlers["panstart"]) === false) {
          return false
        }
      }

      return handler(event)
    }

    if (event.type === TOUCH_MOVE && event.isPanning) {
      event.originalEvent.preventDefault()
      return handler(event)
    }
  },

  "panend": function (el, event, handler) {
    if (event.type === TOUCH_END && event.isPanEnd) {
      if (el.$$touch.$isScrolled) {
        return
      }

      return handler(event)
    }
  },

  "tap": function (el, event, handler) {
    if (event.type === TOUCH_START) {
      scrollCheck(el, function () {
        el.$$touch.$isScrolled = true
      })
      return
    }

    if (event.type === TOUCH_END && !event.isPanEnd && event.pointers.length === 0) {
      if (el.$$touch.$isScrolled) {
        return
      }

      return handler(event)
    }
  },

  "up": function (el, event, handler) {
    if (event.type === TOUCH_END) {
      return handler(event)
    }
  },

  "release": function (el, event, handler) {
    if (event.type === TOUCH_END && event.pointers.length === 0) {
      return handler(event)
    }
  },

  "cancel": function (el, event, handler) {
    if (event.type === TOUCH_CANCEL) {
      el.$$touch.$isFinished = true
      return handler(event)
    }
  },

  "longpress": function (el, event, handler) {

    //			if (event.type === TOUCH_START && event.pointers.length === 1) {
    //				scrollCheck(el, function() {
    //					el.$$touch.$isScrolled = true;
    //				});
    //
    //				if (el.$$touch.$longPressTimer) {
    //					$timeout.cancel(el.$$touch.$longPressTimer);
    //					el.$$touch.$longPressTimer = null;
    //				}
    //
    //				el.$$touch.$longPressTimer = $timeout(function() {
    //					if (el.$$touch.$isScrolled) {
    //						return;
    //					}
    //
    //					el.$$touch.$isFinished = true;
    //					let ret = handler(event);
    //					$timeout(noop);
    //					return ret;
    //
    //				}, LONG_PRESS_DELAY);
    //
    //				return;
    //			}
    //
    //			if (event.type === TOUCH_MOVE || event.type === TOUCH_END) {
    //				if (el.$$touch.$longPressTimer) {
    //					$timeout.cancel(el.$$touch.$longPressTimer);
    //					el.$$touch.$longPressTimer = null;
    //				}
    //			}
  }
}


function touchEventDelegate(event) {
  // convert changedTouches to Pointer & update
  foreach(event.changedTouches, function (touch) {
    let pointer = Pointer.map[touch.identifier] = Pointer.map[touch.identifier] || new Pointer(touch, event)
    pointer.update(touch, event)
  })


  /// Dispatch PointerEvent to ActiveTouchElements
  foreach(activeTouchElements.slice(), function (element) {
    if (!element.$$touch || !element.$$touch.$touchIds || !element.$$touch.$handlers) {
      removeActiveTouchElement(element)
      return
    }

    dispatchPointerEvent(element, new PointerEvent(element, event))
  })


  /// 남아있는 터치로 포인터 맵 최신화
  let _map = Pointer.map
  Pointer.map = {}
  foreach(event.touches, function (touch) {
    Pointer.map[touch.identifier] = _map[touch.identifier]
  })


  foreach(activeTouchElements.slice(), function (element) {
    let pointerEvent = new PointerEvent(element, event)

    // 터치가 없을 경우,
    if (pointerEvent.pointers.length === 0) {

      // 그 전에 완료처리가 되지 않았다면,
      if (!element.$$touch.$isFinished) {

        // cancel이벤트를 호출해준다.
        if (typeof element.$$touch.$handlers["cancel"] === "function") {
          element.$$touch.$handlers["cancel"](pointerEvent)
        }
      }

      // 터치엘리먼트 목록에서 제외한다
      removeActiveTouchElement(element)
    }
  })
}


/// bind Touch Event
if (TOUCH_START === "touchstart") {
  window.addEventListener("touchstart", function (event) {
    setTimeout(function () {
      touchEventDelegate(event)
    }, 0)
  }, true)

  window.addEventListener("touchmove", touchEventDelegate, true)
  window.addEventListener("touchend", touchEventDelegate, true)
  window.addEventListener("touchcancel", touchEventDelegate, true)
  window.addEventListener("contextmenu", function () {
    $touch.cancel()
  }, true)
}

// mouseEvent Emulator
else {
  window.addEventListener("mousedown", function (e) {
    setTimeout(function () {
      e.identifier = 0
      e.changedTouches = [e]
      e.touches = [e]
      touchEventDelegate(e)
    }, 0)
  }, true)

  window.addEventListener("mousemove", function (e) {
    if (e.buttons === 0) {
      return
    }

    e.identifier = 0
    e.changedTouches = [e]
    e.touches = [e]
    touchEventDelegate(e)
  }, true)

  window.addEventListener("mouseup", function (e) {
    e.identifier = 0
    e.changedTouches = [e]
    e.touches = []
    touchEventDelegate(e)
  }, true)

  window.addEventListener("contextmenu", function () {
    $touch.cancel()
  }, true)

  window.addEventListener("blur", function (e) {
    if (e.target !== window) {
      return
    }

    $touch.cancel()
  }, false)

  // 마우스 버전은 스크롤 체크 기능 해제
  scrollCheck = noop
  scrollCheckRelease = noop
}


/// export $touch
let $touch = {

  bind: function (element, handlers) {

    // pre-process arguments
    handlers = typeof handlers === "function" ? handlers(element) : handlers


    // 터치 이벤트 핸들러 등록
    element.$$touch = element.$$touch || {}
    element.$$touch.$touchIds = element.$$touch.$touchIds || []
    element.$$touch.$handlers = element.$$touch.$handlers || {}
    element.$$touch.$isScrolled = element.$$touch.$isScrolled || false
    element.$$touch.$scrollCheckHandler = element.$$touch.$scrollCheckHandler || null
    Object.assign(element.$$touch.$handlers, handlers)


    // 터치 시작 시, active Touch Element로 등록한다
    element.addEventListener(TOUCH_START, function (event) {

      //				if ($isDisabled(element)) {
      //					return;
      //				}

      if (isTouchFreeze(element)) {
        return
      }

      // @NOTE: 대개 터치 이벤트는 bubbling을 하지 않는다. 편의를 위해 stopPropagation()을 기본으로 지정함.
      event.stopPropagation()

      element.$$touch.$isFinished = false

      foreach(event.changedTouches || [{identifier: 0}], function (touch) {
        arrayPushOnce(element.$$touch.$touchIds, touch.identifier)
      })

      arrayPushOnce(activeTouchElements, element)
    })
  },

  unbind: function (element) {
    element.$$touch = {}
    element.$$touch.$touchIds = element.$$touch.$touchIds || []
    element.$$touch.$handlers = element.$$touch.$handlers || {}
    element.$$touch.$isScrolled = element.$$touch.$isScrolled || false
    element.$$touch.$scrollCheckHandler = element.$$touch.$scrollCheckHandler || null
  },

  cancel: function () {
    foreach(activeTouchElements, function (element) {
      element.$$touch.$touchIds = []
      element.$$touch.$isFinished = true
      scrollCheckRelease(element)

      let pointerEvent = new PointerEvent(element, {
        type: TOUCH_CANCEL,
        changedTouches: [],
        touches: []
      })

      if (typeof element.$$touch.$handlers["cancel"] === "function") {
        element.$$touch.$handlers["cancel"](pointerEvent)
      }
    })

    activeTouchElements = []
  },

  freeze: function (element, type) {
    element = $(element)
    element.attr("wux-touch-freeze", type || true)
  },

  seal: function (element) {
    element = $(element)
    element.removeAttr("wux-touch-freeze")
  }
}