import { useState } from 'react'
import { ANNOUNCEMENT } from '@/config/site'
import { readStorage, writeStorage } from '@/lib/storage'
import { Icon } from '../common/Icon'

const DISMISS_KEY = 'mp-announcement-dismissed'

function TickerGroup({ isDuplicate = false }: { readonly isDuplicate?: boolean }) {
  return (
    <div className="ticker-group" aria-hidden={isDuplicate || undefined}>
      {ANNOUNCEMENT.usps.map((usp) => (
        <span key={usp} className="ticker-entry">
          <span className="ticker-item">
            <Icon name="check" size={14} strokeWidth={3} />
            {usp}
          </span>
          <span className="ticker-separator" aria-hidden="true">
            |
          </span>
        </span>
      ))}
    </div>
  )
}

export function AnnouncementBar() {
  const [isDismissed, setIsDismissed] = useState(() => readStorage('session', DISMISS_KEY) === '1')
  if (isDismissed) return null

  const dismiss = (): void => {
    writeStorage('session', DISMISS_KEY, '1')
    setIsDismissed(true)
  }

  return (
    <div className="announcement-bar" role="region" aria-label="Aankondiging">
      <div className="container">
        <div className="announcement-bar__inner">
          <div className="announcement-bar__ticker">
            {/* Twee kopieën voor een naadloze lus; de tweede is verborgen voor schermlezers. */}
            <div className="ticker-track">
              <TickerGroup />
              <TickerGroup isDuplicate />
            </div>
          </div>

          <div className="announcement-bar__cta">
            <Icon name="mail" size={15} />
            {ANNOUNCEMENT.cta}
          </div>

          {ANNOUNCEMENT.isDismissible && (
            <button type="button" className="announcement-bar__close" aria-label="Sluit aankondiging" onClick={dismiss}>
              <Icon name="close" size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
