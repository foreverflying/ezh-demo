import { $ezh, Com } from 'ezh'
import { client } from '../client'
import { Game } from '../model/Game'
import { User } from '../model/User'
import { Card } from '../model/Card'
import { Noble } from '../model/Noble'
import { CardCategory, GemType } from '../model/common'
import '../assets/scss/play.scss'

const GemTypeNames = ['Gold', 'Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Onyx']

const CardsList: Com<{ cards: string[] }> = ({ cards }) => {
    return <div className='card-group'>
        <div className='card-list'>
            {cards.map((id) => {
                const card = client.loadModel(Card, { id })
                return card ? (
                    <div key={id} className='card'>
                        <div className='card-cost'>{card.cost.join(', ')}</div>
                        <div className='card-score'>{card.score}</div>
                        <div className='card-deduct'>{GemTypeNames[card.deduct]}</div>
                    </div>
                ) : null
            })}
        </div>
    </div>
}

const GemsList: Com<{ gems: number[] }> = ({ gems }) => {
    return <div className='gems-list'>
        {gems.map((count, index) => (
            <div key={index} className='gem'>
                <div className='gem-name'>{GemTypeNames[index]}</div>
                <div className='gem-count'>{count}</div>
            </div>
        ))}
    </div>
}

const NoblesList: Com<{ nobles: string[] }> = ({ nobles }) => {
    return <div className='nobles-list'>
        {nobles.map((id) => {
            const noble = client.loadModel(Noble, { id })
            return noble ? (
                <div key={id} className='noble'>
                    <div className='noble-score'>{noble.score}</div>
                    <div className='noble-criteria'>{noble.criteria.join(', ')}</div>
                </div>
            ) : null
        })}
    </div>
}

export const PlayView: Com<{ game: Game, user: User }> = ({ game, user: _user }) => {
    const { cards, gems, nobles } = game
    return <div className='play'>
        {/* Cards Section */}
        <div className='cards'>
            <CardsList cards={cards.slice(0, 4)} />
            <CardsList cards={cards.slice(4, 8)} />
            <CardsList cards={cards.slice(8, 12)} />
        </div>

        {/* Gems Section */}
        <div className='gems'>
            <GemsList gems={gems} />
        </div>

        {/* Nobles Section */}
        <div className='nobles'>
            <NoblesList nobles={nobles} />
        </div>
    </div>
}
