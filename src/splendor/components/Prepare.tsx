import { $ezh, Com, useState, navigate } from 'ezh'
import { CommonError } from 'justrun-ws'
import { client } from '../client'
import { Game, GameInfo } from '../model/Game'
import { Player } from '../model/Player'
import { User } from '../model/User'
import '../assets/scss/prepare.scss'

const PlayerItem: Com<{ user: User, playerId: string }> = ({ user, playerId }) => {
    const player = client.loadModel(Player, { playerId })
    if (!player) return null
    const isCurrentPlayer = playerId === user.playerId
    return (
        <div className='player'>
            <span className='player-name'>{player.name}</span>
            {isCurrentPlayer
                ? <span className='player-tag'>(You)</span>
                : undefined
            }
        </div>
    )
}

export const PrepareView: Com<{ game: Game, gameInfo: GameInfo, user: User }> = ({ game, gameInfo: _gameInfo, user }) => {
    const state = useState({
        playerName: '',
        error: '',
    })

    const handleJoinGame = async () => {
        if (!state.playerName.trim()) {
            state.error = 'Please enter a player name'
            return
        }
        try {
            state.error = ''
            await client.joinGame(game.gameId, state.playerName.trim())
        } catch (error) {
            state.error = error instanceof CommonError ? error.data : 'Failed to join game'
        }
    }

    const handleQuitGame = async () => {
        state.error = ''
        try {
            await client.quitGame(game.gameId)
        } catch (error) {
            state.error = error instanceof CommonError ? error.data : 'Failed to leave game'
        }
    }

    const handleStartGame = async () => {
        state.error = ''
        try {
            await client.startGame(game.gameId)
        } catch (error) {
            state.error = error instanceof CommonError ? error.data : 'Failed to start game'
        }
    }

    return <div className='prepare'>
        <div className='header'>
            <h1 className='header-title'>Game Preparation</h1>
            <button
                className='header-leave-btn'
                onclick={() => navigate('/')}
            >
                Leave Game
            </button>
        </div>

        {/* Game Code */}
        <div className='code'>
            <h2 className='code-title'>Game Code</h2>
            <div className='code-value'>
                {game.gameCode.toString().padStart(6, '0')}
            </div>
            <div className='code-hint'>
                Share this code with other players to join the game
            </div>
        </div>

        {/* Join Game / Start-Quit rows (mutually exclusive) */}
        {user.playerId ? null : <div className='join'>
            <div className='join-row'>
                <input
                    className='join-input'
                    type="text"
                    value={state.playerName}
                    onchange={(e: Event) => {
                        const target = e.target as HTMLInputElement
                        state.playerName = target.value
                    }}
                    placeholder="Enter your player name"
                />
                <button
                    className='join-btn'
                    onclick={handleJoinGame}
                >
                    Join Game
                </button>
            </div>
            {state.error && <div className='join-error'>{state.error}</div>}
        </div>}

        {/* Start / Quit Game */}
        {!user.playerId ? null : <div className='actions'>
            <button
                className='actions-start-btn'
                onclick={handleStartGame}
                disabled={game.players.length !== game.playerCount}
            >
                Start Game
            </button>
            <button
                className='actions-quit-btn'
                onclick={handleQuitGame}
            >
                Quit Game
            </button>
        </div>}

        {/* Player List */}
        <div className='players'>
            <h2 className='players-title'>Players</h2>
            <div className='players-list'>
                {game.players.map((id) => {
                    const playerId = `${game.gameId}#${id}`
                    return <PlayerItem key={playerId} user={user} playerId={playerId} />
                })}
            </div>
        </div>
    </div>
}
