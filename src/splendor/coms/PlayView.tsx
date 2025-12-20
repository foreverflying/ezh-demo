import { $ezh, Com, navigate, useState } from 'ezh'
import { client } from '../client'
import { Game } from '../models/Game'
import { User } from '../models/User'
import { Card } from '../models/Card'
import { Noble } from '../models/Noble'
import { Player } from '../models/Player'
import { GemType } from '../models/common'
import './PlayView.scss'

type GameState = {
    selectedPlayer: number
    userPlayerId?: string
    takingGems?: number[]
    takingCard?: {
        cardId: string
        gems: number[]
    }
}

const validateTakingGems = (gameGems: number[], playerGems: number[], taking: number[]): number => {
    if (taking.length > 3) {
        return -1
    }
    const total = playerGems.reduce((sum, count) => sum + count, 0)
    if (total + taking.length > 10) {
        return -1
    }
    const [first, second, third] = taking
    if (third) {
        if (first === second) {
            return -1
        }
        if (first === third || second === third) {
            // TODO: additional check in extension version
            return -1
        }
        return 1
    }
    if (second) {
        if (first === second) {
            return gameGems[second] < 4 ? -1 : 1
        }
    }
    return 0
}

const CardView: Com<{ cardId: string, onclick?: (id: string) => void }> = ({ cardId, onclick }) => {
    const card = client.loadModel(Card, { id: cardId })
    if (!card) {
        return null
    }
    const operateCls = onclick ? ' operate' : ''
    const handler = !onclick ? undefined : () => onclick!(cardId)
    return <div className={`card card-${GemType[card.bonus]}${operateCls}`} onclick={handler}>
        <div className='card-left'>
            {card.score > 0 ? <div className='card-score'>{card.score}</div> : null}
        </div>
        <div className='card-right'>
            <div className='card-costs'>
                {card.cost.map((count, idx) => !count ? null : (
                    <GemSmall key={idx} colorIdx={idx + 1} count={count} />
                ))}
            </div>
        </div>
    </div>
}

const CardRow: Com<{ cards: string[], onClickCard?: (id: string) => void }> = ({ cards, onClickCard }) => {
    return <div className='card-row'>
        {cards.map((id) => (
            <CardView key={id} cardId={id} onclick={onClickCard} />
        ))}
    </div>
}

const GemBig: Com<{ colorIdx: number, count?: number, onclick?: (idx: number) => void }> = (
    { colorIdx, count, onclick },
) => {
    const operateCls = onclick && count ? ' operate' : ''
    return <div
        className={`gem gem-big gem-${GemType[colorIdx]}${!count ? ' empty' : ''}${operateCls}`}
        onclick={!operateCls ? undefined : () => onclick!(colorIdx)}
    >
        {!count ? null : <div className='gem-count'>{count}</div>}
    </div>
}

const GemSmall: Com<{ colorIdx: number, count?: number, onclick?: (idx: number) => void }> = (
    { colorIdx, count, onclick },
) => {
    return <div
        className={`gem gem-small gem-${GemType[colorIdx]} ${!count ? 'empty' : ''}`}
        onclick={onclick ? () => onclick!(colorIdx) : undefined}
    >
        {count ?? ''}
    </div>
}

const Bonus: Com<{ colorIdx: number, count?: number }> = ({ colorIdx, count }) => {
    return <div className={`bonus bonus-${GemType[colorIdx]} ${!count ? 'empty' : ''}`}>
        {count && count > 0 ? count : ''}
    </div>
}

const GemRow: Com<{ gems: number[], noOpOnGold?: true, onClickGem?: (idx: number) => void }> = (
    { gems, noOpOnGold, onClickGem },
) => {
    return <div className='gem-row'>
        {gems.map((count, idx) => (
            <GemBig key={idx} colorIdx={idx} count={count} onclick={noOpOnGold && !idx ? undefined : onClickGem} />
        ))}
    </div>
}

const GameInfo: Com<{ game: Game, currPlayer: Player }> = ({ game, currPlayer }) => {
    return <div className='game-info'>
        <div>
            <button className='leave-btn' onclick={() => navigate('/')}>Leave Game</button>
        </div>
        <div className='code-value'>{game.gameCode.toString()}</div>
        <div className='round-label'>
            Round
            <span className='round-value'>{game.round}</span>
        </div>
        <div className='player-name'>{currPlayer.name}</div>
    </div>
}

const NobleRow: Com<{ nobles: string[] }> = ({ nobles }) => {
    return <div className='noble-row'>
        {nobles.map((id) => {
            const noble = client.loadModel(Noble, { id })
            return !noble ? null : (
                <div key={id} className='noble'>
                    <div className='noble-score'>{noble.score}</div>
                    <div className='noble-criteria'>
                        {noble.criteria.map((count, idx) => !count ? null : (
                            <div key={idx} className={`criteria criteria-${GemType[idx + 1]}`}>
                                {count}
                            </div>
                        ))}
                    </div>
                </div>
            )
        })}
    </div>
}

