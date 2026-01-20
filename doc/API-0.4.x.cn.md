# ezh API 文档

**[English](./API-0.4.x.en.md) | 中文**

ezh 追求简单即美的设计哲学，其核心用户接口简练到只有10个左右的API，但强大到足以构建功能完整的响应式 Web 应用。

得益于此，你不会遇到陡峭的学习曲线，平坦的也不会，因为这是一个没有学习曲线的前端框架。

本文档通过实例讲解每个 API 的用法，在不算长的篇幅里涵盖了 ezh 全部的使用细节，帮你在一个小时内达到 ezh 专家水准。

---

## Overview - 基础用法

### 导入 $ezh 和核心类型

使用 ezh 框架的第一步是从 `'ezh'` 包中导入必要的符号：

```tsx
import { $ezh, Com, Container } from 'ezh'
```

### Com 与 Container

ezh 提供两种组件类型：Com 和 Container，它们共同对应着 React 中的 Component 概念。区别在于 Container 有隐含声明的 children 属性而 Com 没有。

#### `Com` - 无 Children 的组件

```tsx
const PlayerCard: Com<{ name: string; level: number }> = ({ name, level }) => {
    return <div>
        <p>Player: {name}</p>
        <p>Level: {level}</p>
    </div>
}

// 使用时建议以自闭合标签形式：
<PlayerCard name="Alice" level={10} />
// 以下写法也可以，但要确保中间不能有任何内容
<PlayerCard name="Alice" level={10}></PlayerCard>
// 以下写法编译器会报错
<PlayerCard name="Alice" level={10}>Hello</PlayerCard>
```

#### `Container` - 包含 Children 的组件

```tsx
const PlayerList: Container<{ title: string }> = ({ title, children }) => {
    return <div>
        <h2>{title}</h2>
        <ul>
            {children}
        </ul>
    </div>
}

// 使用时可以包含子元素：
<PlayerList title="Game Players">
    <div>Alice</div>
    <div>Bob</div>
    <div>Charlie</div>
</PlayerList>
```

### 渲染到 DOM

使用 `$ezh.render()` 函数将根组件挂载到 DOM 中：

```tsx
const Root: Com = () => {
    return <div>
        <h1>My App</h1>
        <PlayerCard name="Alice" level={10} />
    </div>
}

// 获取 DOM root 元素
const rootElement = document.getElementById('root')

// 将 Root 组件渲染到 root 元素中
if (rootElement) {
    $ezh.render(rootElement, Root)
}
```

`$ezh.render()` 的签名为：

```ts
$ezh.render(rootElement: Element, entry: (() => EzElement) | Com): void
```

- `rootElement`：目标 DOM 元素。
- `entry`：根组件，可以是无属性的 `Com` 类型函数，或是一个`() => EzElement` 类型的函数。

### 要点
- 在 ezh 里，`() => EzElement` 类型的函数是一个可以被渲染的合法元素，它返回的内容会被渲染到它所在的位置。
```tsx
// 这是一个合法的组件写法
const Root: Com = () => {
    return <div>
        <h1>{() => 'My App'}</h1>
        {() => <PlayerCard name="Alice" level={10} />}
    </div>
}
```

---

## `useState<T>(initial: T, hook?: (ver: number, state: T, initial: T) => void): T`

### 说明
创建和管理组件状态。返回一个响应式状态对象，用于触发重新渲染。

### 参数
- `initial`: 初始状态对象，只允许 Array | Object
- `hook`: 可选，状态版本改变时的回调函数。用于执行与状态变化相关的副作用，参数说明：
    - `ver`: 组件刚挂载进DOM树时值为1，后续每次重新渲染该组件，此值都会加1。当组件被从DOM树中移除时，此值为0
    - `state`: 即 useState 返回的 state 对象，函数初次被执行时，需要使用这个 state，因为外部保存返回值的变量还未被赋值。
    - `initial`: 即 useState 传入的第一个参数。只有 ver 为 0 时这个值等于 state。

### 返回值
initial 对象的响应式代理克隆体，当它的某个属性被修改时，自动触发（读取过那个属性的）组件重新渲染。

