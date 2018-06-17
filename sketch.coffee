array = undefined

sound = undefined
newSoundfile = undefined

binSize = 12
binSize = Math.pow 2, binSize

keyList = ["rms","spectralFlatness"]
newMicSnippet = false
micSnippet = undefined

backgroundColour = [20,20,20]
offCellColour = [70]
onCellColour = [255]
highlightColour = [168, 0, 0]

meydaAnalyzer = undefined
loadingText = ""
radio = undefined

# load audio files -------------------------------------------------
preload = ->
  # sound = loadSound "assets/E.mp3"
  Snippet.keyList = keyList


# setup audio analizers -------------------------------------------------



gotFile = (file) ->
  if file.type is 'audio'
    unless readyToPlay
      sound = loadSound(file.data, gotAudio ,loading)
  else
    updateLoadingText ('Not an audio file!');
gotAudio = ->
  setUpAudio()
loading = (progress) -> console.log progress




setup = ->

  size = (Math.min windowWidth, windowHeight-150)
  canvas = createCanvas size,size
  background backgroundColour...
  setUpUi(canvas)



  # ellipseMode = CENTER
  # rectMode = CENTER


# main draw loop ----------------------------------------------------------

samples = undefined
sample = undefined
isPlaying = false
newPress = true
micIsReady = no
readyToPlay = false
sn3 = undefined
sn2 = undefined
sn1 = undefined

draw = ->
  if readyToPlay
    background backgroundColour
    if keyIsPressed and key is " "
      updateLoadingText ""
      if newPress
        meydaAnalyzer.start()
        newPress = false
      if micIsReady
        recordingLoop()
        fill(0,0)
        strokeWeight(20)
        stroke highlightColour...
        rect 0, 0, width,height
        array.map (sn) -> sn.draw()
        samples.map (sn) -> sn.draw()
        sample.draw()
    else
      if not newPress
        meydaAnalyzer.stop()
        newPress = true

      array.map (sn) -> sn.state = 1
      array.map (sn) -> sn.draw()


#what to do while recording audio ---------------------------------------
setUpAudio = ->
  updateLoadingText "Loading Audio"
  ellipseMode = CENTER
  context = getAudioContext()
  array = cutAudioIntoSnippets sound,context

  Snippet.getMinMax array
  Snippet.constrain array, {"rms": [0, height],"spectralFlatness": [width, 0]}
  Snippet.createPolar array,true, true
  Snippet.createKDTree array

  array.map (sn) -> sn.state = 1
  array.map (sn) -> sn.draw()

  startMic context
  readyToPlay = true
  updateLoadingText "Press Spacebar speak into the mic"
recordingLoop = ->
  if newMicSnippet
    samples = Snippet.nearestSnippet(micSnippet, 10)
    sample = samples[int random(0,10)]

    array.map (sn) -> sn.state = 0
    samples.map (sn) -> sn.state = 2
    sample.state = 3
    sample.snPlay()

    [sn3, sn2, sn1] = [sn2, sn1, micSnippet]
    if Boolean sn1 and Boolean sn2 and Boolean sn3
      strokeWeight(6)
      stroke(250)
      console.log "1"
      line sn2.coOrds... , sn1.coOrds...
      stroke(250, 5)
      line sn3.coOrds... , sn2.coOrds...
      console.log "2"

    newMicSnippet = false

#set up audio stuff
cutAudioIntoSnippets = (audio,context) ->
  soundData = Array.from audio.buffer.getChannelData(0).slice 0
  totalSamples = soundData.length
  array = while soundData.length > 0
      tempBuffer = context.createBuffer 1, binSize, audio.sampleRate()
      tempBufferData = tempBuffer.getChannelData(0)
      tempBufferData.map (_, i) -> tempBufferData[i] = soundData.shift()
      soundFile = new p5.SoundFile()
      soundFile.buffer = tempBuffer
      soundObject = Meyda.extract keyList, tempBufferData
      values = for key in keyList
          soundObject[key]
      if soundData.length % 100 is 0
        console.log "loaded #{soundData.length} out of #{totalSamples}"
      # if Boolean values[0] and Boolean values[1]
      new Snippet(soundFile, values...)
  array.filter (sn) -> Boolean(sn.rms) and Boolean(sn.spectralFlatness)
startMic = (context) ->
  navigator.mediaDevices.getUserMedia({audio: true})
  .then (stream) ->
    analizeStream(stream)
  .catch (err) ->
    console.log "fuck"
  analizeStream = (stream) ->
    source = context.createMediaStreamSource(stream)
    options = {
      "audioContext": context
      "source": source
      "bufferSize": binSize
      "hopSize":            binSize / 4
      "windowingFunction":  "hamming"
      "featureExtractors":  keyList
      "callback": playCallback }
    meydaAnalyzer = Meyda.createMeydaAnalyzer(options)
playCallback = (features) ->
  if Boolean features
    values = for key in keyList
        features[key]
    micSnippet = new Snippet("empty", values...)
    Snippet.constrain [micSnippet], {"rms": [0, height],"spectralFlatness": [width, 0]}
    Snippet.createPolar [micSnippet]
    newMicSnippet = true
    micIsReady = yes
