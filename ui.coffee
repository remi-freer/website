loading = undefined

setUpUi = (canvas) ->
  canvas.position (windowWidth/2) - (width/2),  windowHeight - (height + 10)
  sideIndent = (windowWidth - width)/2.5

  textAlign(LEFT);

  heading = createDiv("Audio Collage")
  heading.style "position", "absolute"
  heading.style("font-size", "16pt")
  heading.style("font-family", "monospace")
  heading.center("horizontal");
  heading.style("top","70")

  textAlign(CENTER);

  loading = createDiv("Drag and drop a short audio file")
  loading.style("font-size", "16pt")
  loading.style("font-family", "monospace")
  loading.style("colour", "255, 0, 0")
  loading.style("color", "#FFFFFF");
  loading.style "position", "absolute"

  loading.style("top","#{windowHeight/4}")
  loading.center("horizontal");

  # radio = createRadio()
  # radio.value("12")
  # radio.option('10', Math.pow(2, 10))
  # radio.option('11', Math.pow(2, 11))
  # radio.option('12', Math.pow(2, 12))
  # radio.option('13', Math.pow(2, 13))
  # radio.option('14', Math.pow(2, 14))
  # radioVal = radio.value()
  # radio.style("font-size", "16pt")
  # radio.style "position", "absolute"
  # radio.style("right","#{sideIndent}pt")
  # radio.style("top","70pt ")
  # radio.style("font-family", "monospace");
  # radio.style("kerning", "10px");
  # radio.changed(-> binChange())

  textAlign(LEFT);


  # sel = createSelect();
  # sel.position(windowWidth / 2, 60);
  # sel.option('C');
  # sel.option('C');
  # sel.option('D');
  # sel.changed( -> console.log changed);
  # sel.center("horizontal");
  # sel.style("font-size", "16pt");
  # sel.style("font-family", "monospace")
  # sel.style("left","#{sideIndent}pt")
  # sel.style("top","40")

  # Get getFiles
  canvas.drop(gotFile)

  #
  # heading = createDiv("bin size")
  # heading.style "position", "absolute"
  # heading.style("font-size", "16pt")
  # heading.style("font-family", "monospace")
  # heading.style("right","#{sideIndent}pt")
  # heading.style("top","40")

  # fileInput = createFileInput(gotFile)
  #
  # button = createButton('submit');
  # button.mousePressed(setUpAudio);

updateLoadingText = (text) ->
  loading.html("#{text}", false)
  loading.style("top","#{windowHeight/4}")
  loading.center("horizontal");
