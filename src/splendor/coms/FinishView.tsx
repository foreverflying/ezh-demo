import { $ezh, Com, navigate } from 'ezh'
import { client } from '../client'
import { Game } from '../models/Game'
import { User } from '../models/User'
import { Player } from '../models/Player'
import './FinishView.scss'

export const FinishView: Com<{ game: Game, user: User }> = ({ game, user }) => {
    const players: Player[] = []
    for (const playerId of game.players) {
        const player = client.loadModel(Player, { playerId })
        if (player) {
            players.push(player)
        } else {
            return
        }
    }

    // Sort players by score (descending)
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
    const userPlayer = players.find(p => p.playerId === user.userId)
    const userRank = sortedPlayers.findIndex(p => p.playerId === user.userId) + 1

    return <div id='finish'>
        <div className='finish-container'>
            <div className='finish-header'>
                <h1 className='finish-title'>Game Over</h1>
            </div>

            <div className='finish-winner'>
                {sortedPlayers[0].playerId === user.userId ? (
                    <div className='winner-badge'>🎉 You Win! 🎉</div>
                ) : null}
                <div className='winner-info'>
                    <div className='winner-name'>{sortedPlayers[0].name}</div>
                    <div className='winner-score'>{sortedPlayers[0].score} points</div>
                </div>
            </div>

            <div className='ranking'>
                <h2 className='ranking-title'>Final Ranking</h2>
                <div className='ranking-list'>
                    {sortedPlayers.map((player, idx) => (
                        <div
                            key={player.playerId}
                            className={`ranking-item ${player.playerId === user.userId ? 'self' : ''} ${idx === 0 ? 'first' : ''}`}
                        >
                            <div className='rank-number'>#{idx + 1}</div>
                            <div className='rank-name'>{player.name}</div>
                            <div className='rank-score'>{player.score}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className='finish-actions'>
                <button className='back-btn' onclick={() => navigate('/')}>Back to Home</button>
            </div>
        </div>
    </div>
}
