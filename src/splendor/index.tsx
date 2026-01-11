import 'ezh/debug-check'
import { $ezh, Com, configGC, Effect, navigate, route, Router } from 'ezh'
import { MainView } from './coms/MainView'
import { GameView } from './coms/GameView'
import { client } from './client'

configGC(10, 2000)

const ConnErrorView: Com<{ returnTo?: string }> = ({ returnTo }) => {
    returnTo ||= '/'
    return <div>
        <p>Error: {client.connErr}</p>
        <p>
            <input
                type='button'
                value='Retry'
                onclick={() => {
                    client.resetConnState(false)
                    navigate(returnTo)
                }}
            />
            &nbsp;
            <input
                type='button'
                value='Force Kick'
                onclick={() => {
                    client.resetConnState(true)
                    navigate(returnTo)
                }}
            />
        </p>
    </div>
}

const SignUpView: Com<{ returnTo?: string }> = ({ returnTo }) => {
    const { userId } = client
    if (!userId) {
        return <Effect on={() => {
            client.SignUpAnonymously()
        }} />
    } else {
        navigate(returnTo || '/')
    }
}

const routeMap = {
    connErr: route(ConnErrorView, '/conn-err?returnTo', true),
    signUp: route(SignUpView, '/signup', true),
    main: route(MainView, '/'),
    game: route(GameView, '/game/:gameId'),
}

const Root: Com = () => {
    return <Router
        routes={routeMap}
        checkAuth={(url) => {
            if (!client.userId) {
                return `/signup?returnTo=${encodeURIComponent(url)}`
            }
            if (client.connErr) {
                return `/conn-err?returnTo=${encodeURIComponent(url)}`
            }
        }}
    />
}

const rootElement = document.getElementById('root')
if (rootElement) {
    $ezh.render(rootElement, Root)
}
