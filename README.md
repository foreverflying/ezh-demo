# ezh-demo

**English | [中文](./README.cn.md)**

Demos project for the `ezh` frontend framework

## About ezh

**ezh** is a next-generation frontend framework based on a revolutionary rendering mechanism. It redefines how modern web applications are built by letting development focus entirely on business logic and data models, rather than rendering processes.

### Key Features

- **TypeScript First**: Enforces TypeScript and TSX syntax development. **JS and JSX will never be supported**
- **Ultra-Lightweight**: ~2500 lines of core code, compressed distribution code is only 21KB
- **Complete Type System**: Full native HTML tag type support
- **Outstanding Performance**: Optimized rendering engine with top-tier speed, built-in DOM tree caching to avoid repeated creation and destruction
- **Flexible GC**: Configurable garbage collection strategies
- **Developer-Friendly**: Despite its powerful capabilities, the learning curve is extremely low. With only about 10 APIs, you can become an expert by reading the documentation in an hour

### Philosophy

ezh is committed to leading a frontend technology revolution that shifts the development paradigm from "thinking about rendering processes" to "focusing on data structures and business models." This will help developers (and AI friends) produce cleaner, more maintainable, and better-performing code.

## Core Usage Example

For more detailed usage, please refer to the [API Documentation](./doc/API-0.4.x.en.md)

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

## Notes for framework developers

### Debugging Local Packages

The packages `ezh`, `ezh-model`, `justrun-ws`, and `justrun-loader` are included as git submodules under `src/`, with stub `package.json` files to act as local packages.

To debug them locally, update your dependencies to use file links:

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

### ⚠️ Important

These packages have peer dependencies on each other:
- `ezh-model` → `ezh`
- `justrun-loader` → `ezh-model`, `justrun-ws`

Ensure each package has only one global instance. Run `npm run clean` to remove any duplicate modules.
