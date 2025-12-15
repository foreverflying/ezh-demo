import { $ezh, Com } from 'ezh'
import { client } from '../client'
import { Game } from '../models/Game'
import { User } from '../models/User'
import { Card } from '../models/Card'
import { Noble } from '../models/Noble'
import { CardCategory, GemType } from '../models/common'
import './PlayView.scss'

// Use enum names from GemType for class suffixes (e.g. Gold, Black, White...)

const CardsList: Com<{ cards: string[] }> = ({ cards }) => {
    return <div className='card-group'>
        <div className='card-list'>
            {cards.map((id) => {
                const card = client.loadModel(Card, { id })
                return !card ? null : (
                    <div key={id} className={`card card-deduct-${GemType[card.deduct]}`}>
                        <div className='card-top'>
                            {card.score > 0 ? <div className='card-score'>{card.score}</div> : null}
                        </div>
                        <div className='card-bottom'>
                            <div className='card-costs'>
                                {card.cost.map((count, index) => !count ? null : (
                                    <div key={index} className={`cost-gem cost-gem-${GemType[index + 1]}`}>
                                        {count}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
}

const GemsList: Com<{ gems: number[] }> = ({ gems }) => {
    return <div className='gems-list'>
        {gems.map((count, index) => (
            <div key={index} className={`gem gem-circle gem-circle-${GemType[index]}`}>
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
                    <div className='noble-criteria'>
                        {noble.criteria.map((count, index) => !count ? null : (
                            <div key={index} className={`criteria-square criteria-square-${GemType[index + 1]}`}>
                                {count}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null
        })}
    </div>
}

export const PlayView: Com<{ game: Game, user: User }> = ({ game, user: _user }) => {
    const { cards, gems, nobles } = game
    return <div className='play'>
        {/* Nobles Section (moved to top) */}
        <div className='nobles'>
            <NoblesList nobles={nobles} />
        </div>

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
    </div>
}
