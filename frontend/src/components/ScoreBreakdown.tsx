export function ScoreBreakdown({ dimensions }: { dimensions: Record<string, number> }) {
  return (
    <div className="score-list">
      {Object.entries(dimensions).map(([label, value]) => (
        <div className="score-item" key={label}>
          <div>
            <span>{label}</span>
            <strong>{value.toFixed(1)}</strong>
          </div>
          <meter min="0" max="100" value={value} aria-label={`${label} score`} />
        </div>
      ))}
    </div>
  )
}
