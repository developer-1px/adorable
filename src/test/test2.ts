import {epic, ref} from "../../adorable"

const r$ = ref(0)

const flag$ = r$.map(r => r === 1)

const {reducer} = epic(flag$)


import {reducer as greducer} from "../../adorable"


const g = greducer(0, "g", g => {

  return () => {
    console.log("dest g!!")
  }
})


const r2 = reducer(0, "r2", r2 => {

  g.map(v => v).writeTo(r2)

  r2.set(100)

  return () => {

    r2.set(0)
    console.log("destroy!!")

  }
})

r$.set(1)

r$.set(0)