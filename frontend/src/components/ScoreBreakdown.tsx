export function ScoreBreakdown({ dimensions }: { dimensions: Record<string, number> }) {
  return (
    <div className="score-list">
      {Object.entries(dimensions).map(([label, value]) => (
        <div className="score-item" key={label}>
          <div>
            <span>{label}</span>
            <strong>{value.toFixed(1)}</strong>
          </div>
          <div
            className="score-track"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            aria-label={`${label} score`}
          >
            <i className="score-track-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
