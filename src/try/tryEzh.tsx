import 'ezh/debug-check'
import { $ezh, Com, EzElement, Link, Router, bindData, configGC, route, useState } from 'ezh'

configGC(12, 50000)

const Test: Com<{ text: string, counter?: { count: number } }> = ({ text, counter }) => {
    return <p>{`${text}${counter ? ' - Counter is ' + counter.count : ''}`}</p>
}

const Test0: Com<{ text: string, counter?: { count: number } }> = ({ text, counter }) => {
    if (!counter) {
        return
    }
    const count = counter.count
    return count % 2 !== 0 ?
        <Test text={'- ODD - Test-updating: ' + text + ' - ' + count} counter={counter} /> :
        <Test text={'- EVEN - Test-updating: ' + text + ' - ' + count} counter={counter} />
}

const Test1: Com<{ text: string, counter?: { count: number } }> = ({ text, counter }) => {
    return <p className={text.startsWith('Test-AAA') ? 'hello' : undefined}>
        /=== {text}
        <Test text='Test' counter={counter} />
        <Test0 text='Test0' counter={counter} />
        \=== {text}
    </p>
}

const Test2: Com<{ record: { count: number }[] }> = ({ record }) => {
    return <div>
        <p>--------------------------- Records are:</p>
        {/* {record.map((item, index) => <p key={index}>{`count: ${item.count}`}</p>)} */}
        {() => {
            const result: EzElement[] = []
            let index = 0
            for (const item of record) {
                result.push(<p key={index++}>{`count: ${item.count}`}</p>)
            }
            return result
        }}
        <p>--------------------------- Record ends</p>
    </div>
}

const Test3: Com<{ record: { count: number }[] }> = ({ record }) => {
    return <div>
        <p>{`Record length is ${record.length}`}</p>
        <Test2 record={record} />
    </div>
}

interface LevelObj {
    level: number
}

type Test4State = {
    record: { count: number }[]
}

const Test4: Com<{ levelObj: LevelObj }> = ({ levelObj }) => {
    const state = useState<Test4State>((current) => {
        if (!current) {
            return {
                record: [
                    {
                        count: levelObj.level,
                    },
                ],
            }
        }
        const record = current.record
        const last = record[record.length - 1]

        record.push({
            count: last.count + 1 + 100 * levelObj.level,
        })
        if (record.length > 10) {
            record.splice(record.length - 10, 2, { count: -1 }, { count: -2 })
        }
        return current
        // const result = record.concat({
        //     count: last.count + 1 + 100 * levelObj.level
        // })
        // return {
        //     record: result
        // }
    }, true)

    const record = state.record

    // should fail the debugCheck:
    // - Models should not be modified while rendering
    // record.length = 0

    const last = record[record.length - 1]
    const display = record.map(item => item.count).join(', ')
    return <>
        <div className='hello'>
            <p>Count record: {display}</p>
            <Test1 text='Test3' counter={last} />
            <p>.</p>
            <Test3 record={record} />
        </div>
    </>
}

type MyState = {
    name: string
    level: number
    text: string
    isSelected: boolean
    counter: {
        count: number
    }
}

const Test5: Com<{ text: string, some?: string }> = ({ text }) => {
    const state = useState<MyState>({
        name: 'Andy',
        level: 0,
        text: 'Hello world',
        isSelected: false,
        counter: {
            count: 0,
        },
    })
    const onclick = (ev: MouseEvent) => {
        console.log('onclick, mouse pos - x:', ev.x, ', y: ', ev.y)
        state.isSelected = !state.isSelected
        const count = ++state.counter.count
        if (count % 1 === 0) {
            state.level++
            if (state.level % 2 === 0) {
                state.name += ` - ${state.level}`
            }
        }
    }

    const eleAAA = <Test1
        text={`Test-AAA: ${text} - WITH COUNTER`}
        counter={state.counter}
    />
    const eleBBB = <Test1 text={`Test-BBB: ${text}`} />
    const eleCCC = <Test1 text={`Test-CCC: ${text}`} />
    const eleDDD = <p style={{ background: 'gray' }}>
        <Test4 levelObj={state}></Test4>
    </p>
    const arr = [eleAAA, eleBBB, eleCCC, eleDDD]
    const count = state.counter.count
    const left = count % 4
    const styleArr = [
        { color: 'red' },
        { background: 'pink' },
    ]
    return <div>
        <input type='text' value={bindData(state, 'text')} />
        <p style={styleArr[state.counter.count % 2]}>Text: {state.text}</p>
        <p>
            <input id='checkbox1' type='checkbox' checked={bindData(state, 'isSelected')} />
            <label htmlFor='checkbox1'>Data Bound</label>
        </p>
        <p>
            <input id='checkbox2' type='checkbox' checked={state.isSelected} />
            <label htmlFor='checkbox2'>Data NOT Bound</label>
        </p>
        <p style={styleArr[state.counter.count % 2]}>Checkbox: {state.isSelected}</p>
        <p>line 0 -------------------------------------- <u onclick={onclick}>CLICK ME!!</u></p>
        {/* {arr[left]} */}
        <p>line 1 -------------------------------------- {`${state.name} : LEVEL IS ${state.level}`}</p>
        <>
            {arr[(left + 1) % 4]}
            <p>line 2 -------------------------------------- {`counter is ${state.counter.count}`}</p>
            {arr[(left + 2) % 4]}
        </>
        {() => <p key='hello'>line 3 -------------------------------------- </p>}
        <p style={{ background: 'yellow' }}>
            {arr[(left + 3) % 4]}
        </p>
        <p>line 4 -------------------------------------- </p>
        <p>{`** level is ${state.level} **`}</p>
    </div>
}

const tryMap = ['key1', 'key2', 'key3']
const jsxPiece = () => <p>JSX piece - Function call</p>

const TestPage1: Com = () => {
    return <div>
        {<Test5 text='Ann' some='(^_^)' />}
        <p>.</p>
        <p>hello</p>
        {() => <p>{() => 'Function call!!!!'}</p>}
        {[
            <p>Array Item 1</p>,
            () => <p>Array Item 2 - Anonymous arrow call</p>,
            jsxPiece,
            () => <Test text='Com Function call In Array!!' />,
        ]}
        <p>.</p>
        {tryMap.map(key =>
            <div key={key}>
                First try of map
                <p>{`Key is ${key}`}</p>
                <p> -------------- </p>
            </div>,
        )}
        <svg width={300} height={200}>
            <path d='M0 0 L50 0 L50 50 L0 50 Z' />
            <foreignObject width='300' height='150'>
                <p>Yes I am in svg!</p>
                <p>Hello world</p>
            </foreignObject>
        </svg>
        <math id="math1" className="math-class">
            <mrow dir='rtl'>
                <mi>x</mi>
                <mi>y</mi>
                <mi>z</mi>
            </mrow>
        </math>
    </div>
}

const TestPage2: Com<{ name: string, age: number }> = ({ name, age }) => {
    return <div>
        <p>Test page 2</p>
        <p>Name: {name}</p>
        <p>Age: {age}</p>
    </div>
}

const routeMap = {
    testPage1: route(TestPage1, '/', false),
    testPage2: route(TestPage2, '/test2/:name/:age', false),
}

const rootElement = document.getElementById('root')
if (rootElement) {
    $ezh.render(rootElement, () => (
        <div>
            <p>
                <Link href='/'>test page 1</Link>
                &nbsp;
                <Link href='/test2/sam/18'>test page 2</Link>
            </p>
            <Router routes={routeMap} />
        </div>
    ))
}