### 示例
```tsx
const PlayerView: Com = () => {
    const state = useState({
        name: 'Player',
        age: 10,
    })

    // 修改状态 - 触发重新渲染
    return <p>
        Name: {state.name}
        <span onclick={() => state.age++} >
            Age(click to get older):
        </span>
        {state.age}
    </p>
}

const GameView: Com = () => {
    // 带 hook 回调
    const gameState = useState(
        { selectedCard: '', gems: [3, 3, 3] },
        (ver, state, initial) => {
            if (ver === 1) {
                // GameView 被初次加载
                // 但组件也有可能之前被卸载过，现在正在被重新加载，所以让 state 重新恢复初始状态
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

### 要点
- useState 在一个组件内只允许出现一次。
- 在启用了垃圾回收的情况下，一个组件 unmount 之后不会立刻被销毁，可能会被再次加载。视业务逻辑需要，你或许希望在检测 ver === 1 时重置 state 到初始状态，只有带 hook 的版本可以帮你实现这一点。
- state 字段的修改会有一点反直觉。当你执行 state.gems = initial.gems 之后，state.gems 将会是 initial.gems 对象的代理克隆体，而非同一个对象的引用。state.gems === initial.gems 将会返回 false。

---

## `resetOnRemount<T>(ver: number, state: T, initial: T): void`

### 说明
当组件重新挂载时，将状态重置为初始值的快捷实现。

### 参数
参考 useState 的 hook 回调的参数。

### 示例
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

// 或者如果你只需要做重新加载时重置这一件事：
const state = useState(
    { selectedCard: '', playerGems: [3, 3, 3] },
    resetOnRemount,
)
```

### 要点
- 防止组件挂载/卸载循环中的状态持久化，不过这种情况只有在配置了垃圾回收时才会发生。
- 只应在 `useState` hook 回调中调用

---

## `bindData <T extends State<T>, K extends keyof T>(data: T, key: K): T[K]`

### 说明
创建状态属性与表单输入的自动双向绑定。返回一个特殊的响应式绑定对象，可以直接赋给 input 控件或 select 控件的属性（如 `value`、`checked`），自动实现双向同步。

### 参数
- `data`: 要绑定的状态对象
- `key`: 要绑定的状态对象的属性名

### 返回值
响应式绑定对象，可直接作为HTML属性值使用。当HTML属性变化时自动更新状态；当状态变化时HTML属性也会自动更新。

### 示例
```tsx
const state = useState({
    username: '',
    email: '',
    isSelected: false
})

// 直接将 bindData 返回的对象赋给 HTML 属性
return <div>
    {/* 文本输入 - value 自动双向绑定 */}
    <input type='text' value={bindData(state, 'username')} />
    <p>Username: {state.username}</p>
    
    {/* 邮箱输入 - value 自动双向绑定 */}
    <input type='email' value={bindData(state, 'email')} />
    <p>Email: {state.email}</p>
    
    {/* 复选框 - checked 自动双向绑定 */}
    <input type='checkbox' checked={bindData(state, 'isSelected')} />
    <p>Selected: {state.isSelected ? 'yes' : 'no'}</p>
</div>
```

### 工作原理
1. 当 HTML 输入元素的值改变时（用户输入、勾选等），`state` 中对应的属性会自动更新
2. 当 `state` 中的属性值被代码修改时，对应的 HTML 元素属性会自动更新
3. 无需手动编写 `onchange` 处理器，完全自动化

---

## `watchMount<ContextT>(context: ContextT, onMounted?: (context: ContextT) => void, onUnmounted?: (context: ContextT) => void): void`

### 说明
监听组件的挂载和卸载生命周期事件。

### 参数
- `context`: 上下文对象，可以是任意值。用于在 onMounted 和 onUnmounted 回调中传递信息。
- `onMounted`: 可选，组件完全挂载到DOM树后的回调函数。此时DOM已经渲染完成，可以访问准确的元素尺寸、位置等信息。该函数接收 context 作为参数。
- `onUnmounted`: 可选，组件从DOM树中卸载时的回调函数，该函数接收 context 作为参数。

### 示例
```tsx
// 实际场景：监听窗口大小变化并调整缩放
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

// 在组件中使用
export const PlayView: Com = ({ game, user }) => {
    // ... 组件逻辑 ...
    
    watchMount(undefined, onMounted, onUnmounted)
    
    return <div>
        {/* 组件内容 */}
    </div>
}
```

