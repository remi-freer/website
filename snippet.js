var Snippet, SnippetSet,
  slice = [].slice;

SnippetSet = (function() {
  function SnippetSet() {}

  return SnippetSet;

})();

Snippet = (function() {
  var state;

  function Snippet(soundFile, rms, spectralFlatness) {
    this.soundFile = soundFile;
    this.rms = rms;
    this.spectralFlatness = spectralFlatness;
  }

  Snippet.prototype.snPlay = function(callback) {
    if (callback == null) {
      callback = function() {};
    }
    this.soundFile.setVolume(0);
    this.soundFile.setVolume(0.7, 0.3);
    this.soundFile.onended(callback);
    return this.soundFile.play();
  };

  state = 0;

  Snippet.minMax = {};

  Snippet.keyList = [];

  Snippet.polarMinMax = {};

  Snippet.makeMinMax = true;

  Snippet.coOrds = [];

  Snippet.createKDTree = function(snArray) {
    var distance, snArray2;
    snArray2 = snArray.slice(0);
    this.storeArray = snArray;
    snArray2.map(function(snippet, i) {
      return snippet["index"] = i;
    });
    distance = function(a, b) {
      var key, total;
      total = (function() {
        var j, len, ref, results;
        ref = this.keyList;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          key = ref[j];
          results.push(Math.pow(a[key] - b[key], 2));
        }
        return results;
      }).call(this);
      return total.reduce(function(a, b) {
        return a + b;
      });
    };
    return this.tree = new kdTree(snArray2, distance, this.keyList);
  };

  Snippet.nearestSnippet = function(snippet, count) {
    if (count == null) {
      count = 1;
    }
    return this.tree.nearest(snippet, count).map(function(snAndDistance) {
      return Snippet.storeArray[snAndDistance[0].index];
    });
  };

  Snippet.getMinMax = function(snArray) {
    var j, key, len, ref, results, val;
    ref = this.keyList;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      key = ref[j];
      val = snArray.map(function(snippet) {
        return snippet[key];
      });
      val = val.filter(Boolean);
      results.push(this.minMax[key] = [Math.min.apply(Math, val), Math.max.apply(Math, val)]);
    }
    return results;
  };

  Snippet.constrain = function(snArray) {
    var constraints;
    constraints = {
      "rms": [0, height],
      "spectralFlatness": [width, 0]
    };
    return snArray.map(function(snippet) {
      var j, key, len, ref, results;
      ref = this.keyList;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        key = ref[j];
        results.push(snippet[key] = map.apply(null, [snippet[key]].concat(slice.call(Snippet.minMax[key]), slice.call(constraints[key]))));
      }
      return results;
    });
  };

  Snippet.createPolar = function(snArray, doPolar, makeMinMax) {
    var valX, valY;
    if (doPolar == null) {
      doPolar = true;
    }
    if (makeMinMax == null) {
      makeMinMax = false;
    }
    if (doPolar) {
      snArray.map(function(snippet) {
        var r, theta, x, y;
        theta = Math.PI * 2 * snippet.spectralFlatness / width;
        r = (snippet.rms + 0.00000001) / 2;
        x = r * cos(theta);
        y = r * sin(theta);
        return snippet.coOrds = [x, y];
      });
    }
    if (makeMinMax) {
      valX = snArray.map(function(snippet) {
        return snippet.coOrds[0];
      });
      valY = snArray.map(function(snippet) {
        return snippet.coOrds[1];
      });
      valX = valX.filter(Boolean);
      valY = valY.filter(Boolean);
      this.polarMinMax = {
        "x": [Math.min.apply(Math, valX), Math.max.apply(Math, valX)],
        "y": [Math.min.apply(Math, valY), Math.max.apply(Math, valY)]
      };
    }
    if (Boolean(Snippet.polarMinMax.y && Boolean(Snippet.polarMinMax.x))) {
      return snArray.map(function(snippet) {
        var val;
        val = snippet.coOrds;
        return snippet.coOrds = [map.apply(null, [snippet.coOrds[0]].concat(slice.call(Snippet.polarMinMax.x), [20], [width - 20])), map.apply(null, [snippet.coOrds[1]].concat(slice.call(Snippet.polarMinMax.y), [20], [height - 20]))];
      });
    }
  };

  Snippet.prototype.draw = function() {
    switch (false) {
      case this.state !== 0:
        noStroke();
        fill.apply(null, offCellColour);
        return ellipse.apply(null, slice.call(this.coOrds).concat([10]));
      case this.state !== 1:
        stroke(backgroundColour);
        strokeWeight(1);
        fill.apply(null, onCellColour);
        return ellipse.apply(null, slice.call(this.coOrds).concat([10]));
      case this.state !== 2:
        stroke.apply(null, onCellColour);
        strokeWeight(2);
        noFill();
        return ellipse.apply(null, slice.call(this.coOrds).concat([20]));
      case this.state !== 3:
        stroke.apply(null, highlightColour);
        strokeWeight(3);
        noFill();
        return ellipse.apply(null, slice.call(this.coOrds).concat([20]));
    }
  };

  return Snippet;

})();
