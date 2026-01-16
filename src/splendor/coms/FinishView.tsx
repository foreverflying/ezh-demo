import { $ezh, Com, navigate } from 'ezh'
import { client } from '../client'
import { Game } from '../models/Game'
import { User } from '../models/User'
import { GameFinishedCounter } from '../models/statistics'
import { Player } from '../models/Player'
import './FinishView.scss'
import { formatNumber } from '../common/utils'

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
    const sortedPlayers = players.toSorted((a, b) => b.score - a.score)
    const emptyRows = Math.max(0, 4 - sortedPlayers.length)
    const finishedCounter = client.loadModel(GameFinishedCounter, { id: '$' }, { id: '$', finishedCount: 1 })
    return <div id='finish'>
        <div className='finish-hero'>
            <h1 className='title'>Congratulations!</h1>
            <div className='subtitle'>
                <div>You finished the {formatNumber(game.finishedCount ?? 0, 'en-US', true)} game</div>
                <div>out of {formatNumber(finishedCounter?.finishedCount ?? 0, 'en-US')} games worldwide</div>
            </div>
        </div>
        <div className='finish-container'>
            <div className='finish-winner'>
                {sortedPlayers[0].playerId === user.userId ? (
                    <div className='winner-badge'>🎉 You Win! 🎉</div>
                ) : null}
                <div className='winner-info'>
                    <div className='winner-name'>Winner: {sortedPlayers[0].name}</div>
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
                    {Array.from({ length: emptyRows }).map((_, idx) => (
                        <div key={`empty-${idx}`} className='ranking-item ranking-empty' />
                    ))}
                </div>
            </div>

            <div className='finish-actions'>
                <button className='back-btn' onclick={() => navigate('/')}>Back to Home</button>
            </div>
        </div>
    </div>
}