### onMounted vs useState hook 的区别
| 特性 | useState hook | onMounted |
|------|---------------|----------|
| **调用时机** | DOM树构建过程中（同步） | DOM树构建完成后（异步） |
| **DOM是否已渲染** | 否，正在构建 | 是，已完全渲染 |
| **能否获取尺寸信息** | 否，还未渲染 | 是，可以获取准确的宽高位置等 |
| **用途** | 状态初始化、条件判断 | DOM操作、事件监听、获取尺寸 |

### 要点
- `watchMount` 必须在组件函数体内调用，在一个组件内只应该出现一次。
- `onMounted` 中的代码执行时，所有DOM元素已经渲染完成，可以进行DOM查询和操作，通常用于需要精确渲染尺寸的场景（如响应式缩放、获取元素位置等）。
- `onUnmounted` 中应该清理在 `onMounted` 中添加的事件监听器、定时器等。

---

## `Effect: Com<{ on?: () => void, off?: () => void }>`

### 说明
一个内容为空的组件，专用于处理生命周期副作用。当该组件被加载时触发 `on` 回调，被卸载时触发 `off` 回调。

### 示例
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

### 要点
- Effect 是一个用于触发副作用而不是渲染内容的组件，适用于避免某个组件每次渲染都可能触发带有副作用的函数的情形。

---

## `navigate(to: string, replace?: true): void`

### 说明
编程式导航到新路由。更新 URL 并渲染对应的路由组件。

### 参数
- `to`: 要导航到的路由路径
- `replace`: 若为 `true`，替换历史记录（返回按钮不会返回）。默认为 `undefined`。

### 示例
```ts
// 简单导航
navigate('/game')

// 导航并替换历史记录
navigate('/login', true)

// 在事件处理器中
<input type='button' value='To Menu Page' onclick = () => navigate('/menu') />
```

### 要点
- 改变当前路由并渲染匹配的组件
- 与 `Router` 和 `route()` 系统配合工作
- 用 `replace=true` 阻止通过返回按钮返回上一页

---

## `Router: Com<{ routes: RouteMap, notFound?: Com, checkAuth: (url: string) => string | void }>`

以及帮助创建 RouteMap 的函数：

`route<ParamT extends Record<string, string>>(com: Com<ParamT>, pattern: string, noAuth?: true): IRoute<ParamT>`

### 说明
定义一个路由表，将不同的URL按模式匹配映射到相应组件并渲染，同时提供鉴权检查。

### 参数
- `routes`: routeName => IRoute 的映射表。IRoute 由 route 函数创建，参数说明：
    - `com`: 处理该路由渲染的组件
    - `pattern`: URL 模式（如 `/game/:gameId?name&age#foo&bar`）。
    - `noAuth`: 若为 `true`，跳过身份验证检查。默认为 `undefined`。
- `notFound`: 无路由匹配时渲染的组件（404 页面）。
- `checkAuth`: 如果当前URL是需要鉴权的，此回调函数负责鉴权检查，并在检查失败后将控制流转向指定的处理页面。返回一个跳转URL字符串说明检查失败，返回空值则说明检查通过。

### 示例
```tsx
// 定义 RouteMap
const routeMap: RouteMap = {
    game: route(GameView, '/game/:gameId#foo&bar'),     // 带参数的路由
    menu: route(MenuView, '/menu/*/level*/:level/**'),  // 带通配符的路由
    login: route(LoginView, '/', true),                 // 不会触发 checkAuth 回调的路由
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

### 要点
- 匹配模式中可以声明参数，所有参数从匹配成功的 URL 中提取，且都是 string 类型。
- `/game/:gameId?name&age#foo&bar` 定义了path参数 gameId，query参数 name, age，hash参数 foo, bar
- 与路由对应的组件，其属性列表需要与路由参数表相同，路由匹配命中，就会将这些参数作为属性传入并渲染该组件。
- \* 作为通配符，可以匹配任意字母数字等合法URL字符和符号，但不包括分隔符/。
- \*\* 只能出现在匹配模式的结尾，它能够匹配分隔符/，也就是说它代表匹配模式后面可以有任意多级目录。
- 一般来说，带有通配符的路由，其对应组件的内部将会有更精细划分的子级路由表，以处理不同模式的URL。

---

## `Link: Com<LinkProp>` 与 `RouteLink: Com<RouteLinkProp<ParamT extends Record<string, string>>>`

### 说明
超链接组件，实现单页应用的无刷新跳转。

其中，LinkProp 与 RouteLinkProp 类型定义如下：
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

