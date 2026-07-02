interface PostAmbientBackgroundProps {
  enabled: boolean
}

export default function PostAmbientBackground({ enabled }: PostAmbientBackgroundProps) {
  if (!enabled) return null

  return (
    <div className="post-anim-ambient" aria-hidden="true">
      <div className="post-anim-ambient__orb post-anim-ambient__orb--1" />
      <div className="post-anim-ambient__orb post-anim-ambient__orb--2" />
      <div className="post-anim-ambient__orb post-anim-ambient__orb--3" />
    </div>
  )
}
