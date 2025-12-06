import { CommonError } from 'justrun-ws'
import { $ezh, Com, useState, bindData, navigate } from 'ezh'
import { client } from '../client'
import { nopFunc } from '../common/utils'
import { User } from '../model/User'
import '../assets/scss/main.scss'

export const MainView: Com = () => {
    const { userId } = client
    if (!userId) {
        client.SignUpAnonymously().catch(nopFunc)
        return
    }
    const user = client.loadModel(User, { userId })
    if (!user) {
        return
    }
    const state = useState(
        {
            gameCode: '',
            playerCount: '2',
            error: '',
        },
        (ver, state) => {
            if (ver === 1) {
                if (user.gameId) {
                    client.leaveGame(user.gameId).catch(nopFunc)
                }
                state.gameCode = ''
                state.playerCount = '2'
                state.error = ''
            }
        },
    )
    const handleVisitGame = async () => {
        const { gameCode } = state
        if (state.error) {
            state.error = ''
        }
        try {
            const { gameId } = await client.visitGame(parseInt(gameCode))
            navigate(`/game/${gameId}`)
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
            const { gameId } = await client.createGame(parseInt(state.playerCount))
            navigate(`/game/${gameId}`)
        } catch (err) {
            if (err instanceof CommonError) {
                state.error = err.data
            }
        }
    }

    return <div className='main'>
        <h1 className='title'>Splendor</h1>

        {/* Create Game Section */}
        <div className='card'>
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
            >
                Create Game
            </button>
        </div>

        {/* Visit Game Section */}
        <div className='card'>
            <h2>Visit Existing Game</h2>
            <div className='card-row'>
                <input
                    className='input'
                    type='text'
                    value={bindData(state, 'gameCode')}
                    placeholder='Enter 6-digit game code'
                />
                <button
                    className='btn btn-visit'
                    onclick={handleVisitGame}
                >
                    Visit Game
                </button>
            </div>
        </div>

        {state.error ? <div className='error'>
            {state.error}
        </div> : undefined}
    </div>
}
