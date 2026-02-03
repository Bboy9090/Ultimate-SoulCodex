/**
 * Who I Am Component
 * 
 * This is the CRITICAL section that must be unique per user.
 * Uses Render's clean layout with Replit's legendary polish.
 */

interface WhoIAmProps {
  content: string
  className?: string
}

export function WhoIAm({ content, className = '' }: WhoIAmProps) {
  return (
    <section className={`who-i-am-section ${className}`}>
      <div className="section-header">
        <h2 className="section-title">Who I Am</h2>
        <div className="section-accent" />
      </div>
      
      <div className="content-wrapper">
        <p className="archetype-text">{content}</p>
        {/* This should NEVER be the same for two different users */}
      </div>
      
      <div className="section-footer">
        <div className="uniqueness-badge">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1L10.5 5.5L15.5 6.5L12 10L12.5 15L8 12.5L3.5 15L4 10L0.5 6.5L5.5 5.5L8 1Z"
              fill="currentColor"
            />
          </svg>
          <span>Uniquely Generated</span>
        </div>
      </div>
    </section>
  )
}
