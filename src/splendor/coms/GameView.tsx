import { $ezh, Com, useState, navigate } from 'ezh'
import { client } from '../client'
import { nopFunc } from '../common/utils'
import { Game, GameInfo } from '../models/Game'
import { User } from '../models/User'
import { PrepareView } from './PrepareView'
import { PlayView } from './PlayView'

export const GameView: Com<{ gameId: string }> = ({ gameId }) => {
    const { userId } = client
    if (!userId) {
        client.SignUpAnonymously().catch(nopFunc)
        return
    }
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
    useState({}, (ver) => {
        if (ver === 1) {
            if (!user.gameId) {
                client.visitGame(game.gameCode).catch(nopFunc)
            }
        }
    })
    const gameInfo = client.loadModel(GameInfo, { gameCode: game.gameCode })
    if (!gameInfo) {
        return
    }
    if (!game.round) {
        return <PrepareView game={game} gameInfo={gameInfo} user={user} />
    } else {
        return <PlayView game={game} user={user} />
    }
}