const PlayerTab: Com<{ game: Game, players: Player[], state: GameState }> = ({ game, players, state }) => {
    useState({ lastCurrent: game.current }, (ver, innerState) => {
        if (ver && game.current !== innerState.lastCurrent) {
            state.selectedPlayer = innerState.lastCurrent = game.current
        }
    })
    return <div className='player-tabs'>
        {players.map((player, idx) => {
            const className = 'player-tab'
                + `${state.selectedPlayer === idx ? ' active' : ''}`
                + `${player.playerId === state.userPlayerId ? ' self' : ''}`
            return (
                <div
                    key={idx}
                    className={className}
                    onclick={() => state.selectedPlayer = idx}
                >
                    {player.name}
                </div>
            )
        })}
    </div>
}

const PlayerNoble: Com<{ nobleId?: string }> = ({ nobleId }) => {
    if (nobleId) {
        const noble = client.loadModel(Noble, { id: nobleId })
        if (noble) {
            return <div className='slot noble-slot'>
                <div className='noble-score'>{noble.score}</div>
            </div>
        }
    }
    return <div className='slot noble-slot'>
        <span className='slot-empty'></span>
    </div>
}

const PlayerBonusSet: Com<{ bonuses: number[] }> = ({ bonuses }) => {
    return <div className='player-row'>
        {[1, 2, 3, 4, 5].map((colorIdx) => (
            <Bonus key={colorIdx} colorIdx={colorIdx} count={bonuses[colorIdx]} />
        ))}
    </div>
}

const PlayerGemSet: Com<{ gems: number[] }> = ({ gems }) => {
    return <div className='player-row'>
        {[0, 1, 2, 3, 4, 5].map((colorIdx) => (
            <GemSmall key={colorIdx} colorIdx={colorIdx} count={gems[colorIdx]} />
        ))}
    </div>
}

const PlayerReservedCard: Com<{ cardId: string }> = ({ cardId }) => {
    return <div className='player-right'>
        {() => {
            const card = client.loadModel(Card, { id: cardId })
            return !card ? null : (
                <div className='reserved-card'>
                    <div className='reserved-score'>{card.score || ''}</div>
                    <div className='reserved-costs'>
                        {card.cost.map((count, costIdx) => !count ? null : (
                            <div key={costIdx} className={`cost-item cost-${GemType[costIdx + 1]}`}>
                                {count}
                            </div>
                        ))}
                    </div>
                </div>
            )
        }}
    </div>
}

const PlayersPanel: Com<{ game: Game, state: GameState }> = ({ game, state }) => {
    const players: Player[] = []
    for (const playerId of game.players) {
        const player = client.loadModel(Player, { playerId })
        if (player) {
            players.push(player)
        } else {
            return
        }
    }
    const player = players[state.selectedPlayer]
    return <div className='players-panel'>
        <PlayerTab game={game} players={players} state={state} />
        <div className='player-detail'>
            <div className='player-left'>
                <div className='player-row'>
                    <PlayerNoble nobleId={player.noble} />
                    <PlayerBonusSet bonuses={player.bonuses} />
                </div>
                <div className='player-row'>
                    <PlayerGemSet gems={player.gems} />
                </div>
                <div className='player-row'>
                    <div className='row-empty'></div>
                </div>
            </div>
            <div className='player-center'>
                {player.reserved.map((cardId, idx) => {
                    return <div key={idx} className='player-row'>
                        <PlayerReservedCard cardId={cardId} />
                    </div>
                })}
            </div>
        </div>
    </div>
}

const TakingGemsOverlay: Com<{ game: Game, gameState: GameState, player: Player }> = (
    { game, gameState, player },
) => {
    const takingGems = gameState.takingGems!
    const takingState = useState(
        {
            gems: game.gems,
        },
        (ver, state) => {
            if (ver === 1) {
                state.gems = game.gems
                for (const gemIdx of takingGems) {
                    state.gems[gemIdx]--
                }
            }
        },
    )

    const shouldDisableTake = validateTakingGems(game.gems, player.gems, takingGems) !== 1
    const onPickGem = (idx: number) => {
        if (validateTakingGems(game.gems, player.gems, [...takingGems, idx]) < 0) {
            return
        }
        takingGems.push(idx)
        takingState.gems[idx]--
    }
    const onTakeGem = async () => {
        if (await client.takeGems(game.gameId, takingGems)) {
            gameState.takingGems = undefined
        }
    }

    return <div className='taking-gems'>
        <div className='current-gems'>
            <GemRow gems={takingState.gems} noOpOnGold={true} onClickGem={onPickGem} />
        </div>
        <div className='gems-and-actions'>
            <div className='gem-slots'>
                {[0, 1, 2].map((idx) => {
                    const onPutBackGem = (gemIdx: number) => {
                        takingGems.splice(idx, 1)
                        takingState.gems[gemIdx]++
                    }
                    const gem = takingGems[idx]
                    return gem ? (
                        <GemBig key={idx} colorIdx={gem} count={1} onclick={onPutBackGem} />
                    ) : (
                        <div key={idx} className='gem-slot empty'></div>
                    )
                })}
            </div>
            <div className='taking-actions'>
                <button className='take-btn' disabled={shouldDisableTake} onclick={onTakeGem}>
                    Take
                </button>
                <button className='cancel-btn' onclick={() => {
                    gameState.takingGems = undefined
                }}>Cancel</button>
            </div>
        </div>
    </div>
}

