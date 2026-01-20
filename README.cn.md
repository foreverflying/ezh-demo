# ezh-demo

**[English](./README.md) | 中文**

`ezh` 前端框架的示例项目

## 关于 ezh

**ezh** 是一个基于革命性渲染机制的新一代前端框架。它重新定义了现代网页应用的构建方式，让开发思路完全聚焦于业务逻辑和数据模型，而非渲染过程。

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
