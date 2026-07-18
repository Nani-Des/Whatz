import { useCallback, useEffect, useRef, useState } from 'react'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VideoPlayer({ src, poster, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [dragging, setDragging] = useState(false)

  const syncTime = useCallback(() => {
    const video = videoRef.current
    if (!video || dragging) return
    setCurrent(video.currentTime)
    setDuration(video.duration || 0)
  }, [dragging])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onLoaded = () => {
      setDuration(video.duration || 0)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTimeUpdate = () => syncTime()
    const onDurationChange = () => setDuration(video.duration || 0)

    video.addEventListener('loadedmetadata', onLoaded)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('durationchange', onDurationChange)

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('durationchange', onDurationChange)
    }
  }, [syncTime])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play()
    else video.pause()
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  const changeSpeed = (next: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = next
    setSpeed(next)
  }

  const seek = (value: number) => {
    const video = videoRef.current
    if (!video || !Number.isFinite(value)) return
    video.currentTime = value
    setCurrent(value)
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0

  return (
    <div className="post-video-player">
      <div className="post-video-player__screen">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline
          preload="none"
          className="post-video-player__video"
          title={title}
          onClick={togglePlay}
        />
        {!playing && (
          <button type="button" className="post-video-player__play-overlay" onClick={togglePlay} aria-label="Play video">
            ▶
          </button>
        )}
      </div>

      <div className="post-video-player__controls">
        <button type="button" onClick={togglePlay} className="post-video-player__btn" aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? '❚❚' : '▶'}
        </button>

        <span className="post-video-player__time">{formatTime(current)}</span>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={(e) => seek(Number(e.target.value))}
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => {
            setDragging(false)
            syncTime()
          }}
          className="post-video-player__seek"
          style={{ '--progress': `${progress}%` } as React.CSSProperties}
          aria-label="Seek"
        />

        <span className="post-video-player__time">{formatTime(duration)}</span>

        <select
          value={speed}
          onChange={(e) => changeSpeed(Number(e.target.value))}
          className="post-video-player__speed"
          aria-label="Playback speed"
        >
          {SPEEDS.map((rate) => (
            <option key={rate} value={rate}>
              {rate}x
            </option>
          ))}
        </select>

        <button type="button" onClick={toggleMute} className="post-video-player__btn" aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  )
}
