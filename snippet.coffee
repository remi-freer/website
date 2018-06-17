class SnippetSet


class Snippet
  constructor: (@soundFile, @rms, @spectralFlatness) ->
  snPlay: (callback = -> ) ->
    @soundFile.setVolume 0
    @soundFile.setVolume 0.7, 0.3
    @soundFile.onended callback
    @soundFile.play()

  state = 0
  @minMax = {}
  @keyList = []
  @polarMinMax = {}
  @makeMinMax = true
  @coOrds = []

  @createKDTree: (snArray) ->
    snArray2 = snArray.slice 0
    @storeArray = snArray
    snArray2.map (snippet, i) -> snippet["index"] = i

    distance = (a, b) ->
      total = for key in @keyList
        Math.pow(a[key] - b[key], 2)
      total.reduce (a,b) -> a + b
    @tree = new kdTree(snArray2, distance, @keyList)

  @nearestSnippet: (snippet, count = 1) ->
    @tree.nearest(snippet, count).map (snAndDistance) ->
      Snippet.storeArray[snAndDistance[0].index]

  @getMinMax: (snArray) -> for key in @keyList
      val = snArray.map (snippet) -> snippet[key]
      val = val.filter(Boolean)
      @minMax[key] = [ Math.min(val...), Math.max(val...)]

  @constrain: (snArray) ->
    constraints = {
      "rms": [0, height],"spectralFlatness": [width, 0]}

    snArray.map (snippet) -> for key in @keyList
        snippet[key] = map snippet[key], Snippet.minMax[key]... , constraints[key]...

  @createPolar: (snArray, doPolar = true, makeMinMax = false) ->
    if doPolar
      snArray.map (snippet) ->
        theta = Math.PI * 2 * snippet.spectralFlatness/width
        r = (snippet.rms + 0.00000001) / 2
        x = (r *   cos(theta) )
        y = (r * sin(theta) )
        snippet.coOrds = [x,y]
    if makeMinMax
      valX = snArray.map (snippet) -> snippet.coOrds[0]
      valY = snArray.map (snippet) -> snippet.coOrds[1]
      valX = valX.filter(Boolean)
      valY = valY.filter(Boolean)

      @polarMinMax = {
        "x" : [ Math.min(valX...), Math.max(valX...) ]
        "y" : [ Math.min(valY...), Math.max(valY...) ] }
    if Boolean Snippet.polarMinMax.y and Boolean Snippet.polarMinMax.x
      snArray.map (snippet) ->
        val = snippet.coOrds
        snippet.coOrds = [
          map snippet.coOrds[0], (Snippet.polarMinMax.x)... , 20, width - 20
          map snippet.coOrds[1], (Snippet.polarMinMax.y)... , 20, height - 20  ]

  draw: () ->
    switch
      #not recording
      when @state == 0
        noStroke()
        fill offCellColour...
        ellipse @coOrds... , 10
      #recording not selected
      when @state == 1
        stroke backgroundColour
        strokeWeight 1
        fill onCellColour...
        ellipse @coOrds... , 10
      #recording nearest candidates
      when @state == 2
        stroke onCellColour...
        strokeWeight 2
        noFill()
        ellipse @coOrds... , 20
      #recording current playing sample
      when @state == 3
        stroke highlightColour...
        strokeWeight 3
        noFill()
        ellipse @coOrds... , 20
