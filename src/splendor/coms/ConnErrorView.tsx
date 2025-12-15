import { $ezh, Com, navigate } from 'ezh'
import { client } from '../client'

export const ConnErrorView: Com<{ returnTo?: string }> = ({ returnTo }) => {
    returnTo ||= '/'
    return <div>
        <p>Error: {client.connErr}</p>
        <p>
            <input
                type='button'
                value='Retry'
                onclick={() => {
                    client.resetConnState(false)
                    navigate(returnTo)
                }}
            />
            &nbsp;
            <input
                type='button'
                value='Force Kick'
                onclick={() => {
                    client.resetConnState(true)
                    navigate(returnTo)
                }}
            />
        </p>
    </div>
}
