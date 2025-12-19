import { $ezh, Com, useState, navigate } from 'ezh'
import { CommonError } from 'justrun-ws'
import { client } from '../client'
import { Game, GameInfo } from '../models/Game'
import { Player } from '../models/Player'
import { User } from '../models/User'
import './PrepareView.scss'

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
            if (await client.joinGame(game.gameId, state.playerName.trim())) {
                state.error = ''
                state.playerName = ''
            }
        } catch (error) {
            state.error = error instanceof CommonError ? error.data : 'Failed to join game'
        }
    }

    const handleQuitGame = async () => {
        try {
            if (await client.quitGame(game.gameId)) {
                state.error = ''
            }
        } catch (error) {
            state.error = error instanceof CommonError ? error.data : 'Failed to leave game'
        }
    }

    const handleStartGame = async () => {
        try {
            if (await client.startGame(game.gameId)) {
                state.error = ''
            }
        } catch (error) {
            state.error = error instanceof CommonError ? error.data : 'Failed to start game'
        }
    }

    return <div className='prepare'>
        <div className='header'>
            <h1 className='header-title'>Game Preparation</h1>
        </div>

        {/* Game Code */}
        <div className='code'>
            <div className='code-row'>
                <div className='code-value'>
                    {game.gameCode.toString()}
                </div>
                <button
                    className='code-leave-btn'
                    onclick={() => navigate('/')}
                >
                    Leave Game
                </button>
            </div>
            <div className='code-hint'>
                Share this code with other players to join the game
            </div>
        </div>

        {/* Player List with join/start/quit controls at the bottom */}
        <div className='players'>
            <h2 className='players-title'>Players ({game.playerCount} required to Start)</h2>
            <div className='players-list'>
                {game.players.map((playerId) => {
                    return <PlayerItem key={playerId} user={user} playerId={playerId} />
                })}
            </div>

            {state.error && <div className='join-error'>{state.error}</div>}
            <div className='players-bottom'>
                {user.playerId ? (
                    <>
                        <button
                            className='start-btn'
                            onclick={handleStartGame}
                            disabled={game.players.length !== game.playerCount}
                        >
                            Start Game
                        </button>
                        <button
                            className='quit-btn'
                            onclick={handleQuitGame}
                        >
                            Quit Game
                        </button>
                    </>
                ) : (
                    <div className='join-row'>
                        <input
                            className='join-input'
                            type="text"
                            placeholder="Player Name"
                            value={state.playerName}
                            onfocus={() => {
                                state.error = ''
                            }}
                            onchange={(e: Event) => {
                                const target = e.target as HTMLInputElement
                                state.playerName = target.value
                            }}
                        />
                        <button
                            className='join-btn'
                            onclick={handleJoinGame}
                        >
                            Join Game
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
}
