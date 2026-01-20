# ezh API Documentation

**English | [中文](./API-0.4.x.cn.md)**

ezh pursues the philosophy of simplicity is beauty. Its core user interface is refined to only about 10 APIs, yet powerful enough to build fully-featured reactive web applications.

Thanks to this design, you won't encounter a steep learning curve or even a shallow one—this is a frontend framework with no learning curve at all.

This document explains each API through practical examples, covering all the details of ezh usage in a concise way, helping you become an ezh expert within an hour.

---

## Overview - Basic Usage

### Import $ezh and Core Types

The first step to using the ezh framework is to import the necessary symbols from the `'ezh'` package:

```tsx
import { $ezh, Com, Container } from 'ezh'
```

### Com and Container

ezh provides two component types: Com and Container, which together correspond to the Component concept in React. The difference is that Container has an implicitly declared children property while Com does not.

#### `Com` - Components without Children

```tsx
const PlayerCard: Com<{ name: string; level: number }> = ({ name, level }) => {
    return <div>
        <p>Player: {name}</p>
        <p>Level: {level}</p>
    </div>
}

// Usage is recommended as a self-closing tag:
<PlayerCard name="Alice" level={10} />
// The following syntax is also valid, but ensure there is no content in between
<PlayerCard name="Alice" level={10}></PlayerCard>
// The following will cause a compiler error
<PlayerCard name="Alice" level={10}>Hello</PlayerCard>
```

#### `Container` - Components with Children

```tsx
const PlayerList: Container<{ title: string }> = ({ title, children }) => {
    return <div>
        <h2>{title}</h2>
        <ul>
            {children}
        </ul>
    </div>
}

// Usage can include child elements:
<PlayerList title="Game Players">
    <div>Alice</div>
    <div>Bob</div>
    <div>Charlie</div>
</PlayerList>
```

### Rendering to DOM

Use the `$ezh.render()` function to mount the root component to the DOM:

```tsx
const Root: Com = () => {
    return <div>
        <h1>My App</h1>
        <PlayerCard name="Alice" level={10} />
    </div>
}

// Get the DOM root element
const rootElement = document.getElementById('root')

// Render the Root component to the root element
if (rootElement) {
    $ezh.render(rootElement, Root)
}
```

The signature of `$ezh.render()` is:

```ts
$ezh.render(rootElement: Element, entry: (() => EzElement) | Com): void
```

- `rootElement`: The target DOM element.
- `entry`: The root component, which can be a `Com` type function without properties, or a function that returns `EzElement`.

### Key Points
- In ezh, a function of type `() => EzElement` is a valid renderable element. The content it returns will be rendered at its location.
```tsx
// This is a valid component definition
const Root: Com = () => {
    return <div>
        <h1>{() => 'My App'}</h1>
        {() => <PlayerCard name="Alice" level={10} />}
    </div>
}
```

---

## `useState<T>(initial: T, hook?: (ver: number, state: T, initial: T) => void): T`

### Description
Creates and manages component state. Returns a reactive state object that triggers re-renders.

### Parameters
- `initial`: Initial state object, only allows Array | Object
- `hook`: Optional callback function called when the state version changes. Used to perform side effects related to state changes. Parameters:
    - `ver`: Equals 1 when the component is first mounted to the DOM tree. Each subsequent re-render increments this value by 1. When the component is removed from the DOM tree, this value becomes 0.
    - `state`: The state object returned by useState. On the first execution of the hook, use this state parameter since the external variable holding the return value may not yet be assigned.
    - `initial`: The first parameter passed to useState. This only equals state when ver is 0.

### Return Value
A reactive proxy clone of the initial object. When any property is modified, it automatically triggers a re-render of any component that has read that property.

### Example
```tsx
const PlayerView: Com = () => {
    const state = useState({
        name: 'Player',
        age: 10,
    })

    // Modifying state triggers re-render
    return <p>
        Name: {state.name}
        <span onclick={() => state.age++} >
            Age(click to get older):
        </span>
        {state.age}
    </p>
}

const GameView: Com = () => {
    // With hook callback
    const gameState = useState(
        { selectedCard: '', gems: [3, 3, 3] },
        (ver, state, initial) => {
            if (ver === 1) {
                // GameView is being loaded for the first time
                // But the component may have been unmounted before and is being reloaded,
                // so reset the state to the initial state
                state.selectedCard = initial.selectedCard
                state.gems = initial.gems
            } else if (ver) {
                console.log('GameView refresh count:', ver)
                if (state.gems.reduce((total, count) => total + count, 0) === 0) {
                    state.gems = initial.gems
                }
            } else {
                console.log('GameView is unmounted!')
            }
        },
    )
    return <p>
        Gems left: {gameState.gems.join(', ')}
    </p>
}
```

