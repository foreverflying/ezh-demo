import { $ezh, Com, navigate, resetOnRemount, useState, watchMount } from 'ezh'
import { client, loading } from '../client'
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
    takingGem?: number
    takingCard?: string
}

type PayGem = {
    colorIdx: number
    count: number
}

type PayGemPlan = {
    gemIdx: number
    cost: number
    bonus: number
    needed: number
    gems?: PayGem[]
}

type TakingCardState = {
    cardId: string
    playerGems: number[]
    gameGems: number[]
    fillingPos: number
    plans: PayGemPlan[]
}

const validateTakingGems = (gameGems: number[], taking: number[]): number => {
    if (taking.length > 3) {
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
    const card = client.loadModel(Card, { id: cardId }, true)
    if (!card) {
        return null
    }
    if (card === loading) {
        return <div className='card card-loading'></div>
    }
    const operateCls = onclick ? ' operate' : ''
    const handler = !onclick ? undefined : () => onclick!(cardId)
    return <div className={`card card-${GemType[card.bonus]}${operateCls}`} onclick={handler}>
        <div className='card-left'>
            {card.score > 0 ? <div className='card-score'>{card.score}</div> : null}
        </div>
        <div className='card-right'>
            <div className='card-costs'>
                {card.costs.map((count, idx) => !count ? null : (
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
            <button className='leave-btn' onclick={() => navigate('/')}>Leave</button>
        </div>
        <div className='code-value'>{game.gameCode.toString()}</div>
        <div className='round-label'>
            Round
            <span className='round-value'>{game.round}</span>
        </div>
        <div className='player-name'>{currPlayer.name}</div>
    </div>
}

const NobleRow: Com<{ nobles: string[], claimedNobles: string[] }> = ({ nobles, claimedNobles }) => {
    return <div className='noble-row'>
        {nobles.map((id) => {
            const claimed = claimedNobles.includes(id) ? ' claimed' : ''
            const noble = client.loadModel(Noble, { id })
            return !noble ? null : (
                <div key={id} className={`noble${claimed}`}>
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
                    {player.playerId === game.players[game.current] ? '\u2605' : ''}
                    {player.name}: {player.score}
                </div>
            )
        })}
    </div>
}

const PlayerNoble: Com<{ nobles: string[] }> = ({ nobles }) => {
    let score = 0
    for (const nobleId of nobles) {
        const noble = client.loadModel(Noble, { id: nobleId })
        if (noble) {
            score += noble.score
        }
    }
    return score ? (
        <div className='player-noble'>{score}</div>
    ) : (
        <div className='player-noble empty' />
    )
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

const PlayerReservedCard: Com<{ cardId: string, onClickCard?: (cardId: string) => void }> = (
    { cardId, onClickCard },
) => {
    return (() => {
        const card = client.loadModel(Card, { id: cardId })
        return !card ? null : (
            <div
                className={`reserved-card card-${GemType[card.bonus]}${onClickCard ? ' operate' : ''}`}
                onclick={onClickCard ? () => onClickCard(cardId) : undefined}
            >
                <div className='reserved-score'>{card.score || ''}</div>
                <div className='reserved-cost'>
                    {card.costs.map((count, costIdx) => !count ? null : (
                        <GemSmall key={costIdx} colorIdx={costIdx + 1} count={count} />
                    ))}
                </div>
            </div>
        )
    })()
}

const PlayersPanel: Com<{ game: Game, state: GameState, onClickCard?: (cardId: string) => void }> = (
    { game, state, onClickCard },
) => {
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
            <div className='player-score'>
                <div className='score-value'>{player.score}</div>
                <div className='score-label'>Score</div>
            </div>
            <div className='player-box player-main'>
                <div className='player-row'>
                    <PlayerNoble nobles={player.nobles} />
                    <PlayerBonusSet bonuses={player.bonuses} />
                </div>
                <div className='player-row'>
                    <PlayerGemSet gems={player.gems} />
                </div>
                <div className='player-row'>
                    <div className='row-empty' />
                </div>
            </div>
            <div className='player-box reserved-cards'>
                {player.reserved.length === 0 ? (
                    <div className='reserved-empty'>
                        <div>Reserved Cards</div>
                        <div>Up to 3</div>
                    </div>
                ) : player.reserved.map((cardId, idx) => (
                    <PlayerReservedCard key={idx} cardId={cardId} onClickCard={onClickCard} />
                ))}
            </div>
        </div>
    </div>
}

const TakingGemsOverlay: Com<{ game: Game, gameState: GameState, player: Player }> = (
    { game, gameState, player },
) => {
    const gemIdx = gameState.takingGem!
    const takingState = useState(
        {
            gameGems: game.gems,
            playerGems: player.gems,
            playerGemCount: player.gems.reduce((sum, count) => sum + count, 0),
            takingGems: [gemIdx],
            returningGems: [] as number[],
        },
        (ver, state, initial) => {
            if (ver === 1) {
                resetOnRemount(ver, state, initial)
                state.gameGems[gemIdx]--
                state.playerGems[gemIdx]++
                state.playerGemCount++
            }
        },
    )

    const { gameGems, playerGems, playerGemCount, takingGems, returningGems } = takingState
    const isFull = validateTakingGems(game.gems, takingGems) === 1
    const overLimit = playerGemCount > 10 ? playerGemCount - 10 : 0
    const canTake = playerGemCount < 10 ? isFull : (playerGemCount === 10 ? true : false)
    const onPickGem = (gemIdx: number) => {
        if (validateTakingGems(game.gems, [...takingGems, gemIdx]) < 0) {
            return
        }
        takingGems.push(gemIdx)
        gameGems[gemIdx]--
        playerGems[gemIdx]++
        takingState.playerGemCount++
    }
    const onTakeGem = async () => {
        if (await client.takeGems(game.gameId, takingGems, returningGems)) {
            gameState.takingGem = undefined
        }
    }
    const onReturnGem = !overLimit ? undefined : (gemIdx: number) => {
        const gemAt = takingGems.indexOf(gemIdx)
        if (gemAt >= 0) {
            takingGems.splice(gemAt, 1)
        } else {
            returningGems.push(gemIdx)
        }
        gameGems[gemIdx]++
        playerGems[gemIdx]--
        takingState.playerGemCount--
    }

    return <div className='taking-gems'>
        <div className='current-gems'>
            <GemRow gems={gameGems} noOpOnGold={true} onClickGem={onPickGem} />
        </div>
        <div className='gem-slots'>
            <div className='gem-taking'>
                {[0, 1, 2].map((idx) => {
                    const gem = takingGems[idx]
                    if (gem) {
                        const onPutBackGem = (gemIdx: number) => {
                            takingGems.splice(idx, 1)
                            gameGems[gemIdx]++
                            playerGems[gemIdx]--
                            takingState.playerGemCount--
                        }
                        return <GemBig key={idx} colorIdx={gem} count={1} onclick={onPutBackGem} />
                    } else if (!isFull) {
                        return <div key={idx} className='gem-slot empty' />
                    } else {
                        return null
                    }
                })}
            </div>
            <div className='gem-returning'>
                {!overLimit ? null : Array.from({ length: overLimit }).map((_, idx) => {
                    return <div key={idx} className='gem-slot empty' />
                })}
                {returningGems.toReversed().map((gem, idx) => {
                    const onPutBackGem = (gemIdx: number) => {
                        returningGems.splice(returningGems.length - gemIdx - 1, 1)
                        gameGems[gem]--
                        playerGems[gem]++
                        takingState.playerGemCount++
                    }
                    return <GemBig key={idx} colorIdx={gem} count={1} onclick={onPutBackGem} />
                })}
            </div>
        </div>
        <div className='player-gems'>
            <GemRow gems={playerGems} onClickGem={onReturnGem} />
        </div>
        <div className='taking-actions'>
            <button className='take-btn' disabled={!canTake} onclick={onTakeGem}>
                Take
            </button>
            <button className='cancel-btn' onclick={() => {
                gameState.takingGem = undefined
            }}>Cancel</button>
        </div>
    </div>
}

const PayGemPlanView: Com<{ state: PayGemPlan, filling: boolean, onClickGem: (gemIdx: number) => void }> = (
    { state, filling, onClickGem },
) => {
    const { cost, bonus, gemIdx, needed, gems } = state
    const pay = cost - bonus
    return <div className='pay-plan'>
        <div className='operator'>&minus;</div>
        <Bonus colorIdx={gemIdx} count={bonus} />
        <div className='operator'>=</div>
        <GemSmall colorIdx={gemIdx} count={pay < 0 ? 0 : pay} />
        <div className='operator'>:</div>
        <div className='slot-group'>
            {needed ? (
                <div className={`slot ${filling ? 'filling' : 'empty'}`} />
            ) : (
                <div className='slot full'>&#x2714;</div>
            )}
            {!gems ? null : gems.map((gem) => (
                <div key={gem.colorIdx}>
                    <GemSmall colorIdx={gem.colorIdx} count={gem.count} onclick={() => onClickGem(gem.colorIdx)} />
                </div>
            ))}
        </div>
    </div>
}

const BuyCardPlanView: Com<{ state: TakingCardState }> = ({ state }) => {
    const { plans, gameGems, playerGems, fillingPos } = state
    return <div className={'buy-card'}>
        <div className='buy-card-plan'>
            {plans.map((plan, pos) => {
                const filling = fillingPos === pos
                const onWithdrawGem = (gemIdx: number) => {
                    const gems = plan.gems!
                    const gem = gems.find((g) => g.colorIdx === gemIdx)!
                    const value = gemIdx === GemType.Gold ? 2 : gemIdx === plan.gemIdx ? 2 : 1
                    plan.needed += value
                    playerGems[gemIdx]++
                    gameGems[gemIdx]--
                    if (!--gem.count) {
                        plan.gems = gems.filter((g) => g !== gem)
                    }
                    if (fillingPos < 0 || fillingPos > pos) {
                        state.fillingPos = pos
                    }
                }
                return <PayGemPlanView key={plan.gemIdx} state={plan} filling={filling} onClickGem={onWithdrawGem} />
            })}
        </div>
    </div>
}

const TakingCardOverlay: Com<{ game: Game, gameState: GameState, player: Player }> = (
    { game, gameState, player },
) => {
    const cardId = gameState.takingCard!
    const card = client.loadModel(Card, { id: cardId })
    if (!card) {
        return null
    }
    const state = useState<TakingCardState>(
        {
            cardId,
            playerGems: player.gems,
            gameGems: game.gems,
            fillingPos: -1,
            plans: [],
        },
        (ver, state, initial) => {
            if (ver === 1) {
                resetOnRemount(ver, state, initial)
                const { plans } = state
                for (let idx = 0; idx < card.costs.length; idx++) {
                    const cost = card.costs[idx]
                    if (cost) {
                        const gemIdx = idx + 1
                        let gems: PayGem[] | undefined = undefined
                        const bonus = player.bonuses[gemIdx]
                        let needed = cost - bonus
                        if (needed < 0) {
                            needed = 0
                        } else if (needed) {
                            let use = state.playerGems[gemIdx]
                            if (use > needed) {
                                use = needed
                            }
                            if (use) {
                                needed -= use
                                gems = [{ colorIdx: gemIdx, count: use }]
                                state.playerGems[gemIdx] -= use
                                state.gameGems[gemIdx] += use
                            }
                        }
                        const pos = plans.push({
                            gemIdx,
                            cost,
                            bonus,
                            needed: needed * 2,
                            gems,
                        })
                        if (state.fillingPos < 0 && needed) {
                            state.fillingPos = pos - 1
                        }
                    }
                }
            }
        },
    )
    const { playerGems, gameGems, plans } = state
    const { reserved } = player
    const canReserve = reserved ? reserved.length < 3 && !reserved.includes(cardId) : true

    const onPayGem = (gemIdx: number) => {
        let { fillingPos } = state
        const plan = plans[fillingPos]
        playerGems[gemIdx]--
        gameGems[gemIdx]++
        let { gems } = plan
        if (!gems) {
            plan.gems = []
            gems = plan.gems
        }
        let gem = gems.find((g) => g.colorIdx === gemIdx)
        if (!gem) {
            gem = { colorIdx: gemIdx, count: 1 }
            if (gems.length === 0) {
                gems.push(gem)
            } else if (gemIdx === GemType.Gold) {
                gems.unshift(gem)
            } else if (gemIdx === plan.gemIdx) {
                if (gems[0].colorIdx === GemType.Gold) {
                    gems.splice(1, 0, gem)
                } else {
                    gems.unshift(gem)
                }
            } else {
                gems.push(gem)
            }
        } else {
            gem.count++
        }
        let value = gemIdx === GemType.Gold ? 2 : gemIdx === plan.gemIdx ? 2 : 1
        plan.needed -= value
        if (plan.needed > 0) {
            return
        }
        if (plan.needed < 0) {
            let i = gems.length
            gem = gems[--i]
            gemIdx = gem.colorIdx
            value = gemIdx === plan.gemIdx ? 2 : 1
            do {
                playerGems[gemIdx]++
                gameGems[gemIdx]--
                plan.needed += value
                if (--gem.count === 0) {
                    gems.pop()
                    gem = gems[--i]
                    gemIdx = gem.colorIdx
                    value = gemIdx === plan.gemIdx ? 2 : 1
                }
            } while (plan.needed < 0)
        }
        while (++fillingPos < plans.length) {
            const nextPlan = plans[fillingPos]
            if (nextPlan.needed > 0) {
                state.fillingPos = fillingPos
                return
            }
        }
        state.fillingPos = -1
    }

    const onBuyCard = async () => {
        const payGems = [] as number[][]
        for (const plan of plans) {
            if (plan.gems) {
                const gems = [] as number[]
                for (const { colorIdx, count } of plan.gems) {
                    for (let i = 0; i < count; i++) {
                        gems.push(colorIdx)
                    }
                }
                payGems.push(gems)
            }
        }
        if (await client.buyCard(game.gameId, cardId, payGems)) {
            gameState.takingCard = undefined
        }
    }

    const onReserveCard = async () => {
        if (await client.reserveCard(game.gameId, cardId)) {
            gameState.takingCard = undefined
        }
    }

    return <div className='taking-card'>
        <div className='game-gems'>
            <GemRow gems={gameGems} />
        </div>
        <div className='overlay-card-area'>
            <div className='card-display'>
                <CardView cardId={cardId} />
            </div>
            <div className='buy-card'>
                <BuyCardPlanView state={state} />
            </div>
        </div>
        <div className='player-gems'>
            <GemRow gems={playerGems} onClickGem={state.fillingPos >= 0 ? onPayGem : undefined} />
        </div>
        <div className='taking-actions'>
            <button className='take-btn' disabled={state.fillingPos >= 0} onclick={onBuyCard} >
                Purchase
            </button>
            <button className='cancel-btn' onclick={() => { gameState.takingCard = undefined }}>
                Cancel
            </button>
            <button className='reserve-btn' disabled={!canReserve} onclick={onReserveCard} >
                Reserve
            </button>
        </div>
    </div>
}

const resize = () => {
    const root = document.querySelector('#root')
    const page = document.querySelector('#page') as HTMLElement
    const play = document.querySelector('#play') as HTMLElement
    if (root && page && play) {
        const scaleWidth = root.clientWidth / play.offsetWidth
        const scaleHeight = root.clientHeight / play.offsetHeight
        page.style.transform = `scale(${scaleWidth < scaleHeight ? scaleWidth : scaleHeight})`
    }
}

const onMounted = () => {
    resize()
    window.addEventListener('resize', resize)
}

const onUnmounted = () => {
    window.removeEventListener('resize', resize)
}

export const PlayView: Com<{ game: Game, user: User }> = ({ game, user }) => {
    const currPlayer = client.loadModel(Player, { playerId: game.players[game.current] })
    if (!currPlayer) {
        return null
    }
    const { cards, gems, nobles, noblesClaimed } = game
    const state = useState<GameState>({
        userPlayerId: user.playerId,
        selectedPlayer: game.current,
        takingGem: undefined,
        takingCard: undefined,
    }, resetOnRemount)

    const selectedPlayer = client.loadModel(Player, { playerId: game.players[state.selectedPlayer] })
    if (!selectedPlayer) {
        return null
    }

    let onClickGem: ((idx: number) => void) | undefined = undefined
    let onClickCard: ((cardId: string) => void) | undefined = undefined
    const isOperating = game.players[game.current] === user.playerId
    if (isOperating && !state.takingGem && !state.takingCard) {
        onClickGem = (gemIdx: number) => {
            state.takingGem = gemIdx
        }
        onClickCard = (cardId: string) => {
            state.takingCard = cardId
        }
    }

    watchMount(onMounted, onUnmounted)
    return <div id='page'>
        <div id='play'>
            {/* Top panel groups nobles/gems on the left and controls on the right */}
            <div className='top-panel'>
                <div className='left-section'>
                    <div className='nobles'>
                        <NobleRow nobles={nobles} claimedNobles={noblesClaimed} />
                    </div>
                    <div className='gems'>
                        <GemRow gems={gems} noOpOnGold={true} onClickGem={onClickGem} />
                        {state.takingGem && <TakingGemsOverlay game={game} gameState={state} player={currPlayer} />}
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
                <PlayersPanel
                    game={game}
                    state={state}
                    onClickCard={selectedPlayer === currPlayer ? onClickCard : undefined}
                />
            </div>
        </div>
    </div>
}
