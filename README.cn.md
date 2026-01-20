# ezh-demo

**[English](./README.md) | 中文**

`ezh` 前端框架的示例项目

## Demos
**[splendor](https://splendor.ezh.dev)**: 璀璨宝石，一个经典的2~4人玩的卡牌桌游，这是它的电子版。


## 关于 ezh

**ezh** 是一个基于革命性渲染机制的新一代前端框架。它重新定义了现代网页应用的构建方式，让开发思路完全聚焦于业务逻辑和数据模型，而非渲染过程。

### "ezh" 应该怎么读？

ezh 的名字其实源于"Easy HTML"，也许应该被读作 "easy H"。不过，作者调皮地决定，指定它的官方发音同"edge"，希望通过它的传播，未来更多的英语使用者能了解到在汉语拼音里的`zh`是怎么发音的，然后我的名字就更有更多机会被读对了 ^_^

### 核心特性

- **TypeScript至上**：强制使用 TypeScript 和 TSX 语法开发，**永远不会支持 JS 和 JSX**
- **超轻量级**：核心代码约 2500 行，发行版压缩代码仅21KB
- **完整类型系统**：完整的原生 HTML 标签类型支持
- **卓越性能**：优化的渲染引擎，性能顶尖，内置 DOM 树缓存能力，避免重复创建销毁
- **灵活 GC**：可配置的垃圾回收策略
- **开发者友好**：尽管功能强大，但学习曲线极低，API 只有10个左右，一小时看完文档即成专家

### 设计哲学

ezh 致力于引领将开发范式从"思考渲染过程"到"专注于数据结构和业务模型"的前端技术革命。这将帮助开发者（和AI朋友们）生产更简洁、更易维护、性能更优的代码。

## 核心用法展示

更详细用法请参考 [API说明文档](./doc/API-0.4.x.cn.md)

```tsx
import { $ezh, bindData, Com, useState } from 'ezh'

type Player = {
    name: string
    isSelected: boolean
}

const PlayerView: Com<{ player: Player, onRemove: (player: Player) => void }> = (
    { player, onRemove },
) => {
    return <p>
        <input type='checkbox' checked={bindData(player, 'isSelected')} />
        Name: {player.name}
        <input type='button' value='Remove' onclick={() => onRemove(player)} />
    </p>
}

const MainView: Com = () => {
    const state = useState({
        name: '',
        players: [] as Player[],
    })
    const { players } = state
    const onAdd = () => {
        if (state.name) {
            const isSelected = (players.length + 1) % 2 === 0
            players.push({ name: state.name, isSelected })
            state.name = ''
        }
    }
    const onRemove = (player: Player) => {
        const idx = players.indexOf(player)
        players.splice(idx, 1)
    }
    const selectedCount = players.reduce((count, player) => count + (player.isSelected ? 1 : 0), 0)
    return <div>
        <p>Player count: {players.length}, seleted count: {selectedCount}</p>
        <p>
            {players.map((player, i) => <PlayerView key={i} player={player} onRemove={onRemove} />)}
        </p>
        <p>
            <input type='text' value={bindData(state, 'name')} />
            <input type='button' value='Add' onclick={onAdd} />
        </p>
    </div>
}

$ezh.render(document.getElementById('root')!, MainView)
```

## 框架开发者注意事项

### 环境搭建
1. 在你的工作目录下：git clone https://github.com/foreverflying/dev-node.git
2. 在相同的工作目录下：git clone https://github.com/foreverflying/ezh-demo.git
3. 确保你的系统安装了 docker, vscode 以及 vscode 插件 Dev Containers
4. 打开 vscode，点最左下角，然后选择 Open Folder in Container, 打开 ezh-demo 目录
5. 初次打开时间比较长，会拉取 docker image, 构建 dev-node image，安装插件、初始化等等
6. 运行 npm start，显示 compiled successfully 后，按 F5 可以启动 Chrome 调试了

### 环境指引
1. `webpack.config.js` 其中注释掉了几个不同的程序入口，benchmark, tryEzh 等等，你可以依次尝试使用每一个启动 npm start。同时也意味着，你可以在 src 中创建自己的项目目录，仿照它们的方式，将自己的程序入口以及 static 路径加入到 webpack.config.js 中，一键启动。

2. `tsconfig.json` Ezh 的 tsx 语法支持，需要在 tsconfig 中做相应的配置，主要是这几个字段：
    ```json
    // tsconfig.json
    {
        "jsx": "react",
        "jsxFactory": "$ezh.ezh",
        "jsxFragmentFactory": "$ezh",
    }
    ```

3. `ezh-trans` 在 webpack.config.js 中，你能看到使用 ts-loader 插件执行 `ezh-trans` 包的 `ezhTransformer` 的相关配置，这是 Ezh 可以完成它神奇工作的关键之一。同时这也解释了为什么 Ezh 不支持JS：它必须依赖 tsc 编译器提供的 transformer 接口，在编译过程中执行 `ezhTransformer` 修改语法树，才能产生 Ezh 运行时所需的代码。同时这也是目前这个最新的项目还在用最老的 webpack 作为构建工具的原因，因为基于 esbuild 的构建工具如 vite 不支持这一特性。

### 调试本地包

包 `ezh`、`ezh-model`、`justrun-ws` 和 `justrun-loader` 作为 git 子模块包含在 `src/` 下，并配备了 stub `package.json` 文件以充当本地包。

要在本地调试它们，请更新依赖项以使用文件链接：

```json
// package.json
{
  "dependencies": {
    "ezh": "file:./src/ezh",
    "ezh-model": "file:./src/ezh-model",
    "justrun-loader": "file:./src/justrun-loader",
    "justrun-ws": "file:./src/justrun-ws"
  }
}
```

### ⚠️ 重要提示

这些包彼此有对等依赖关系：
- `ezh-model` → `ezh`
- `justrun-loader` → `ezh-model`、`justrun-ws`

确保每个包在全局范围内只有一个实例。运行 `npm run clean` 以删除任何重复的模块。