- `Link` 的用法几乎与传统的超链接\<a\>完全相同。
- `RouteLink` 允许依托于之前已经定义的 RouteMap，通过提供参数通过 route 逆向生成 href。
- 参数 `replace` 为 true 会替换导航的 history 记录，为 false 则会追加新记录。这将会影响后退的行为。

### 示例
```tsx
<Link href="/menu" replace={true}>To Menu Page</Link>
<Link href="https://github.com" target="_blank">Open GitHub</Link>

const routeMap: RouteMap = {
    game: route(GameView, '/game/:gameId#foo&bar'),
    menu: route(MenuView, '/menu/*/level*/:level/**'),
    login: route(LoginView, '/', true),
}

<RouteLink route={routeMap.login}>To Login Page</RouteLink>
<RouteLink route={routeMap.game} params={{ gameId: 'my-game', foo: '1', bar: '2'}}>
    To Game Page
</RouteLink>
```

### 要点
- RouteLink 不能使用带有通配符的route

---

## `configGC(waitIntervals: number, interval?: number): boolean`

### 说明
配置垃圾回收策略。当组件从DOM树中移除后，不会立刻被销毁，而是等待一段时间后再销毁，以便组件可以被重新加载而无需重新创建。

### 参数
- `waitIntervals`: 组件卸载后等待多少个 `interval` 后才被销毁。如果传递0，则表示关闭垃圾回收，所有卸载了的组件将会立即被销毁。
- `interval`: 可选，垃圾回收的时间间隔，单位为毫秒。表示每隔多少毫秒进行一次垃圾回收检查。允许的最小值为1000，如不传此参数则使用默认值20,000。

### 返回值
boolean - 返回配置是否成功

### 示例
```ts
// 配置垃圾回收：卸载的组件等待10个间隔后销毁，每2秒检查一次
configGC(10, 2000)

// 禁用垃圾回收（设置waitIntervals为0）
configGC(0, 1000)
```

### 要点
- 不调用此函数时，垃圾回收功能默认关闭。
- 启用垃圾回收后，卸载的组件不会立刻销毁，可以通过 `useState` 的 `ver` 为 0 或 1 检测组件被卸载和重新加载。
- 适用于复杂页面中出现频繁挂载/卸载的场景（比如用户点击左侧导航栏或顶部Tab，在几个页面中不断切换），能够大幅增加渲染性能。
- 理想的调用时间应该是在应用入口文件的最开始，或者在$ezh.render()将根Com加入DOM树之前。不过，如果有特殊需要，任何时间点调用此函数更改GC配置都是有效的。

---

## 开发辅助 - `import 'ezh/debug-check'`

### 用法
在程序入口文件的最开始添加：

```tsx
import 'ezh/debug-check'
import { $ezh, Com, configGC, Effect, navigate, route, Router } from 'ezh'
// ... 其他导入 ...

configGC(10, 2000)
const Root: Com = () => {
    // ... 应用代码 ...
}
```

### 检查内容

`debug-check` 会检查以下常见低级错误：

1. **列表缺少 key 属性** - 当在循环中渲染组件而没有添加必要的 `key` 属性时抛出异常。
1. **在 hook 外修改 state** - 在渲染过程中，唯一可以合法修改 state 的位置是在各 state 的 hook函数里，如果再 hook 之外的代码里修改了 state，将会抛出异常。（同时也提醒你，即使在 hook 中修改 state，也要小心，比如当你修改了从父 Com 传进来的外部 state，这个动作如果触发了父 Com 重新渲染，过程中可能又再次触发了你的组件重新渲染，执行中 hook 代码再次修改了父 Com 的 state……程序可能死循环卡住。）
1. **useState在 Com 的单次渲染中被多次调用** - useState() 在一个 Com 过程中只能出现一次。
1. **watchMount调用发生在 Com 之外** - watchMount() 只能在 Com 中被调用，且只应调用一次。
1. **在 Com 之外的根部代码里写了tsx元素** - tsx 元素只应该存在于 Com 里。

### 要点
- `debug-check` 执行了代码注入，对运行时性能有影响，所以仅应用于开发阶段，生产发布时应删除此行
- 在浏览器调试窗口，异常栈会精确指向导致错误的代码行，方便快速修复。不过有些开发环境中，只会显示原始的异常栈，你需要自己从栈顶向下找几层。
