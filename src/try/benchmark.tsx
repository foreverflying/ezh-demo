import { $ezh, Com, configGC, useState } from 'ezh'

configGC(2, 3000)

const random = (max: number) => Math.round(Math.random() * 1000) % max

const A = ['pretty', 'large', 'big', 'small', 'tall', 'short', 'long', 'handsome', 'plain', 'quaint', 'clean',
    'elegant', 'easy', 'angry', 'crazy', 'helpful', 'mushy', 'odd', 'unsightly', 'adorable', 'important', 'inexpensive',
    'cheap', 'expensive', 'fancy']
const C = ['red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple', 'brown', 'white', 'black', 'orange']
const N = ['table', 'chair', 'house', 'bbq', 'desk', 'car', 'pony', 'cookie', 'sandwich', 'burger', 'pizza', 'mouse',
    'keyboard']

let nextId = 1

type Item = {
    id: number
    label: string
}

type State = {
    selected: number
    items: Item[]
}

const buildData = (count: number) => {
    const items: Item[] = []
    for (let i = 0; i < count; i++) {
        items.push({
            id: nextId++,
            label: `${A[random(A.length)]} ${C[random(C.length)]} ${N[random(N.length)]}`,
        })
    }
    return items
}

const create = (state: State, count: number) => {
    state.items = buildData(count)
}

const append = (state: State, count: number) => {
    const items = buildData(count)
    state.items.push(...items)
}

const update = (state: State, interval: number) => {
    const items = state.items
    const length = items.length
    for (let i = 0; i < length; i += interval) {
        items[i].label += ' !!!'
    }
}

const clear = (state: State) => {
    state.items.length = 0
}

const select = (state: State, item: Item) => {
    state.selected = item.id
}

const remove = (state: State, item: Item) => {
    const index = state.items.indexOf(item)
    state.items.splice(index, 1)
}

const swap = (state: State, low: number, high: number) => {
    const items = state.items
    if (items.length > high) {
        [items[low], items[high]] = [items[high], items[low]]
    }
}

const Row: Com<{ state: State, selected: boolean, item: Item }> = ({ state, selected, item }) =>
    <tr className={selected ? 'danger' : ''}>
        <td className="col-md-1" textContent={'' + item.id} />
        <td className="col-md-4">
            <a onclick={() => select(state, item)} textContent={item.label} />
        </td>
        <td className="col-md-1">
            <a onclick={() => remove(state, item)}>
                <span className="glyphicon glyphicon-remove" ariaHidden="true" />
            </a>
        </td>
        <td className="col-md-6" />
    </tr>

const Table: Com<{ state: State }> = ({ state }) => {
    const selected = state.selected
    return <tbody>
        {...state.items.map((item) => {
            const id = item.id
            return <Row key={id} state={state} selected={selected === id} item={item} />
        })}
    </tbody>
}

const Button: Com<{ id: string, title: string, cb: () => void }> = ({ id, title, cb }) =>
    <div className="col-sm-6 smallpad">
        <button type="button" className="btn btn-primary btn-block" id={id} onclick={cb}>{title}</button>
    </div>

const Jumbotron: Com<{ state: State }> = ({ state }) =>
    <div className="jumbotron">
        <div className="row">
            <div className="col-md-6">
                <h1>Ezh keyed</h1>
            </div>
            <div className="col-md-6">
                <div className="row">
                    <Button id="run" title="Create 1,000 rows" cb={() => create(state, 1000)} />
                    <Button id="runlots" title="Create 10,000 rows" cb={() => create(state, 10000)} />
                    <Button id="add" title="Append 1,000 rows" cb={() => append(state, 1000)} />
                    <Button id="update" title="Update every 10th row" cb={() => update(state, 10)} />
                    <Button id="clear" title="Clear" cb={() => clear(state)} />
                    <Button id="swaprows" title="Swap Rows" cb={() => swap(state, 1, 998)} />
                </div>
            </div>
        </div>
    </div>

const Main: Com = () => {
    const state = useState<State>({
        selected: 0,
        items: [],
    })
    return <div className="container">
        <Jumbotron state={state} />
        <table className="table table-hover table-striped test-data">
            <Table state={state} />
        </table>
        <span className="preloadicon glyphicon glyphicon-remove" ariaHidden="true" />
    </div>
}

const rootElement = document.getElementById('main')
if (rootElement) {
    $ezh.render(rootElement, Main)
}
