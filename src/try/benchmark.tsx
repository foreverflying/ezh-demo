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
    selected: boolean
}

type State = {
    items: Item[]
    selected?: Item
}

const state = useState<State>({
    items: [],
    selected: undefined,
})

const buildData = (count: number) => {
    const items: Item[] = []
    for (let i = 0; i < count; i++) {
        items.push({
            id: nextId++,
            label: `${A[random(A.length)]} ${C[random(C.length)]} ${N[random(N.length)]}`,
            selected: false,
        })
    }
    return items
}

const create = (count: number) => {
    state.items = buildData(count)
}

const append = (count: number) => {
    const items = buildData(count)
    state.items.push(...items)
}

const update = (interval: number) => {
    const items = state.items
    const length = items.length
    for (let i = 0; i < length; i += interval) {
        items[i].label += ' !!!'
    }
}

const clear = () => {
    state.items.length = 0
    state.selected = undefined
}

const select = (item: Item) => {
    if (state.selected) {
        state.selected.selected = false
    }
    item.selected = true
    state.selected = item
}

const remove = (item: Item) => {
    const index = state.items.indexOf(item)
    state.items.splice(index, 1)
    if (state.selected === item) {
        state.selected = undefined
    }
}

const swap = (low: number, high: number) => {
    const items = state.items
    if (items.length > high) {
        [items[low], items[high]] = [items[high], items[low]]
    }
}

const Row: Com<{ item: Item }> = ({ item }) =>
    <tr className={item.selected ? 'danger' : ''}>
        <td className="col-md-1" textContent={'' + item.id} />
        <td className="col-md-4">
            <a onclick={() => select(item)} textContent={item.label} />
        </td>
        <td className="col-md-1">
            <a onclick={() => remove(item)}>
                <span className="glyphicon glyphicon-remove" ariaHidden="true" />
            </a>
        </td>
        <td className="col-md-6" />
    </tr>

const Table: Com = () => {
    return <tbody>
        {state.items.map((item) => {
            return <Row key={item.id} item={item} />
        })}
    </tbody>
}

const Button: Com<{ id: string, title: string, cb: () => void }> = ({ id, title, cb }) =>
    <div className="col-sm-6 smallpad">
        <button type="button" className="btn btn-primary btn-block" id={id} onclick={cb}>{title}</button>
    </div>

const Jumbotron: Com = () =>
    <div className="jumbotron">
        <div className="row">
            <div className="col-md-6">
                <h1>Ezh keyed</h1>
            </div>
            <div className="col-md-6">
                <div className="row">
                    <Button id="run" title="Create 1,000 rows" cb={() => create(1000)} />
                    <Button id="runlots" title="Create 10,000 rows" cb={() => create(10000)} />
                    <Button id="add" title="Append 1,000 rows" cb={() => append(1000)} />
                    <Button id="update" title="Update every 10th row" cb={() => update(10)} />
                    <Button id="clear" title="Clear" cb={() => clear()} />
                    <Button id="swaprows" title="Swap Rows" cb={() => swap(1, 998)} />
                </div>
            </div>
        </div>
    </div>

const Main: Com = () => {
    return <div className="container">
        <Jumbotron />
        <table className="table table-hover table-striped test-data">
            <Table />
        </table>
        <span className="preloadicon glyphicon glyphicon-remove" ariaHidden="true" />
    </div>
}

const rootElement = document.getElementById('main')
if (rootElement) {
    $ezh.render(rootElement, Main)
}
