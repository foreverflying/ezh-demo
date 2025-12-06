import 'ezh/debug-check'
import { $ezh, Com, route, Router } from 'ezh'
import { ConnErrorView } from './components/ConnErrorView'
import { MainView } from './components/Main'
import { GameView } from './components/Game'
import { client } from './client'

const routeMap = {
    connErr: route(ConnErrorView, '/conn-err?:returnTo', false),
    main: route(MainView, '/', false),
    game: route(GameView, '/game/:gameId'),
}

const Root: Com = () => {
    return <Router
        routes={routeMap}
        checkAuth={(url) => {
            if (!client.userId) {
                return '/'
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