const BuyCardCostLine: Com<{ cost: number, count: number }> = ({ cost, count }) => {
    return <div className='buy-card-cost-line'>
        <div className='operator'>−</div>
        <Bonus colorIdx={cost} count={count} />
        <div className='operator'>=</div>
        <GemSmall colorIdx={cost} count={count} />
        <div className='operator'>:</div>
        <div className='slot-group'>
            <div className='slot-box empty'></div>
            <div className='slot-box empty'></div>
        </div>
    </div>
}

const BuyCardInfo: Com<{ cardId: string, selectedPlayer: Player }> = ({ cardId, selectedPlayer }) => {
    const card = client.loadModel(Card, { id: cardId })
    return !card ? null : <div className='buy-info'>
        <div className='buy-info-lines'>
            {card.cost.map((count, idx) => !count ? null : (
                <BuyCardCostLine key={idx} cost={idx + 1} count={selectedPlayer.bonuses[idx + 1]} />
            ))}
        </div>
    </div>
}

const TakingCardOverlay: Com<{ game: Game, gameState: GameState, player: Player }> = (
    { game, gameState, player },
) => {
    const takingCard = gameState.takingCard!
    const selectedPlayerGems = player.gems

    return <div className='taking-card'>
        <div className='overlay-top-gems'>
            <GemRow gems={game.gems} />
        </div>
        <div className='overlay-card-area'>
            <div className='card-display'>
                <CardView cardId={takingCard.cardId} />
            </div>
            <div className='buy-info'>
                <BuyCardInfo cardId={takingCard.cardId} selectedPlayer={player} />
            </div>
        </div>
        <div className='overlay-bottom-gems'>
            <GemRow gems={selectedPlayerGems} />
        </div>
        <div className='taking-actions'>
            <button
                className='take-btn'
                onclick={async () => {
                    if (await client.buyCard(game.gameId, takingCard.cardId, takingCard.gems)) {
                        gameState.takingCard = undefined
                    }
                }}
            >
                Take
            </button>
            <button className='cancel-btn' onclick={() => {
                gameState.takingCard = undefined
            }}>Cancel</button>
        </div>
    </div>
}

export const PlayView: Com<{ game: Game, user: User }> = ({ game, user }) => {
    const currPlayer = client.loadModel(Player, { playerId: game.players[game.current] })
    if (!currPlayer) {
        return null
    }
    const { cards, gems, nobles } = game
    const state = useState<GameState>({
        userPlayerId: user.playerId,
        selectedPlayer: game.current,
        takingGems: undefined,
        takingCard: undefined,
    })

    const selectedPlayer = client.loadModel(Player, { playerId: game.players[state.selectedPlayer] })
    if (!selectedPlayer) {
        return null
    }

    let onClickGem: ((idx: number) => void) | undefined = undefined
    let onClickCard: ((cardId: string) => void) | undefined = undefined
    const isOperating = game.players[game.current] === user.playerId
    if (isOperating && !state.takingGems && !state.takingCard) {
        onClickGem = (idx: number) => {
            state.takingGems = [idx]
        }
        onClickCard = (cardId: string) => {
            state.takingCard = { cardId, gems: [0, 0, 0, 0, 0, 0] }
        }
    }

    return <div className='page'>
        <div className='play'>
            {/* Top panel groups nobles/gems on the left and controls on the right */}
            <div className='top-panel'>
                <div className='left-section'>
                    <div className='nobles'>
                        <NobleRow nobles={nobles} />
                    </div>
                    <div className='gems'>
                        <GemRow gems={gems} noOpOnGold={true} onClickGem={onClickGem} />
                        {state.takingGems && <TakingGemsOverlay game={game} gameState={state} player={currPlayer} />}
                        {state.takingCard && <TakingCardOverlay game={game} gameState={state} player={currPlayer} />}
                    </div>
                </div>
                <div className='right-section'>
                    <GameInfo game={game} currPlayer={currPlayer} />
                </div>
            </div>

            {/* Cards Section */}
            <div className='cards'>
                <CardRow cards={cards.slice(0, 4)} onClickCard={onClickCard} />
                <CardRow cards={cards.slice(4, 8)} onClickCard={onClickCard} />
                <CardRow cards={cards.slice(8, 12)} onClickCard={onClickCard} />
            </div>

            {/* Players Section */}
            <div className='players'>
                <PlayersPanel game={game} state={state} />
            </div>
        </div>
    </div>
}
