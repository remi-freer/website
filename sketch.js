var array, backgroundColour, binSize, cutAudioIntoSnippets, draw, gotAudio, gotFile, highlightColour, isPlaying, keyList, loading, loadingText, meydaAnalyzer, micIsReady, micSnippet, newMicSnippet, newPress, newSoundfile, offCellColour, onCellColour, playCallback, preload, radio, readyToPlay, recordingLoop, sample, samples, setUpAudio, setup, sn1, sn2, sn3, sound, startMic,
  slice = [].slice;

array = void 0;

sound = void 0;

newSoundfile = void 0;

binSize = 12;

binSize = Math.pow(2, binSize);

keyList = ["rms", "spectralFlatness"];

newMicSnippet = false;

micSnippet = void 0;

backgroundColour = [20, 20, 20];

offCellColour = [70];

onCellColour = [255];

highlightColour = [168, 0, 0];

meydaAnalyzer = void 0;

loadingText = "";

radio = void 0;

preload = function() {
  return Snippet.keyList = keyList;
};

gotFile = function(file) {
  if (file.type === 'audio') {
    if (!readyToPlay) {
      return sound = loadSound(file.data, gotAudio, loading);
    }
  } else {
    return updateLoadingText('Not an audio file!');
  }
};

gotAudio = function() {
  return setUpAudio();
};

loading = function(progress) {
  return console.log(progress);
};

setup = function() {
  var canvas, size;
  size = Math.min(windowWidth, windowHeight - 150);
  canvas = createCanvas(size, size);
  background.apply(null, backgroundColour);
  return setUpUi(canvas);
};

samples = void 0;

sample = void 0;

isPlaying = false;

newPress = true;

micIsReady = false;

readyToPlay = false;

sn3 = void 0;

sn2 = void 0;

sn1 = void 0;

draw = function() {
  if (readyToPlay) {
    background(backgroundColour);
    if (keyIsPressed && key === " ") {
      updateLoadingText("");
      if (newPress) {
        meydaAnalyzer.start();
        newPress = false;
      }
      if (micIsReady) {
        recordingLoop();
        fill(0, 0);
        strokeWeight(20);
        stroke.apply(null, highlightColour);
        rect(0, 0, width, height);
        array.map(function(sn) {
          return sn.draw();
        });
        samples.map(function(sn) {
          return sn.draw();
        });
        return sample.draw();
      }
    } else {
      if (!newPress) {
        meydaAnalyzer.stop();
        newPress = true;
      }
      array.map(function(sn) {
        return sn.state = 1;
      });
      return array.map(function(sn) {
        return sn.draw();
      });
    }
  }
};

setUpAudio = function() {
  var context, ellipseMode;
  updateLoadingText("Loading Audio");
  ellipseMode = CENTER;
  context = getAudioContext();
  array = cutAudioIntoSnippets(sound, context);
  Snippet.getMinMax(array);
  Snippet.constrain(array, {
    "rms": [0, height],
    "spectralFlatness": [width, 0]
  });
  Snippet.createPolar(array, true, true);
  Snippet.createKDTree(array);
  array.map(function(sn) {
    return sn.state = 1;
  });
  array.map(function(sn) {
    return sn.draw();
  });
  startMic(context);
  readyToPlay = true;
  return updateLoadingText("Press Spacebar speak into the mic");
};

recordingLoop = function() {
  var ref;
  if (newMicSnippet) {
    samples = Snippet.nearestSnippet(micSnippet, 10);
    sample = samples[int(random(0, 10))];
    array.map(function(sn) {
      return sn.state = 0;
    });
    samples.map(function(sn) {
      return sn.state = 2;
    });
    sample.state = 3;
    sample.snPlay();
    ref = [sn2, sn1, micSnippet], sn3 = ref[0], sn2 = ref[1], sn1 = ref[2];
    if (Boolean(sn1 && Boolean(sn2 && Boolean(sn3)))) {
      strokeWeight(6);
      stroke(250);
      console.log("1");
      line.apply(null, slice.call(sn2.coOrds).concat(slice.call(sn1.coOrds)));
      stroke(250, 5);
      line.apply(null, slice.call(sn3.coOrds).concat(slice.call(sn2.coOrds)));
      console.log("2");
    }
    return newMicSnippet = false;
  }
};

cutAudioIntoSnippets = function(audio, context) {
  var key, soundData, soundFile, soundObject, tempBuffer, tempBufferData, totalSamples, values;
  soundData = Array.from(audio.buffer.getChannelData(0).slice(0));
  totalSamples = soundData.length;
  array = (function() {
    var results;
    results = [];
    while (soundData.length > 0) {
      tempBuffer = context.createBuffer(1, binSize, audio.sampleRate());
      tempBufferData = tempBuffer.getChannelData(0);
      tempBufferData.map(function(_, i) {
        return tempBufferData[i] = soundData.shift();
      });
      soundFile = new p5.SoundFile();
      soundFile.buffer = tempBuffer;
      soundObject = Meyda.extract(keyList, tempBufferData);
      values = (function() {
        var j, len, results1;
        results1 = [];
        for (j = 0, len = keyList.length; j < len; j++) {
          key = keyList[j];
          results1.push(soundObject[key]);
        }
        return results1;
      })();
      if (soundData.length % 100 === 0) {
        console.log("loaded " + soundData.length + " out of " + totalSamples);
      }
      results.push((function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Snippet, [soundFile].concat(slice.call(values)), function(){}));
    }
    return results;
  })();
  return array.filter(function(sn) {
    return Boolean(sn.rms) && Boolean(sn.spectralFlatness);
  });
};

startMic = function(context) {
  var analizeStream;
  navigator.mediaDevices.getUserMedia({
    audio: true
  }).then(function(stream) {
    return analizeStream(stream);
  })["catch"](function(err) {
    return console.log("fuck");
  });
  return analizeStream = function(stream) {
    var options, source;
    source = context.createMediaStreamSource(stream);
    options = {
      "audioContext": context,
      "source": source,
      "bufferSize": binSize,
      "hopSize": binSize / 4,
      "windowingFunction": "hamming",
      "featureExtractors": keyList,
      "callback": playCallback
    };
    return meydaAnalyzer = Meyda.createMeydaAnalyzer(options);
  };
};

playCallback = function(features) {
  var key, values;
  if (Boolean(features)) {
    values = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = keyList.length; j < len; j++) {
        key = keyList[j];
        results.push(features[key]);
      }
      return results;
    })();
    micSnippet = (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Snippet, ["empty"].concat(slice.call(values)), function(){});
    Snippet.constrain([micSnippet], {
      "rms": [0, height],
      "spectralFlatness": [width, 0]
    });
    Snippet.createPolar([micSnippet]);
    newMicSnippet = true;
    return micIsReady = true;
  }
};