### Key Points
- useState can only appear once per component.
- When garbage collection is enabled, a component won't be destroyed immediately after unmounting and may be reloaded again. Depending on your business logic, you may want to reset the state to the initial state when ver === 1. Only the hook version can help you implement this.
- State field modifications can be slightly counter-intuitive. After executing `state.gems = initial.gems`, state.gems will be a proxy clone of the initial.gems object, not a reference to the same object. `state.gems === initial.gems` will return false.

---

## `resetOnRemount<T>(ver: number, state: T, initial: T): void`

### Description
A shortcut implementation that resets state to its initial value when a component is remounted.

### Parameters
Refer to the parameters of the useState hook callback.

### Example
```typescript
const state = useState(
    { selectedCard: '', playerGems: [3, 3, 3] },
    (ver, state, initial) => {
        if (ver === 1) {
            resetOnRemount(ver, state, initial)
        } else {
            // ...
        }
    }
)

// Or if you only need to reset on remount:
const state = useState(
    { selectedCard: '', playerGems: [3, 3, 3] },
    resetOnRemount,
)
```

### Key Points
- Prevents state persistence in mount/unmount loops, though this scenario only occurs when garbage collection is configured.
- Should only be called in the useState hook callback.

---

## `bindData <T extends State<T>, K extends keyof T>(data: T, key: K): T[K]`

### Description
Creates automatic two-way binding between a state property and form input. Returns a special reactive binding object that can be directly assigned to input or select control properties (such as `value`, `checked`), automatically implementing two-way synchronization.

### Parameters
- `data`: The state object to bind
- `key`: The property name of the state object to bind

### Return Value
A reactive binding object that can be used directly as an HTML attribute value. When the HTML attribute changes, the state is automatically updated; when the state changes, the HTML attribute is also automatically updated.

### Example
```tsx
const state = useState({
    username: '',
    email: '',
    isSelected: false
})

// Directly assign the object returned by bindData to HTML properties
return <div>
    {/* Text input - value automatically bound two-way */}
    <input type='text' value={bindData(state, 'username')} />
    <p>Username: {state.username}</p>
    
    {/* Email input - value automatically bound two-way */}
    <input type='email' value={bindData(state, 'email')} />
    <p>Email: {state.email}</p>
    
    {/* Checkbox - checked automatically bound two-way */}
    <input type='checkbox' checked={bindData(state, 'isSelected')} />
    <p>Selected: {state.isSelected ? 'yes' : 'no'}</p>
</div>
```

### How It Works
1. When the HTML input element's value changes (user input, toggling, etc.), the corresponding property in `state` is automatically updated.
2. When a property value in `state` is modified by code, the corresponding HTML element attribute is automatically updated.
3. No need to manually write `onchange` handlers—it's completely automatic.

---

## `watchMount<ContextT>(context: ContextT, onMounted?: (context: ContextT) => void, onUnmounted?: (context: ContextT) => void): void`

### Description
Monitors component mount and unmount lifecycle events.

### Parameters
- `context`: A context object that can be any value. Used to pass information in onMounted and onUnmounted callbacks.
- `onMounted`: Optional callback function triggered after the component is completely mounted to the DOM tree. At this point the DOM has been rendered and you can access accurate element dimensions, positions, etc. The callback receives context as a parameter.
- `onUnmounted`: Optional callback function triggered when the component is removed from the DOM tree. The callback receives context as a parameter.

### Example
```tsx
// Real scenario: monitoring window resizing and adjusting scaling
const resize = () => {
    const page = document.getElementById('page')
    const play = document.getElementById('play')
    const scaleWidth = page!.clientWidth / play!.clientWidth
    const scaleHeight = page!.clientHeight / play!.clientHeight
    page!.style.transform = `scale(${scaleWidth < scaleHeight ? scaleWidth : scaleHeight})`
}

const onMounted = (context) => {
    resize()
    window.addEventListener('resize', resize)
}

const onUnmounted = (context) => {
    window.removeEventListener('resize', resize)
}

// Using in a component
export const PlayView: Com = ({ game, user }) => {
    // ... component logic ...
    
    watchMount(undefined, onMounted, onUnmounted)
    
    return <div>
        {/* component content */}
    </div>
}
```

