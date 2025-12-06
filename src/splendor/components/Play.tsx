import { $ezh, Com, useState, bindData, navigate } from 'ezh'
import { client } from '../client'
import { Game, GameInfo } from '../model/Game'
import { Player } from '../model/Player'
import { User } from '../model/User'
import { CommonError } from 'justrun-ws'
import '../assets/scss/play.scss'

export const PlayView: Com<{ game: Game, user: User }> = ({ game: _game, user: _user }) => {
    return null
}
