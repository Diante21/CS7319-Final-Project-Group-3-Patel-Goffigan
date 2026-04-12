import { Check } from 'lucide-react'
import { PERSIST_STATUS } from '../../utils/constants.jsx'

/**
 * SavedBadge — keys off persistStatus from usePipeline.
 *
 * persistStatus transitions:
 *   idle     → badge hidden
 *   pending  → badge shows immediately (optimistic)
 *   confirmed → badge stays
 *   failed   → badge silently fades out (silent revert)
 */
export default function SavedBadge({ persistStatus }) {
  const visible =
    persistStatus === PERSIST_STATUS.PENDING ||
    persistStatus === PERSIST_STATUS.CONFIRMED

  return (
    <div
      className={`saved-badge saved-badge--${visible ? 'visible' : 'hidden'}`}
      aria-live="polite"
      aria-label={visible ? 'Saved to history' : ''}
    >
      <Check size={12} strokeWidth={2.5} aria-hidden="true" />
      Saved to history
    </div>
  )
}
