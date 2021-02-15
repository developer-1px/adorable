import {Observable} from "../adorable"

const observable$ = new Observable<number>(observer => {
  observer.next(1)
  observer.next(1)
  observer.next(3)
  observer.next(3)
  observer.next(5)
  observer.next(6)
  observer.complete()
})


observable$
  .distinctUntilChanged()
  .tap(console.log)
  .subscribe()


Observable.fromEvent(window, "wheel", true)
  .throttleTime(500)
  .tap(console.log)
  .subscribe()



const observable$2 = Observable.timer(0, 500).skip(2).take(10).map(a => "happy" + a)



Observable.timer(0, 500)
  .takeWhile(x => x < 4)
  .trace("timer2")
  .subscribe()


Observable.combineLatest(observable$, observable$2)
  .map(([a, b]) => {
    return a + b
  })
  .initialize(value => console.log("first thing", value))
  .map(x => "123" + x)
  .trace("reducer$")
  .scan((prev, curr) => {
    // console.log("index", index)
    return prev + " " + curr
  }, "xxxxx")
  .map(x => x + "x")
  .tap(console.log, console.error, console.warn)
  .count()
  .tap(count => console.log("count", count))
  .takeLast(3)
  .tap(x => [
    console.log("trace!!!??", x)
  ])
  .finalize(() => console.log("fin!"))
  .subscribe()