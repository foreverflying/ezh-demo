import 'ezh/debug-check'
import { $ezh, Com, configGC, Effect, navigate, route, Router } from 'ezh'
import { MainView } from './coms/MainView'
import { GameView } from './coms/GameView'
import { client } from './client'
import { ConnErrorOverlay } from './coms/ConnErrorOverlay'

configGC(10, 2000)

const SignUpView: Com<{ returnTo?: string }> = ({ returnTo }) => {
    const { userId } = client
    if (!userId) {
        return <Effect on={() => {
            client.signUpAnonymously()
        }} />
    } else {
        navigate(returnTo || '/')
    }
}

const routeMap = {
    signUp: route(SignUpView, '/signup?returnTo', true),
    main: route(MainView, '/'),
    game: route(GameView, '/game/:gameId'),
}

const Root: Com = () => {
    return <>
        <Router
            routes={routeMap}
            checkAuth={(url) => {
                if (!client.userId) {
                    return `/signup?returnTo=${encodeURIComponent(url)}`
                }
            }}
        />
        {client.connErr && <ConnErrorOverlay />}
    </>
}

const rootElement = document.getElementById('root')
if (rootElement) {
    $ezh.render(rootElement, Root)
}