### onMounted vs useState Hook
| Feature | useState hook | onMounted |
|---------|---------------|----------|
| **Timing** | During DOM tree construction (synchronous) | After DOM tree construction completes (asynchronous) |
| **Is DOM rendered** | No, still being constructed | Yes, fully rendered |
| **Can get dimension info** | No, not yet rendered | Yes, can get accurate width, height, position, etc. |
| **Use case** | State initialization, conditional logic | DOM manipulation, event listening, getting dimensions |

### Key Points
- `watchMount` must be called within the component function body and should only appear once per component.
- When code in `onMounted` executes, all DOM elements have finished rendering and you can perform DOM queries and manipulations. Typically used in scenarios requiring precise rendering dimensions (like responsive scaling, getting element positions, etc.).
- The `onUnmounted` should clean up event listeners, timers, etc. that were added in `onMounted`.

---

## `Effect: Com<{ on?: () => void, off?: () => void }>`

### Description
An empty component dedicated to handling lifecycle side effects. Triggers the `on` callback when the component is loaded and the `off` callback when it's unloaded.

### Example
```tsx
<Effect
    on={() => {
        console.log('Start the music')
    }}
    off={() => {
        console.log('Stop the music')
    }}
/>
```

### Key Points
- Effect is a component for triggering side effects rather than rendering content, useful for avoiding functions with side effects being triggered every time a component renders.

---

## `navigate(to: string, replace?: true): void`

### Description
Programmatically navigate to a new route. Updates the URL and renders the corresponding route component.

