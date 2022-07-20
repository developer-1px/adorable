<script lang="ts">
// import "./test/test2"

import {delay, delayWhen, map, retryWhen, take, tap, timer} from "rxjs"
import {Observable} from "./libs/adorable"


// timer(0, 100)
//   .pipe(
//     map((value, index) => {
//       console.warn("sdlfkasjflkasd", value)
//       if (index > 5) throw new Error("2222")
//       return value
//     }),
//     retryWhen(error => timer(1000))
//   ).subscribe()


Observable.timer(0, 100)
  .map((value, index) => {
    console.warn("sdlfkasjflkasd", value)
    if (index > 5) throw new Error("2222")
    return value
  })
  .retryWhen(error => {
    console.warn("~~~~~~~~~~~~~~~~~~~~~~~~~~", error)
    return error.delay(1000).take(3).trace("error")
  })
  .createEffect()


</script>

<h1>test</h1>