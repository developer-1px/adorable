# adorable store

> ✨ Observable based state Management Library

# meaning

> Action, Dispatch, On, Reducer + able

## State Management

### action

```typescript
const _INCREARE = action("_INCREARE")
const _DECREARE = action("_DECREARE")
```

### dispatch

```typescript
const on_inc_click = () => dispatch(_INCREARE())
const on_dec_click = () => dispatch(_DECREARE())
```

### on

```typescript
on(_INCREARE)
  .map(...)
  .filter(...)
  .writeTo()

on(_DECREARE)
  .map(...)
  .filter(...)
  .writeTo()

```

### reducer

```typescript
const counter$ = reducer(0, "counter$", counter$ => {

  on(_INCREARE)
    .writeTo(counter$, () => count => count + 1)

  on(_DECREARE)
    .writeTo(counter$, () => count => count - 1)
})
```

### ref

```typescript
const ref$ = reducer(0, "ref$")

ref$.set(0)
ref$.update(value => value + 1)
```

### effect

```typescript

on(_INCREARE)
  .tap(value => console.log("INCREASE!", value))
  .createEffect()

```

### story

---

## Rx

### Observable