### Parameters
- `to`: The route path to navigate to
- `replace`: If `true`, replaces the history entry (back button won't go back). Defaults to `undefined`.

### Example
```ts
// Simple navigation
navigate('/game')

// Navigate and replace history
navigate('/login', true)

// In an event handler
<input type='button' value='To Menu Page' onclick = () => navigate('/menu') />
```

### Key Points
- Changes the current route and renders the matching component
- Works in conjunction with the `Router` and `route()` system
- Use `replace=true` to prevent users from going back via the back button

---

## `Router: Com<{ routes: RouteMap, notFound?: Com, checkAuth: (url: string) => string | void }>`

And the helper function to create RouteMap:

`route<ParamT extends Record<string, string>>(com: Com<ParamT>, pattern: string, noAuth?: true): IRoute<ParamT>`

### Description
Defines a route table that maps different URLs to corresponding components based on pattern matching and renders them, with authentication checking support.

### Parameters
- `routes`: A mapping of routeName => IRoute. IRoute is created by the route function, parameters:
    - `com`: The component responsible for rendering this route
    - `pattern`: URL pattern (e.g., `/game/:gameId?name&age#foo&bar`).
    - `noAuth`: If `true`, skips authentication checking. Defaults to `undefined`.
- `notFound`: The component to render when no route matches (404 page).
- `checkAuth`: If the current URL requires authentication, this callback is responsible for the authentication check and redirects to a specified handling page if the check fails. Return a redirect URL string to indicate check failure, return a falsy value to indicate the check passed.

### Example
```tsx
// Define RouteMap
const routeMap: RouteMap = {
    game: route(GameView, '/game/:gameId#foo&bar'),     // Route with parameters
    menu: route(MenuView, '/menu/*/level*/:level/**'),  // Route with wildcards
    login: route(LoginView, '/', true),                 // Route that won't trigger checkAuth
}

const NotFoundView: Com = () => <p>404 Not Found</p>

<Router
    routes={routeMap}
    notFound={NotFoundView}
    checkAuth={(url) => {
        if (!isUserAuthorized(url)) {
            return `/login?returnTo=${encodeURIComponent(url)}`
        }
    }}
/>
```

### Key Points
- You can declare parameters in the matching pattern, and all parameters are extracted from the matched URL as strings.
- `/game/:gameId?name&age#foo&bar` declares path parameter gameId, query parameters name and age, hash parameters foo and bar.
- The component corresponding to a route must have a property list matching the route parameters. When the route matches, these parameters are passed in as properties and the component is rendered.
- \* serves as a wildcard, matching any letters, numbers, and other valid URL characters and symbols, but not the path separator /.
- \*\* can only appear at the end of a pattern, it matches the path separator /, meaning any number of directory levels after the pattern can exist.
- Generally, routes with wildcards will have more finely divided sub-route tables inside the corresponding component to handle different URL patterns.

---

## `Link: Com<LinkProp>` and `RouteLink: Com<RouteLinkProp<ParamT extends Record<string, string>>>`

### Description
Hyperlink components that implement seamless page transitions in single-page applications.

LinkProp and RouteLinkProp are defined as follows:
```ts
export type LinkProp = PropsWithChildren<TagProps<'a'>> & {
    replace?: boolean
}

export type RouteLinkProp<ParamT extends Record<string, string>> = PropsWithChildren<Omit<TagProps<'a'>, 'href'>> & {
    route: IRoute<ParamT>
    params: ParamT
    replace?: boolean
}
```

- `Link` usage is almost identical to traditional \<a\> hyperlinks.
- `RouteLink` allows you to leverage a previously defined RouteMap to reverse-generate an href by providing parameters.
- The `replace` parameter, when set to true, replaces the current entry in the navigation history, while false appends a new entry. This affects the back button behavior.

### Example
```tsx
<Link href="/menu">To Menu Page</Link>
<Link href="https://github.com" target="_blank">Open GitHub</Link>

const routeMap: RouteMap = {
    game: route(GameView, '/game/:gameId#foo&bar'),
    menu: route(MenuView, '/menu/*/level*/:level/**'),
    login: route(LoginView, '/', true),
}

<RouteLink route={routeMap.login} >To Login Page</RouteLink>
<RouteLink route={routeMap.game} params={{ gameId: 'my-game', foo: '1', bar: '2'}}>
    To Game Page
</RouteLink>
```

### Key Points
- RouteLink cannot use routes with wildcards

---

## `configGC(waitIntervals: number, interval?: number): boolean`

### Description
Configures the garbage collection strategy. When a component is removed from the DOM tree, it won't be destroyed immediately but instead waits a period of time before destruction, allowing components to be reloaded without being recreated.

### Parameters
- `waitIntervals`: How many `interval`s to wait after component unmounting before destroying it. If 0 is passed, garbage collection is disabled and all unmounted components are destroyed immediately.
- `interval`: Optional, the time interval for garbage collection in milliseconds. The minimum allowed value is 1000. If not specified, the default value of 20,000 is used.

### Return Value
boolean - Whether the configuration was successful

### Example
```ts
// Configure garbage collection: wait 10 intervals before destroying unmounted components, check every 2 seconds
configGC(10, 2000)

// Disable garbage collection (set waitIntervals to 0)
configGC(0, 1000)
```

### Key Points
- By default, garbage collection is disabled if this function is not called.
- When garbage collection is enabled, unmounted components won't be destroyed immediately and can be detected via `useState` with ver being 0 or 1 for unmount/remount.
- Suitable for complex pages with frequent mount/unmount scenarios (e.g., users clicking left navigation or top tabs, switching between pages), can significantly increase rendering performance.
- The ideal time to call this is at the very beginning of your application entry file, or before calling `$ezh.render()` to add the root Com to the DOM tree. However, if needed, calling this function at any time to change GC configuration is valid.


---

## Development Aid - `import 'ezh/debug-check'`

### Usage
Add this line at the very beginning of your application entry file:

```tsx
import 'ezh/debug-check'
import { $ezh, Com, configGC, Effect, navigate, route, Router } from 'ezh'
// ... other imports ...

configGC(10, 2000)
const Root: Com = () => {
    // ... application code ...
}
```

### What It Checks

`debug-check` will check for the following common low-level errors:

1. **Missing key attributes in lists** - Throws an exception when rendering components in a loop without the necessary `key` attribute.
2. **Modifying state outside hooks** - During rendering, the only legal place to modify state is within the hook function of each state. If state is modified outside the hook in other code, an exception will be thrown. (This also reminds you that even when modifying state within a hook, be careful. For example, if you modify an external state passed from a parent Com, and this action triggers the parent Com to re-render, your component may be re-rendered again during the process, executing the hook code again and modifying the parent Com's state again...the program might enter an infinite loop and hang.)
3. **useState called multiple times in a single render of Com** - useState() can only appear once in a Com process.
4. **watchMount called outside of Com** - watchMount() can only be called within a Com and should only be called once.
5. **TSX elements written in root code outside of Com** - TSX elements should only exist within Com.

### Key Points
- `debug-check` performs code injection, which has an impact on runtime performance. It should only be used during development. Remove this line when releasing to production.
- In the browser debugging window, the exception stack will point precisely to the line causing the error, making it easy to fix. However, in some development environments, only the raw exception stack will be displayed, and you may need to manually trace down a few levels from the top of the stack.
