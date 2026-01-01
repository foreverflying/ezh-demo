import { $ezh, Com, useState, bindData, navigate, Effect } from 'ezh'
import { loading } from 'ezh-model'
import { CommonError } from 'justrun-ws'
import { client } from '../client'
import { nopFunc } from '../common/utils'
import { User } from '../models/User'
import './MainView.scss'

export const MainView: Com = () => {
    const { userId } = client
    if (!userId) {
        return <Effect on={() => {
            client.SignUpAnonymously()
        }} />
    }
    const user = client.loadModel(User, { userId }, true)
    if (user === loading) {
        return
    }
    if (!user) {
        return <Effect on={() => {
            client.resetAuthState()
        }} />
    }
    if (user.gameId) {
        return <Effect on={() => {
            client.leaveGame(user.gameId!).catch(nopFunc)
        }} />
    }
    const state = useState({
        gameCode: '',
        playerCount: '2',
        error: '',
    })
    const handleVisitGame = async () => {
        const { gameCode } = state
        if (state.error) {
            state.error = ''
        }
        try {
            const result = await client.visitGame(gameCode)
            if (result) {
                state.gameCode = ''
                state.playerCount = '2'
                navigate(`/game/${result.gameId}`)
            }
        } catch (err) {
            if (err instanceof CommonError) {
                state.error = err.data
            }
        }
    }

    const handleCreateGame = async () => {
        if (state.error) {
            state.error = ''
        }
        try {
            const result = await client.createGame(parseInt(state.playerCount))
            if (result) {
                navigate(`/game/${result.gameId}`)
            }
        } catch (err) {
            if (err instanceof CommonError) {
                state.error = err.data
            }
        }
    }

    return <div className='main'>
        <h1 className='title'>Splendor</h1>
        <p className='subtitle'>Quick start or join an existing room</p>

        {/* Create Game Section */}
        <div className='panel'>
            <div className='card card-create'>
                <h2>Create New Game</h2>
                <div className='card-row'>
                    <label>Number of Players:</label>
                    <select
                        className='select'
                        value={bindData(state, 'playerCount')}
                    >
                        <option value='2'>2 Players</option>
                        <option value='3'>3 Players</option>
                        <option value='4'>4 Players</option>
                    </select>
                </div>
                <button
                    className='btn btn-create'
                    onclick={handleCreateGame}
                    aria-label='Create game'
                >
                    Create Game
                </button>
            </div>

            {/* Visit Game Section */}
            <div className='card card-join'>
                <h2>Visit a Game</h2>
                <div className='card-row'>
                    <input
                        className='input'
                        type='text'
                        inputMode='numeric'
                        placeholder='Game Code'
                        value={bindData(state, 'gameCode')}
                        onfocus={(e) => {
                            const input = e.target as HTMLInputElement
                            input.value = ''
                            state.error = ''
                        }}
                        oninput={(e) => {
                            const input = e.target as HTMLInputElement
                            input.value = input.value.replace(/\D/g, '').slice(0, 6)
                        }}
                    />
                    <button
                        className='btn btn-visit'
                        onclick={handleVisitGame}
                        aria-label='Visit game'
                    >
                        Visit Game
                    </button>
                </div>
                {state.error ? <div className='error'>
                    {state.error}
                </div> : <label>Please enter 6-digit game code</label>}
            </div>
        </div>
    </div>
}
