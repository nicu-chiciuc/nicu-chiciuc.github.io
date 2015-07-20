
  var Arrow, Background, Canvas, Circle, Drawing, GLB, Grid, LineLayer, Linker, run,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  GLB = void 0;

  document.addEventListener('contextmenu', function(e) {
    return e.preventDefault();
  }, false);

  window.onresize = function(event) {
    var layer, _i, _len, _ref;
    GLB.width = window.innerWidth;
    GLB.height = window.innerHeight;
    _ref = GLB.layers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      layer = _ref[_i];
      layer.resize();
    }
    GLB.baseLayer.resize();
    GLB.grid.resize();
    GLB.drawing.resize();
  };

  run = function() {
    GLB = new Linker();
    GLB.divSVG = document.getElementById('svg-layers');
    GLB.drawing = new Drawing('drawing-layer');
    GLB.grid = new Grid('background-layer');
    GLB.baseLayer = new LineLayer('white', 'base');
    GLB.setLayerFront(GLB.baseLayer);
    GLB.setupNewLayer();
    GLB.layers[0].canCreate = false;
    GLB.layers[0].addArrow(0, 1);
  };

  Linker = (function() {
    function Linker() {
      this.divSVG = 0;
      this.strokeAlpha = 0.4;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.layers = [];
      this.baseLayer = 0;
      this.layerFront = 0;
      this.canvas = 0;
      this.deepness = 4;
      this.data = [];
      this.dynamic = true;
      this.drawLine = 0;
      this.playing = false;
      this.setupDialog();
    }

    Linker.prototype.updateData = function() {
      var layerNow;
      this.data = (function() {
        var _i, _len, _ref, _results;
        _ref = this.layers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          layerNow = _ref[_i];
          _results.push(layerNow.getData());
        }
        return _results;
      }).call(this);
    };

    Linker.prototype.setWidthHeightOfGLB = function(object) {
      object.setAttribute('width', this.width.toString());
      object.setAttribute('height', this.height.toString());
    };

    Linker.prototype.renewDialogData = function() {
      $('#layerColor').spectrum('set', this.layerFront.color);
    };

    Linker.prototype.drawDynamic = function() {
      if (this.dynamic) {
        this.drawing.stopDrawing();
        this.drawing.clearCanvas();
        this.drawing.continueDrawing();
      }
    };

    Linker.prototype.setupDialog = function() {
      var changeDeepValue, self, setupLayerButtons, updateAllColors;
      self = this;
      $("#dialog").dialog({
        closeOnEscape: false,
        open: function(event, ui) {
          return $(".ui-dialog-titlebar-close", ui.dialog || ui).hide();
        }
      });
      setupLayerButtons = function() {
        $('#but-base').button().click(function() {
          return self.setLayerFront(self.baseLayer);
        });
        $('#but0').button().click(function() {
          return self.setLayerFront(self.layers[0]);
        });
        $('#but1').button().click(function() {
          return self.setLayerFront(self.layers[1]);
        });
        return $('#add-layers').button().click(function() {
          return self.setupNewLayer();
        });
      };
      setupLayerButtons();
      changeDeepValue = function(value) {
        self.deepness = value;
        self.drawDynamic();
      };
      $('#deep-spinner').spinner({
        step: 1,
        numberFormat: "n"
      }).spinner('value', self.deepness).spinner({
        min: 0,
        spin: function(evt, ui) {
          return changeDeepValue(ui.value);
        },
        change: function(evt, ui) {
          return changeDeepValue($('#deep-spinner').spinner('value'));
        }
      });
      $('#rel-width').button().click(function() {
        self.drawing.relWidth = !self.drawing.relWidth;
      });
      $('#grid-type').buttonset();
      $('#putCartesianGrid').button().click(function() {
        return self.grid.changeType('cartesian');
      });
      $('#putPolarGrid').button().click(function() {
        return self.grid.changeType('polar');
      });
      $('#removeGrid').button().click(function() {
        return self.grid.changeType('none');
      });
      $('#dynamic-drawing').button().click(function() {
        self.dynamic = !self.dynamic;
      });
      $('#save-png').button().click(function() {
        return window.open(self.drawing.canvas.toDataURL("image/png"));
      });
      updateAllColors = function(layer, color) {
        var lay, layNum, _i, _len, _ref;
        console.log(color);
        if (color === null) {
          layer.alpha = 0;
          return;
        }
        color = color.toString();
        layNum = self.layers.indexOf(layer);
        layer.changeColor(color);
        layer.alpha = 1;
        _ref = self.layers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          lay = _ref[_i];
          lay.changeLineColors(layNum, color);
        }
        GLB.baseLayer.changeLineColors(layNum, color);
      };
      $("#play").button({
        text: false,
        icons: {
          primary: "ui-icon-play"
        }
      }).click(function() {
        return self.drawing.pauseOrContinueDrawing();
      });
      $("#stop").button({
        text: false,
        icons: {
          primary: "ui-icon-stop"
        }
      }).click(function() {
        return self.drawing.stopDrawing();
      });
      $('#clear-canvas').button().click(function() {
        return self.drawing.clearCanvas();
      });
      $('#layerColor').spectrum({
        allowEmpty: true,
        clickoutFiresChange: true,
        showButtons: false,
        flat: true,
        showInput: true,
        move: function(color) {
          return updateAllColors(self.layerFront, color);
        },
        hide: function(color) {
          return updateAllColors(self.layerFront, color);
        }
      });
      $('#min-dist').slider({
        min: 1,
        max: 20,
        value: 4,
        slide: function(evt, ui) {
          return self.drawing.minDist = ui.value;
        }
      });
      $('#alphaSlider').slider({
        value: self.strokeAlpha * 100,
        max: 100,
        min: 0,
        slide: function(evt, ui) {
          return self.strokeAlpha = ui.value / 100;
        }
      });
    };

    Linker.prototype.setLayerFront = function(lnow) {
      if (this.layerFront) {
        this.layerFront.makeInvisible();
      }
      this.layerFront = lnow;
      this.layerFront.makeVisible();
      this.renewDialogData();
      this.divSVG.appendChild(lnow.snap.node);
    };

    Linker.prototype.setupNewLayer = function() {
      var buttonsDiv, newButton, newLayer, newLayerName, numLayers, self;
      numLayers = this.layers.length.toString();
      newLayerName = 'but' + numLayers;
      newButton = document.createElement('button');
      newButton.setAttribute('id', newLayerName);
      newButton.setAttribute('class', 'line-button');
      newButton.innerHTML = 'Layer ' + numLayers;
      buttonsDiv = document.getElementById('buttons-div');
      buttonsDiv.appendChild(newButton);
      self = this;
      $('#' + newLayerName).button().click(function() {
        return self.setLayerFront(self.layers[numLayers]);
      });
      newLayer = new LineLayer(Utils.colors[this.layers.length]);
      this.layers.push(newLayer);
      this.setLayerFront(newLayer);
    };

    return Linker;

  })();

  Canvas = (function() {
    function Canvas(divContainer) {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      this.canvas.setAttribute('class', 'absolute-pos');
      GLB.setWidthHeightOfGLB(this.canvas);
      $('#' + divContainer).append(this.canvas);
    }

    Canvas.prototype.clearCanvas = function() {
      this.context.clearRect(0, 0, GLB.width, GLB.height);
      return this;
    };

    Canvas.prototype.resize = function() {
      GLB.setWidthHeightOfGLB(this.canvas);
      return this;
    };

    return Canvas;

  })();

  Drawing = (function(_super) {
    __extends(Drawing, _super);

    function Drawing(div) {
      this.drawRecurLineCanvas = __bind(this.drawRecurLineCanvas, this);
      this.stopDrawing = __bind(this.stopDrawing, this);
      this.pauseDrawing = __bind(this.pauseDrawing, this);
      this.continueDrawing = __bind(this.continueDrawing, this);
      this.startDrawing = __bind(this.startDrawing, this);
      this.drawOnInterval = __bind(this.drawOnInterval, this);
      Drawing.__super__.constructor.call(this, div);
      this.minDist = 4;
      this.relWidth = true;
      this.queue = [];
      this.timer = 0;
      this.drawPerInterval = 300;
      this._ref = 0;
      this._pNow = [];
      this._SvecX;
      this._SvecY;
      this._FvecX;
      this._FvecY;
      this._type;
      this._lev;
      this._x1;
      this._y1;
      this._x2;
      this._y2;
      this._i;
      this._flip;
      this._matrix = new Matrix();
      this._ang;
      this._rad;
      this._randAng;
      this._randRad;
      this._temp;
      this._width;
      return;
    }

    Drawing.prototype.drawCanvas = function(x1, y1, x2, y2, type) {
      this._width = 1;
      if (this.relWidth === true) {
        this._width = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 10;
        if (this._width < 1) {
          this._width = 1;
        }
      }
      this.context.lineCap = 'round';
      this.context.lineWidth = this._width;
      this.context.strokeStyle = GLB.layers[type].color;
      this.context.globalAlpha = GLB.strokeAlpha * GLB.layers[type].alpha;
      this.context.beginPath();
      this.context.moveTo(x1 | 0, y1 | 0);
      this.context.lineTo(x2 | 0, y2 | 0);
      this.context.stroke();
    };

    Drawing.prototype.drawOnInterval = function() {
      var i;
      i = Math.min(this.drawPerInterval, this.queue.length);
      while (i > 0) {
        this.drawRecurLineCanvas();
        i--;
      }
      $('#queueLength').html(this.queue.length);
      if (this.queue.length === 0) {
        this.pauseDrawing();
      }
    };

    Drawing.prototype.drawLine = Drawing.prototype.drawCanvas;

    Drawing.prototype.startDrawing = function() {
      var b, f, i, t, _i, _ref;
      GLB.updateData();
      b = GLB.baseLayer.getData();
      for (i = _i = 0, _ref = b.list.length; _i < _ref; i = _i += 1) {
        f = b.list[i].from;
        t = b.list[i].to;
        GLB.drawing.queue.push([b.raw[f].x, b.raw[f].y, b.raw[t].x, b.raw[t].y, b.graph[f][t], GLB.deepness, 1]);
      }
      if (this.timer === 0) {
        this.timer = setInterval(this.drawOnInterval, 1);
      }
    };

    Drawing.prototype.pauseOrContinueDrawing = function() {
      if (this.timer === 0) {
        return this.continueDrawing();
      } else {
        return this.pauseDrawing();
      }
    };

    Drawing.prototype.continueDrawing = function() {
      $('#play').button('option', {
        icons: {
          primary: "ui-icon-pause"
        }
      });
      if (this.queue.length === 0) {
        this.startDrawing();
      }
      if (this.timer === 0) {
        return this.timer = setInterval(this.drawOnInterval, 1);
      }
    };

    Drawing.prototype.pauseDrawing = function() {
      $('#play').button('option', {
        icons: {
          primary: "ui-icon-play"
        }
      });
      clearInterval(this.timer);
      return this.timer = 0;
    };

    Drawing.prototype.stopDrawing = function() {
      $('#play').button('option', {
        icons: {
          primary: "ui-icon-play"
        }
      });
      $('#queueLength').html(0);
      this.pauseDrawing();
      return this.queue = [];
    };

    Drawing.prototype.drawRecurLineCanvas = function() {
      if (this.queue.length < 1) {
        this.stopDrawing();
        return;
      }
      this._ref = this.queue.shift();
      this._SvecX = this._ref[0];
      this._SvecY = this._ref[1];
      this._FvecX = this._ref[2];
      this._FvecY = this._ref[3];
      this._type = this._ref[4].colorNum;
      this._lev = this._ref[5];
      this._flip = this._ref[6];
      if (this._lev === 0 || this._type === 0 || (Math.pow(this._SvecX - this._FvecX, 2) + Math.pow(this._SvecY - this._FvecY, 2)) < (this.minDist * this.minDist)) {
        this.drawLine(this._SvecX, this._SvecY, this._FvecX, this._FvecY, this._type);
      } else if (this._lev > 0) {
        this._list = GLB.data[this._type].list;
        this._points = GLB.data[this._type].points;
        this._graph = GLB.data[this._type].graph;
        this._variation = GLB.data[this._type].variation;
        this._pNow = [];
        this._rad = Utils.dist2points(this._SvecX, this._SvecY, this._FvecX, this._FvecY);
        this._ang = Math.atan2(this._FvecY - this._SvecY, this._FvecX - this._SvecX);
        this._matrix.clear().manual([1, 0, 0, 0, this._flip, 0, 0, 0, 1]).rotate(this._ang).scale(this._rad, this._rad).translate(this._SvecX, this._SvecY);
        this._i = 0;
        while (this._i < this._points.length) {
          this._temp = this._matrix.apply([this._points[this._i][0], this._points[this._i][1]]);
          if (this._variation[this._i] > 0) {
            this._randAng = Math.random() * 2 * Math.PI;
            this._randRad = Math.random() * this._rad * this._variation[this._i];
            this._temp[0] += this._randRad * Math.cos(this._randAng);
            this._temp[1] += this._randRad * Math.sin(this._randAng);
          }
          this._pNow.push(this._temp);
          this._i += 1;
        }
        this._i = this._list.length;
        while (this._i > 0) {
          this._i -= 1;
          this._x1 = this._pNow[this._list[this._i].from][0];
          this._y1 = this._pNow[this._list[this._i].from][1];
          this._x2 = this._pNow[this._list[this._i].to][0];
          this._y2 = this._pNow[this._list[this._i].to][1];
          if ((Math.pow(this._x1 - this._x2, 2) + Math.pow(this._y1 - this._y2, 2)) < (this.minDist * this.minDist)) {
            this.drawLine(this._x1, this._y1, this._x2, this._y2, this._type);
            continue;
          }
          this.queue.push([this._pNow[this._list[this._i].from][0], this._pNow[this._list[this._i].from][1], this._pNow[this._list[this._i].to][0], this._pNow[this._list[this._i].to][1], this._graph[this._list[this._i].from][this._list[this._i].to], this._lev - 1, this._flip * this._graph[this._list[this._i].from][this._list[this._i].to].flipped]);
        }
      }
    };

    return Drawing;

  })(Canvas);

  Grid = (function(_super) {
    __extends(Grid, _super);

    function Grid(div) {
      Grid.__super__.constructor.call(this, div);
      this.lineStep = 30;
      this.polar5step = this.lineStep * 5;
      this.polar1step = this.lineStep * 20;
      this.polarX = GLB.width / 2;
      this.polarY = GLB.height / 2;
      this.changeType('cartesian');
      return;
    }

    Grid.removeGrid = function() {};

    Grid.prototype.updatePolarXY = function() {
      var bBoxLastPressedCircle;
      bBoxLastPressedCircle = GLB.layerFront.lastCircle.getBBox();
      this.polarX = bBoxLastPressedCircle.cx;
      this.polarY = bBoxLastPressedCircle.cy;
    };

    Grid.prototype.changeType = function(newGridType) {
      switch (newGridType) {
        case 'cartesian':
          this.type = 'cartesian';
          this.putGrid = this.putCartesianGrid;
          this.getGridSnap = this.getGridSnapCartesian;
          break;
        case 'polar':
          this.updatePolarXY();
          this.type = 'polar';
          this.putGrid = this.putPolarGrid;
          this.getGridSnap = this.getGridSnapPolar;
      }
      this.putGrid();
    };

    Grid.prototype.resize = function() {
      Grid.__super__.resize.apply(this);
      this.putGrid();
    };

    Grid.prototype.putGrid = function() {};

    Grid.prototype.putCartesianGrid = function() {
      var drawBigLines, i, maxLength, _i, _ref;
      drawBigLines = (function(_this) {
        return function() {};
      })(this);
      this.clearCanvas();
      maxLength = Math.max(GLB.width, GLB.height);
      this.context.strokeStyle = 'gray';
      for (i = _i = 0, _ref = this.lineStep; _ref > 0 ? _i < maxLength : _i > maxLength; i = _i += _ref) {
        if ((i / this.lineStep) % 15 === 0) {
          this.context.lineWidth = 1.7;
        } else if ((i / this.lineStep) % 5 === 0) {
          this.context.lineWidth = 1;
        } else {
          this.context.lineWidth = 0.5;
        }
        this.context.beginPath();
        this.context.moveTo(0, i);
        this.context.lineTo(maxLength, i);
        this.context.moveTo(i, 0);
        this.context.lineTo(i, maxLength);
        this.context.stroke();
      }
    };

    Grid.prototype.putPolarGrid = function() {
      var ctx, i, length, putLine, x, y, _i, _j, _k, _l, _ref, _ref1, _results;
      this.clearCanvas();
      x = this.polarX;
      y = this.polarY;
      ctx = this.canvas.getContext('2d');
      putLine = function(ang, dist, len) {
        var rad, vEn, vSt;
        vSt = new Vector(x + dist, y);
        vEn = new Vector(x + dist + len, y);
        rad = ang * Math.PI / 180;
        vEn.rotate(rad, x, y);
        vSt.rotate(rad, x, y);
        ctx.beginPath();
        ctx.moveTo(vSt.x, vSt.y);
        ctx.lineTo(vEn.x, vEn.y);
        return ctx.stroke();
      };
      ctx.strokeStyle = 'gray';
      for (i = _i = 0, _ref = GLB.width, _ref1 = this.lineStep; _ref1 > 0 ? _i < _ref : _i > _ref; i = _i += _ref1) {
        if ((i / this.lineStep) % 10 === 0) {
          ctx.lineWidth = 1.8;
        } else if ((i / this.lineStep) % 5 === 0) {
          ctx.lineWidth = 1;
        } else {
          ctx.lineWidth = 0.5;
        }
        ctx.beginPath();
        ctx.arc(this.polarX, this.polarY, i, 0, 2 * Math.PI);
        ctx.stroke();
      }
      length = Math.max(GLB.width, GLB.height);
      ctx.lineWidth = 1.7;
      for (i = _j = 0; _j <= 270; i = _j += 90) {
        putLine(0 + i, 0, length);
        putLine(30 + i, 0, length);
        putLine(45 + i, 0, length);
        putLine(60 + i, 0, length);
      }
      ctx.lineWidth = 1;
      for (i = _k = 0; _k < 360; i = _k += 5) {
        putLine(i, this.polar5step, length);
      }
      ctx.lineWidth = 0.5;
      _results = [];
      for (i = _l = 0; _l < 360; i = _l += 1) {
        _results.push(putLine(i, this.polar1step, length));
      }
      return _results;
    };

    Grid.prototype.getGridSnap = function(x, y) {};

    Grid.prototype.getGridSnapCartesian = function(x, y) {
      var bestX, bestY, leftX, leftY, rightX, rightY;
      leftX = x - (x % this.lineStep);
      rightX = leftX + this.lineStep;
      bestX = Utils.getClosest(x, leftX, rightX);
      leftY = y - (y % this.lineStep);
      rightY = leftY + this.lineStep;
      bestY = Utils.getClosest(y, leftY, rightY);
      return new Vector(bestX, bestY);
    };

    Grid.prototype.getGridSnapPolar = function(nx, ny) {
      var directionVec, getClosestAngle, getClosestRadius, getDegreeInnerCircle, getDegreeMiddleCircle, getDegreeOuterCircle;
      getClosestRadius = (function(_this) {
        return function(radius) {
          var maxRad, minRad;
          minRad = radius - (radius % _this.lineStep);
          maxRad = minRad + _this.lineStep;
          return Utils.getClosest(radius, minRad, maxRad);
        };
      })(this);
      getDegreeInnerCircle = (function(_this) {
        return function(angDegree) {
          var i, leftDegree, rightDegree, _i, _ref;
          for (i = _i = 0, _ref = Utils.trigPoints.length; _i < _ref; i = _i += 1) {
            if (Utils.trigPoints[i] > angDegree) {
              leftDegree = Utils.trigPoints[i - 1];
              rightDegree = Utils.trigPoints[i];
              return Utils.getClosest(angDegree, leftDegree, rightDegree);
            }
          }
        };
      })(this);
      getDegreeMiddleCircle = (function(_this) {
        return function(angDegree) {
          var leftDegree, rightDegree;
          leftDegree = angDegree - (angDegree % 5);
          rightDegree = angDegree + 5;
          return Utils.getClosest(angDegree, leftDegree, rightDegree);
        };
      })(this);
      getDegreeOuterCircle = (function(_this) {
        return function(angDegree) {
          var leftDegree, rightDegree;
          leftDegree = angDegree - (angDegree % 1);
          rightDegree = angDegree + 1;
          return Utils.getClosest(angDegree, leftDegree, rightDegree);
        };
      })(this);
      getClosestAngle = (function(_this) {
        return function() {
          var angDegree;
          angDegree = Utils.radToDegree(directionVec.ang);
          angDegree = Utils.getDegree0To360(angDegree);
          if (directionVec.rad < _this.polar5step) {
            angDegree = getDegreeInnerCircle(angDegree);
          } else {

          }
          if (directionVec.rad < _this.polar1step) {
            angDegree = getDegreeMiddleCircle(angDegree);
          } else {
            angDegree = getDegreeOuterCircle(angDegree);
          }
          return Utils.degreeToRad(angDegree);
        };
      })(this);
      directionVec = new Vector(nx, ny);
      directionVec.translate(-this.polarX, -this.polarY);
      directionVec.rad = getClosestRadius(directionVec.rad);
      directionVec.ang = getClosestAngle();
      directionVec.translate(this.polarX, this.polarY);
      return directionVec;
    };

    return Grid;

  })(Canvas);

  Circle = (function() {
    function Circle(layer, x, y, innerCol, outterCol) {
      var setupGroup;
      setupGroup = (function(_this) {
        return function() {
          var self;
          self = _this;
          return layer.snap.g(_this.outterCirc, _this.innerCirc).drag(_this._mouseMove, _this._mouseDown, _this._mouseEnd, _this, _this, _this).mouseup(function() {
            var indEnd, indStart;
            if (layer.canCreate) {
              if (layer._crLine.now === 'dragging') {
                indStart = layer.circles.indexOf(layer._crLine.start);
                indEnd = layer.circles.indexOf(self);
                layer.addArrow(indStart, indEnd);
                return layer._crLine.arrow.attr({
                  points: ''
                });
              }
            }
          });
        };
      })(this);
      this.dragType = 'none';
      this.canBeRandom = true;
      this.layer = layer;
      this.outterCirc = layer.snap.circle(x, y, 25).attr({
        'fill': outterCol
      });
      this.innerCirc = layer.snap.circle(x, y, 15).attr({
        'fill': innerCol
      });
      this.varCirc = layer.snap.circle(x, y, 0).attr({
        'fill': 'blue'
      });
      this.makeVisible();
      this.group = setupGroup();
    }

    Circle.prototype._mouseDown = function(x, y, evt) {
      var box, nowType;
      nowType = Utils.buttonType(evt);
      if (evt.ctrlKey === false) {
        switch (nowType) {
          case 'left':
            this.dragType = 'left';
            break;
          case 'right':
            if (this.layer.canCreate) {
              this.dragType = 'right';
              box = this.group.getBBox();
              this.layer._crLine.now = 'dragging';
              this.layer._crLine.stX = box.cx;
              this.layer._crLine.stY = box.cy;
              this.layer._crLine.start = this;
            }
            break;
          case 'middle':
            if (this.layer.canCreate) {
              this.layer.removeCircle(this);
            }
        }
      } else {
        switch (nowType) {
          case 'left':
            if (this.canBeRandom) {
              this.dragType = 'random';
              this.varCirc.attr({
                r: Utils.dist2points(this.getCx(), this.getCy(), x, y)
              });
            }
            break;
          case 'middle':
            this.varCirc.attr({
              r: 0
            });
        }
      }
    };

    Circle.prototype._mouseMove = function(dx, dy, nx, ny, evt) {
      var a, vec;
      if (this.dragType === 'left') {
        vec = GLB.grid.getGridSnap(nx, ny);
        this.moveTo(vec.x, vec.y);
        this.layer.updateArrows();
      }
      if (this.dragType === 'right' && this.layer.canCreate) {
        a = Utils.getArrow(this.layer._crLine.stX, this.layer._crLine.stY, nx, ny, 15);
        Utils.setpoly(this.layer._crLine.arrow, a);
      } else if (this.dragType === 'random') {
        this.varCirc.attr({
          r: Utils.dist2points(this.getCx(), this.getCy(), nx, ny)
        });
      }
      GLB.drawDynamic();
    };

    Circle.prototype._mouseEnd = function(evt) {
      this.layer.lastCircle = this;
      if (this.dragType === 'left') {

      } else if (this.dragType === 'right' && this.layer.canCreate) {
        this.layer._crLine.now = '';
        this.layer._crLine.arrow.attr({
          points: ''
        });
      }
      this.dragType = 'none';
    };

    Circle.prototype.moveTo = function(nx, ny) {
      this.innerCirc.attr({
        cx: nx,
        cy: ny
      });
      this.outterCirc.attr({
        cx: nx,
        cy: ny
      });
      this.varCirc.attr({
        cx: nx,
        cy: ny
      });
    };

    Circle.prototype.changeInnerColor = function(color) {
      return this.innerCirc.attr({
        'fill': color
      });
    };

    Circle.prototype.makeInvisible = function() {
      this.innerCirc.attr({
        'fill-opacity': 0
      });
      this.outterCirc.attr({
        'fill-opacity': 0
      });
      this.varCirc.attr({
        'fill-opacity': 0
      });
    };

    Circle.prototype.makeVisible = function() {
      this.innerCirc.attr({
        'fill-opacity': 0.5
      });
      this.outterCirc.attr({
        'fill-opacity': 0.5
      });
      this.varCirc.attr({
        'fill-opacity': 0.3
      });
    };

    Circle.prototype.getBBox = function() {
      return this.group.getBBox();
    };

    Circle.prototype.remove = function() {
      this.group.remove();
      this.varCirc.remove();
    };

    Circle.prototype.getCx = function() {
      return parseFloat(this.innerCirc.attr('cx'));
    };

    Circle.prototype.getCy = function() {
      return parseFloat(this.innerCirc.attr('cy'));
    };

    Circle.prototype.removeInteractivity = function() {
      this.group.undrag();
    };

    return Circle;

  })();

  Arrow = (function() {
    function Arrow(layer, colNum, cStart, cEnd) {
      var setupArrowPolyline;
      setupArrowPolyline = (function(_this) {
        return function() {
          var arrow;
          arrow = _this;
          return layer.snap.polyline().attr({
            'fill': GLB.layers[arrow.colorNum].color,
            'fill-opacity': 0.8
          }).mousedown(function(evt) {
            var nowType;
            if (layer.canCreate) {
              nowType = Utils.buttonType(evt);
              if (evt.ctrlKey === true) {

              } else if (evt.altKey === true) {
                arrow.flipped *= -1;
                arrow.update();
              } else {
                if (nowType === 'left') {
                  arrow.colorNum = (arrow.colorNum + 1) % GLB.layers.length;
                  this.attr({
                    fill: GLB.layers[arrow.colorNum].color
                  });
                } else if (nowType === 'middle') {
                  layer.removeArrow(arrow);
                }
              }
            }
            return GLB.drawDynamic();
          });
        };
      })(this);
      this.circStart = cStart;
      this.circEnd = cEnd;
      this.colorNum = colNum;
      this.flipped = 1;
      this.poly = setupArrowPolyline();
      this.update();
    }

    Arrow.prototype.update = function() {
      var box1, box2;
      box1 = this.circStart.getBBox();
      box2 = this.circEnd.getBBox();
      if (this.flipped === 1) {
        Utils.setpoly(this.poly, Utils.getArrow(box1.cx, box1.cy, box2.cx, box2.cy, 15, 0));
      } else {

      }
      if (this.flipped === -1) {
        Utils.setpoly(this.poly, Utils.getArrow(box1.cx, box1.cy, box2.cx, box2.cy, 25, -1));
      }
    };

    Arrow.prototype.makeInvisible = function() {
      return this.poly.attr({
        'fill-opacity': 0
      });
    };

    Arrow.prototype.updateColor = function(newcol) {
      return this.poly.attr('fill', newcol);
    };

    Arrow.prototype.remove = function() {
      return this.poly.remove();
    };

    Arrow.prototype.makeVisible = function() {
      return this.poly.attr({
        'fill-opacity': 0.8
      });
    };

    return Arrow;

  })();

  Background = (function() {
    function Background(layer) {
      this.rect = layer.snap.rect(0, 0, GLB.width, GLB.height).attr({
        'fill': layer.color
      }).mouseup(function(evt) {
        var nx, ny;
        if (layer.canCreate) {
          if (Utils.buttonType(evt) === 'right' && layer._crLine.now !== 'dragging') {
            nx = evt.clientX;
            ny = evt.clientY;
            return layer.addCircle(nx, ny, 'gray');
          }
        }
      });
      this.makeVisible();
      return;
    }

    Background.prototype.makeInvisible = function() {
      this.rect.attr({
        'fill-opacity': 0
      });
      return this;
    };

    Background.prototype.makeVisible = function() {
      this.rect.attr({
        'fill-opacity': 0.2
      });
      return this;
    };

    Background.prototype.resize = function() {
      this.rect.attr({
        'width': GLB.width.toString(),
        'height': GLB.height.toString()
      });
      return this;
    };

    Background.prototype.changeColor = function(color) {
      this.rect.attr({
        'fill': color
      });
      return this;
    };

    return Background;

  })();

  LineLayer = (function() {
    function LineLayer(col, base) {
      var createInitialCircles;
      createInitialCircles = (function(_this) {
        return function() {
          if (_this.layerType === 'base') {
            _this.addCircle(100, 100, 'gray');
          } else {
            _this.addCircle(100, 100, 'green');
            _this.addCircle(200, 100, 'red');
            _this.circles[0].canBeRandom = _this.circles[1].canBeRandom = false;
          }
        };
      })(this);
      this.layerType = base;
      this.color = col;
      this.alpha = 1;
      this.canCreate = true;
      this.snap = Snap(GLB.width, GLB.height).attr({
        "class": 'absolute-pos'
      });
      this.arrows = [];
      this.circles = [];
      this.background = new Background(this);
      this.graph = [];
      this._crLine = {
        arrow: this.snap.polyline(),
        start: 0,
        stX: 0,
        stY: 0
      };
      this.SVGgroups = {
        SVGvisuals: this.snap.g(),
        SVGbackground: this.snap.g(),
        SVGarrows: this.snap.g(),
        SVGcircles: this.snap.g()
      };
      this.SVGgroups.SVGvisuals.add(this._crLine.arrow);
      createInitialCircles();
      this.lastCircle = this.circles[0];
    }

    LineLayer.prototype.resize = function() {
      var strHeight, strWidth;
      strWidth = GLB.width.toString();
      strHeight = GLB.height.toString();
      this.snap.node.setAttribute('width', strWidth);
      this.snap.node.setAttribute('height', strHeight);
      this.background.resize(GLB.width, GLB.height);
      this.SVGgroups.SVGbackground.attr({
        'width': strWidth,
        'height': strHeight
      });
    };

    LineLayer.prototype.makeInvisible = function() {
      var arrow, circle, _i, _j, _len, _len1, _ref, _ref1;
      this.background.makeInvisible();
      _ref = this.circles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        circle = _ref[_i];
        circle.makeInvisible();
      }
      _ref1 = this.arrows;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        arrow = _ref1[_j];
        arrow.makeInvisible();
      }
    };

    LineLayer.prototype.makeVisible = function() {
      var arrow, circle, _i, _j, _len, _len1, _ref, _ref1;
      this.background.makeVisible();
      _ref = this.circles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        circle = _ref[_i];
        circle.makeVisible();
      }
      _ref1 = this.arrows;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        arrow = _ref1[_j];
        arrow.makeVisible();
      }
    };

    LineLayer.prototype.addArrow = function(pos1, pos2) {
      var p;
      if (this.graph[pos1][pos2] === 0) {
        p = new Arrow(this, 0, this.circles[pos1], this.circles[pos2]);
        this.SVGgroups.SVGarrows.add(p.poly);
        this.graph[pos1][pos2] = p;
        this.arrows.push(p);
      }
    };

    LineLayer.prototype.removeArrow = function(arrow) {
      var i, j, _i, _ref;
      for (i = _i = 0, _ref = this.graph.length; _i < _ref; i = _i += 1) {
        j = this.graph[i].indexOf(line);
        if (j !== -1) {
          break;
        }
      }
      this.removeArrowAt(i, j);
    };

    LineLayer.prototype.removeArrowAt = function(line, col) {
      this.graph[i][j].remove();
      this.graph[i][j] = 0;
    };

    LineLayer.prototype.addCircle = function(x, y, outterColor) {
      var circle, i, ncircs, vec, _i;
      ncircs = this.circles.length;
      this.graph.push(Utils.array1D(ncircs, 0));
      for (i = _i = 0; _i <= ncircs; i = _i += 1) {
        this.graph[i].push(0);
      }
      vec = GLB.grid.getGridSnap(x, y);
      circle = new Circle(this, vec.x, vec.y, this.color, outterColor);
      if (this.layerType === 'base') {
        circle.canBeRandom = false;
      }
      this.SVGgroups.SVGcircles.add(circle.group);
      this.SVGgroups.SVGvisuals.add(circle.varCirc);
      this.circles.push(circle);
    };

    LineLayer.prototype.removeCircle = function(circ) {
      var i, pos, _i, _ref;
      pos = this.circles.indexOf(circ);
      this.removeIncidentLines(circ);
      if (pos > 1 || this.layerType === 'base') {
        circ.remove();
        this.graph.splice(pos, 1);
        for (i = _i = 0, _ref = this.graph.length; _i < _ref; i = _i += 1) {
          this.graph[i].splice(pos, 1);
        }
        this.circles.splice(pos, 1);
      }
    };

    LineLayer.prototype.changeColor = function(color) {
      var c, _i, _len, _ref;
      this.color = color;
      this.background.changeColor(color);
      _ref = this.circles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        c.changeInnerColor(color);
      }
    };

    LineLayer.prototype.changeLineColors = function(layNum, color) {
      var arrow, _i, _len, _ref;
      _ref = this.arrows;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arrow = _ref[_i];
        if (arrow.colorNum === layNum) {
          arrow.updateColor(color);
        }
      }
    };

    LineLayer.prototype.removeIncidentLines = function(circle) {
      var i, ind, _i, _ref;
      ind = this.circles.indexOf(circle);
      for (i = _i = 0, _ref = this.circles.length; _i < _ref; i = _i += 1) {
        if (this.graph[ind][i]) {
          this.removeArrowAt(ind, i);
        }
        if (this.graph[i][ind]) {
          this.removeArrowAt(i, ind);
        }
      }
    };

    LineLayer.prototype.updateArrows = function() {
      var arrow, _i, _len, _ref, _results;
      _ref = this.arrows;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arrow = _ref[_i];
        _results.push(arrow.update());
      }
      return _results;
    };

    LineLayer.prototype.getData = function() {
      var arrowList, box, c, dist01, graph, i, j, num, points, variation, _i, _j, _k;
      num = this.circles.length;
      graph = Utils.array2D(num, num, -1);
      points = [];
      for (i = _i = 0; _i < num; i = _i += 1) {
        box = this.circles[i].getBBox();
        points.push(new Vector(box.cx, box.cy));
      }
      for (i = _j = 0; _j < num; i = _j += 1) {
        for (j = _k = 0; _k < num; j = _k += 1) {
          if (this.graph[i][j]) {
            graph[i][j] = this.graph[i][j].colorNum;
          }
        }
      }
      if (points.length > 1) {
        dist01 = Utils.dist2points(points[0].x, points[0].y, points[1].x, points[1].y);
      } else {
        dist01 = 1;
      }
      variation = (function() {
        var _l, _len, _ref, _results;
        _ref = this.circles;
        _results = [];
        for (_l = 0, _len = _ref.length; _l < _len; _l++) {
          c = _ref[_l];
          _results.push(c.varCirc.attr('r') / dist01);
        }
        return _results;
      }).call(this);
      arrowList = Utils.listFromArray(graph, function(x) {
        return x !== -1;
      });
      return {
        graph: this.graph,
        raw: points,
        points: Utils.toUnitVectors(points),
        list: arrowList,
        variation: variation
      };
    };

    return LineLayer;

  })();
