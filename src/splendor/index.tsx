import 'ezh/debug-check'
import { $ezh, Com, configGC, route, Router } from 'ezh'
import { ConnErrorView } from './coms/ConnErrorView'
import { MainView } from './coms/MainView'
import { GameView } from './coms/GameView'
import { client } from './client'

configGC(10, 2000)

const routeMap = {
    connErr: route(ConnErrorView, '/conn-err?returnTo', true),
    main: route(MainView, '/', true),
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

// Added comment

// Added comment

// Added comment
