/**
 * Sound effects utility.
 * Plays short audio cues for key actions.
 */

const audioCache = {}

function play(name) {
  const src = `/audio/${name}.wav`

  if (!audioCache[name]) {
    audioCache[name] = wx.createInnerAudioContext()
    audioCache[name].src = src
  }

  const ctx = audioCache[name]
  ctx.stop()
  ctx.seek(0)
  ctx.play()
}

module.exports = {
  playCreate() { play('create') },
  playComplete() { play('complete') },
  playReminder() { play('reminder') }
}
