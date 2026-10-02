type TrackStartedCallback = (trackIndex: number) => void
type ProgressCallback = (trackIndex: number, progressInTrack: number, totalProgress: number) => void
type TrackFinishedCallback = (trackIndex: number) => void

class TrackProgressMonitor {
  trackDurations: number[]
  totalDuration: number
  trackStartedCallback: TrackStartedCallback
  progressCallback: ProgressCallback
  trackFinishedCallback: TrackFinishedCallback
  currentTrackIndex: number
  cummulativeProgress: number
  currentTrackPercentage: number
  numTracks: number
  allTracksFinished: boolean
  declare currentTrackProgress: number

  /**
   * Creates a new TrackProgressMonitor.
   * @param trackDurations The durations of the tracks in seconds.
   * @param trackStartedCallback The callback to call when a track starts.
   * @param progressCallback The callback to call when progress is updated.
   * @param trackFinishedCallback The callback to call when a track finishes.
   */
  constructor(trackDurations: number[], trackStartedCallback: TrackStartedCallback, progressCallback: ProgressCallback, trackFinishedCallback: TrackFinishedCallback) {
    this.trackDurations = trackDurations
    this.totalDuration = trackDurations.reduce((total, duration) => total + duration, 0)
    this.trackStartedCallback = trackStartedCallback
    this.progressCallback = progressCallback
    this.trackFinishedCallback = trackFinishedCallback
    this.currentTrackIndex = -1
    this.cummulativeProgress = 0
    this.currentTrackPercentage = 0
    this.numTracks = this.trackDurations.length
    this.allTracksFinished = false
    this.#moveToNextTrack()
  }

  #outsideCurrentTrack(progress: number): boolean {
    this.currentTrackProgress = progress - this.cummulativeProgress
    return this.currentTrackProgress >= this.currentTrackPercentage
  }

  #moveToNextTrack(): void {
    if (this.currentTrackIndex >= 0) this.#trackFinished()
    this.currentTrackIndex++
    this.cummulativeProgress += this.currentTrackPercentage
    if (this.currentTrackIndex >= this.numTracks) {
      this.allTracksFinished = true
      return
    }
    this.currentTrackPercentage = (this.trackDurations[this.currentTrackIndex] / this.totalDuration) * 100
    this.#trackStarted()
  }

  #trackStarted(): void {
    this.trackStartedCallback(this.currentTrackIndex)
  }

  #progressUpdated(totalProgress: number): void {
    const progressInTrack = (this.currentTrackProgress / this.currentTrackPercentage) * 100
    this.progressCallback(this.currentTrackIndex, progressInTrack, totalProgress)
  }

  #trackFinished(): void {
    this.trackFinishedCallback(this.currentTrackIndex)
  }

  /** Updates the track progress based on the total progress (percent). */
  update(totalProgress: number): void {
    while (this.#outsideCurrentTrack(totalProgress) && !this.allTracksFinished) this.#moveToNextTrack()
    if (!this.allTracksFinished) this.#progressUpdated(totalProgress)
  }

  /** Finish the track progress monitoring, forcing all remaining tracks to finish. */
  finish(): void {
    this.update(101)
  }
}

export = TrackProgressMonitor
