var loading, setUpUi, updateLoadingText;

loading = void 0;

setUpUi = function(canvas) {
  var heading, sideIndent;
  canvas.position((windowWidth / 2) - (width / 2), windowHeight - (height + 10));
  sideIndent = (windowWidth - width) / 2.5;
  textAlign(LEFT);
  heading = createDiv("Audio Collage");
  heading.style("position", "absolute");
  heading.style("font-size", "16pt");
  heading.style("font-family", "monospace");
  heading.center("horizontal");
  heading.style("top", "70");
  textAlign(CENTER);
  loading = createDiv("Drag and drop a short audio file");
  loading.style("font-size", "16pt");
  loading.style("font-family", "monospace");
  loading.style("colour", "255, 0, 0");
  loading.style("color", "#FFFFFF");
  loading.style("position", "absolute");
  loading.style("top", "" + (windowHeight / 4));
  loading.center("horizontal");
  textAlign(LEFT);
  return canvas.drop(gotFile);
};

updateLoadingText = function(text) {
  loading.html("" + text, false);
  loading.style("top", "" + (windowHeight / 4));
  return loading.center("horizontal");
};
