import { $ezh, Com } from 'ezh'
import { NetErrorString } from 'justrun-ws'
import { client } from '../client'
import './ConnErrorOverlay.scss'

export const ConnErrorOverlay: Com = () => {
    const handleRetry = (forceKick: boolean) => {
        client.resetConnState(forceKick)
        client.connectNow()
    }

    const { connErr } = client
    return <div className='conn-error-overlay'>
        <div className='conn-error-content'>
            <div className='error-title'>Connection Error</div>
            <div className='error-message'>{connErr}</div>
            <div className='retry-prompt'>
                Wanna <span className='retry-link' onclick={() => handleRetry(false)}>retry</span>?
            </div>
            {connErr === NetErrorString.HitSessionLimit && <div className='retry-prompt'>
                Or <span className='retry-link' onclick={() => handleRetry(true)}>force kick</span> the previous one?
            </div>}
        </div>
    </div>
}
