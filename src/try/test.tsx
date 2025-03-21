import { $ezh, Com, Container, EzElement } from 'ezh'

const Test1: Container<{ okay: boolean }> = ({ okay, children }) => {
    const child = children as EzElement[]
    console.log(child.length, okay)
    return <div>Hello</div>
}

const Test2: Com<{ yes?: boolean }> = ({ yes }) => <div>World ${yes}</div>

const Test3: Container<object> = (_props, children) => {
    return <p>
        {...children || []}
    </p>
}

const names = [
    'Hello',
    'World',
]

const testFunc = () => {
    const ele = <div>
        <Test1 key={'hello'} okay={false} />

        <Test1 okay={false}></Test1>

        <Test1 okay={false}>
        </Test1>

        <Test1 okay={true}>
            <p>line1</p>
        </Test1>
        {...names.map(item => <p>{item}</p>)}
        <Test1 okay={true}>
            {names.map(item => <p>{item}</p>)}
            {() => 'Hello'}
            <p>line1</p>
            <p>line2</p>
        </Test1>

        <Test2 />

        <Test2></Test2>

        <Test2>
        </Test2>

        <p>Hello</p>
        <p>World</p>
    </div>

    // // this should encounter a syntax error
    // const errorEle = <div>
    //     <Test2 yes={true}>
    //         <p>hi</p>
    //     </Test2>
    //     <Test2>
    //         <p>hi</p>
    //         <p>hi</p>
    //     </Test2>
    // </div>

    const arr = [
        <p>hello</p>,
        <p>world</p>,
    ]
    return <Test3>
        {ele}
        <p>
            {...arr}
        </p>
    </Test3>
}

testFunc()