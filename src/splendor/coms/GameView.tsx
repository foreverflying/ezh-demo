import { $ezh, Com, navigate, Effect } from 'ezh'
import { client } from '../client'
import { nopFunc } from '../common/utils'
import { Game, GameInfo } from '../models/Game'
import { User } from '../models/User'
import { PrepareView } from './PrepareView'
import { PlayView } from './PlayView'
import { FinishView } from './FinishView'

export const GameView: Com<{ gameId: string }> = ({ gameId }) => {
    const { userId } = client
    const user = client.loadModel(User, { userId })
    if (!user) {
        return
    }
    if (user.gameId && user.gameId !== gameId) {
        navigate('/')
        return
    }
    const game = client.loadModel(Game, { gameId })
    if (!game) {
        return
    }
    if (!user.gameId) {
        return <Effect on={() => {
            client.visitGame(game.gameCode).catch(nopFunc)
        }} />
    }
    const gameInfo = client.loadModel(GameInfo, { gameCode: game.gameCode })
    if (!gameInfo) {
        return
    }
    return game.winner ? (
        <FinishView game={game} user={user} />
    ) : game.round ? (
        <PlayView game={game} user={user} />
    ) : (
        <PrepareView game={game} gameInfo={gameInfo} user={user} />
    )
}
