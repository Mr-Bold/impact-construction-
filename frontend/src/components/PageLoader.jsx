export default function PageLoader({ label = 'Loading' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite" aria-label={label}>
      <div className="page-loader__mark">I</div>
      <div className="page-loader__line"><span /></div>
      <p>{label}</p>
    </div>
  )
}
