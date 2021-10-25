"use strict";
var exports={};
Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getGlobalMatrix = getGlobalMatrix;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*!
 * matrix 3.6.1
 * https://greensock.com
 *
 * Copyright 2008-2021, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/
/* eslint-disable */

var _doc = void 0,
    _win = void 0,
    _docElement = void 0,
    _body = void 0,
    _divContainer = void 0,
    _svgContainer = void 0,
    _identityMatrix = void 0,
    _transformProp = "transform",
    _transformOriginProp = _transformProp + "Origin",
    _hasOffsetBug = void 0,
    _setDoc = function _setDoc(element) {
	var doc = element.ownerDocument || element;
	if (!(_transformProp in element.style) && "msTransform" in element.style) {
		//to improve compatibility with old Microsoft browsers
		_transformProp = "msTransform";
		_transformOriginProp = _transformProp + "Origin";
	}
	while (doc.parentNode && (doc = doc.parentNode)) {}
	_win = window;
	_identityMatrix = new Matrix2D();
	if (doc) {
		_doc = doc;
		_docElement = doc.documentElement;
		_body = doc.body;
		// now test for the offset reporting bug. Use feature detection instead of browser sniffing to make things more bulletproof and future-proof. Hopefully Safari will fix their bug soon but it's 2020 and it's still not fixed.
		var d1 = doc.createElement("div"),
		    d2 = doc.createElement("div");
		_body.appendChild(d1);
		d1.appendChild(d2);
		d1.style.position = "static";
		d1.style[_transformProp] = "translate3d(0,0,1px)";
		_hasOffsetBug = d2.offsetParent !== d1;
		_body.removeChild(d1);
	}
	return doc;
},
    _forceNonZeroScale = function _forceNonZeroScale(e) {
	// walks up the element's ancestors and finds any that had their scale set to 0 via GSAP, and changes them to 0.0001 to ensure that measurements work. Firefox has a bug that causes it to incorrectly report getBoundingClientRect() when scale is 0.
	var a = void 0,
	    cache = void 0;
	while (e && e !== _body) {
		cache = e._gsap;
		cache && cache.uncache && cache.get(e, "x"); // force re-parsing of transforms if necessary
		if (cache && !cache.scaleX && !cache.scaleY && cache.renderTransform) {
			cache.scaleX = cache.scaleY = 1e-4;
			cache.renderTransform(1, cache);
			a ? a.push(cache) : a = [cache];
		}
		e = e.parentNode;
	}
	return a;
},

// possible future addition: pass an element to _forceDisplay() and it'll walk up all its ancestors and make sure anything with display: none is set to display: block, and if there's no parentNode, it'll add it to the body. It returns an Array that you can then feed to _revertDisplay() to have it revert all the changes it made.
// _forceDisplay = e => {
// 	let a = [],
// 		parent;
// 	while (e && e !== _body) {
// 		parent = e.parentNode;
// 		(_win.getComputedStyle(e).display === "none" || !parent) && a.push(e, e.style.display, parent) && (e.style.display = "block");
// 		parent || _body.appendChild(e);
// 		e = parent;
// 	}
// 	return a;
// },
// _revertDisplay = a => {
// 	for (let i = 0; i < a.length; i+=3) {
// 		a[i+1] ? (a[i].style.display = a[i+1]) : a[i].style.removeProperty("display");
// 		a[i+2] || a[i].parentNode.removeChild(a[i]);
// 	}
// },
_svgTemps = [],
    //we create 3 elements for SVG, and 3 for other DOM elements and cache them for performance reasons. They get nested in _divContainer and _svgContainer so that just one element is added to the DOM on each successive attempt. Again, performance is key.
_divTemps = [],
    _getDocScrollTop = function _getDocScrollTop() {
	return _win.pageYOffset || _doc.scrollTop || _docElement.scrollTop || _body.scrollTop || 0;
},
    _getDocScrollLeft = function _getDocScrollLeft() {
	return _win.pageXOffset || _doc.scrollLeft || _docElement.scrollLeft || _body.scrollLeft || 0;
},
    _svgOwner = function _svgOwner(element) {
	return element.ownerSVGElement || ((element.tagName + "").toLowerCase() === "svg" ? element : null);
},
    _isFixed = function _isFixed(element) {
	if (_win.getComputedStyle(element).position === "fixed") {
		return true;
	}
	element = element.parentNode;
	if (element && element.nodeType === 1) {
		// avoid document fragments which will throw an error.
		return _isFixed(element);
	}
},
    _createSibling = function _createSibling(element, i) {
	if (element.parentNode && (_doc || _setDoc(element))) {
		var svg = _svgOwner(element),
		    ns = svg ? svg.getAttribute("xmlns") || "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xhtml",
		    type = svg ? i ? "rect" : "g" : "div",
		    x = i !== 2 ? 0 : 100,
		    y = i === 3 ? 100 : 0,
		    css = "position:absolute;display:block;pointer-events:none;margin:0;padding:0;",
		    e = _doc.createElementNS ? _doc.createElementNS(ns.replace(/^https/, "http"), type) : _doc.createElement(type);
		if (i) {
			if (!svg) {
				if (!_divContainer) {
					_divContainer = _createSibling(element);
					_divContainer.style.cssText = css;
				}
				e.style.cssText = css + "width:0.1px;height:0.1px;top:" + y + "px;left:" + x + "px";
				_divContainer.appendChild(e);
			} else {
				_svgContainer || (_svgContainer = _createSibling(element));
				e.setAttribute("width", 0.01);
				e.setAttribute("height", 0.01);
				e.setAttribute("transform", "translate(" + x + "," + y + ")");
				_svgContainer.appendChild(e);
			}
		}
		return e;
	}
	throw "Need document and parent.";
},
    _consolidate = function _consolidate(m) {
	// replaces SVGTransformList.consolidate() because a bug in Firefox causes it to break pointer events. See https://greensock.com/forums/topic/23248-touch-is-not-working-on-draggable-in-firefox-windows-v324/?tab=comments#comment-109800
	var c = new Matrix2D(),
	    i = 0;
	for (; i < m.numberOfItems; i++) {
		c.multiply(m.getItem(i).matrix);
	}
	return c;
},
    _placeSiblings = function _placeSiblings(element, adjustGOffset) {
	var svg = _svgOwner(element),
	    isRootSVG = element === svg,
	    siblings = svg ? _svgTemps : _divTemps,
	    parent = element.parentNode,
	    container = void 0,
	    m = void 0,
	    b = void 0,
	    x = void 0,
	    y = void 0,
	    cs = void 0;
	if (element === _win) {
		return element;
	}
	siblings.length || siblings.push(_createSibling(element, 1), _createSibling(element, 2), _createSibling(element, 3));
	container = svg ? _svgContainer : _divContainer;
	if (svg) {
		b = isRootSVG ? { x: 0, y: 0 } : element.getBBox();
		m = element.transform ? element.transform.baseVal : {}; // IE11 doesn't follow the spec.
		if (m.numberOfItems) {
			m = m.numberOfItems > 1 ? _consolidate(m) : m.getItem(0).matrix; // don't call m.consolidate().matrix because a bug in Firefox makes pointer events not work when consolidate() is called on the same tick as getBoundingClientRect()! See https://greensock.com/forums/topic/23248-touch-is-not-working-on-draggable-in-firefox-windows-v324/?tab=comments#comment-109800
			x = m.a * b.x + m.c * b.y;
			y = m.b * b.x + m.d * b.y;
		} else {
			m = _identityMatrix;
			x = b.x;
			y = b.y;
		}
		if (adjustGOffset && element.tagName.toLowerCase() === "g") {
			x = y = 0;
		}
		(isRootSVG ? svg : parent).appendChild(container);
		container.setAttribute("transform", "matrix(" + m.a + "," + m.b + "," + m.c + "," + m.d + "," + (m.e + x) + "," + (m.f + y) + ")");
	} else {
		x = y = 0;
		if (_hasOffsetBug) {
			// some browsers (like Safari) have a bug that causes them to misreport offset values. When an ancestor element has a transform applied, it's supposed to treat it as if it's position: relative (new context). Safari botches this, so we need to find the closest ancestor (between the element and its offsetParent) that has a transform applied and if one is found, grab its offsetTop/Left and subtract them to compensate.
			m = element.offsetParent;
			b = element;
			while (b && (b = b.parentNode) && b !== m && b.parentNode) {
				if ((_win.getComputedStyle(b)[_transformProp] + "").length > 4) {
					x = b.offsetLeft;
					y = b.offsetTop;
					b = 0;
				}
			}
		}
		cs = _win.getComputedStyle(element);
		if (cs.position !== "absolute") {
			m = element.offsetParent;
			while (parent && parent !== m) {
				// if there's an ancestor element between the element and its offsetParent that's scrolled, we must factor that in.
				x += parent.scrollLeft || 0;
				y += parent.scrollTop || 0;
				parent = parent.parentNode;
			}
		}
		b = container.style;
		b.top = element.offsetTop - y + "px";
		b.left = element.offsetLeft - x + "px";
		b[_transformProp] = cs[_transformProp];
		b[_transformOriginProp] = cs[_transformOriginProp];
		// b.border = m.border;
		// b.borderLeftStyle = m.borderLeftStyle;
		// b.borderTopStyle = m.borderTopStyle;
		// b.borderLeftWidth = m.borderLeftWidth;
		// b.borderTopWidth = m.borderTopWidth;
		b.position = cs.position === "fixed" ? "fixed" : "absolute";
		element.parentNode.appendChild(container);
	}
	return container;
},
    _setMatrix = function _setMatrix(m, a, b, c, d, e, f) {
	m.a = a;
	m.b = b;
	m.c = c;
	m.d = d;
	m.e = e;
	m.f = f;
	return m;
};

var Matrix2D = exports.Matrix2D = function () {
	function Matrix2D() {
		var a = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
		var b = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
		var c = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
		var d = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];
		var e = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];
		var f = arguments.length <= 5 || arguments[5] === undefined ? 0 : arguments[5];

		_classCallCheck(this, Matrix2D);

		_setMatrix(this, a, b, c, d, e, f);
	}

	_createClass(Matrix2D, [{
		key: "inverse",
		value: function inverse() {
			var a = this.a;
			var b = this.b;
			var c = this.c;
			var d = this.d;
			var e = this.e;
			var f = this.f;
			var determinant = a * d - b * c || 1e-10;
			return _setMatrix(this, d / determinant, -b / determinant, -c / determinant, a / determinant, (c * f - d * e) / determinant, -(a * f - b * e) / determinant);
		}
	}, {
		key: "multiply",
		value: function multiply(matrix) {
			var a = this.a;
			var b = this.b;
			var c = this.c;
			var d = this.d;
			var e = this.e;
			var f = this.f;
			var a2 = matrix.a;
			var b2 = matrix.c;
			var c2 = matrix.b;
			var d2 = matrix.d;
			var e2 = matrix.e;
			var f2 = matrix.f;
			return _setMatrix(this, a2 * a + c2 * c, a2 * b + c2 * d, b2 * a + d2 * c, b2 * b + d2 * d, e + e2 * a + f2 * c, f + e2 * b + f2 * d);
		}
	}, {
		key: "clone",
		value: function clone() {
			return new Matrix2D(this.a, this.b, this.c, this.d, this.e, this.f);
		}
	}, {
		key: "equals",
		value: function equals(matrix) {
			var a = this.a;
			var b = this.b;
			var c = this.c;
			var d = this.d;
			var e = this.e;
			var f = this.f;

			return a === matrix.a && b === matrix.b && c === matrix.c && d === matrix.d && e === matrix.e && f === matrix.f;
		}
	}, {
		key: "apply",
		value: function apply(point) {
			var decoratee = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
			var x = point.x;
			var y = point.y;
			var a = this.a;
			var b = this.b;
			var c = this.c;
			var d = this.d;
			var e = this.e;
			var f = this.f;

			decoratee.x = x * a + y * c + e || 0;
			decoratee.y = x * b + y * d + f || 0;
			return decoratee;
		}
	}]);

	return Matrix2D;
}();

// Feed in an element and it'll return a 2D matrix (optionally inverted) so that you can translate between coordinate spaces.
// Inverting lets you translate a global point into a local coordinate space. No inverting lets you go the other way.
// We needed this to work around various browser bugs, like Firefox doesn't accurately report getScreenCTM() when there
// are transforms applied to ancestor elements.
// The matrix math to convert any x/y coordinate is as follows, which is wrapped in a convenient apply() method of Matrix2D above:
//     tx = m.a * x + m.c * y + m.e
//     ty = m.b * x + m.d * y + m.f


function getGlobalMatrix(element, inverse, adjustGOffset, includeScrollInFixed) {
	// adjustGOffset is typically used only when grabbing an element's PARENT's global matrix, and it ignores the x/y offset of any SVG <g> elements because they behave in a special way.
	if (!element || !element.parentNode || (_doc || _setDoc(element)).documentElement === element) {
		return new Matrix2D();
	}
	var zeroScales = _forceNonZeroScale(element),
	    svg = _svgOwner(element),
	    temps = svg ? _svgTemps : _divTemps,
	    container = _placeSiblings(element, adjustGOffset),
	    b1 = temps[0].getBoundingClientRect(),
	    b2 = temps[1].getBoundingClientRect(),
	    b3 = temps[2].getBoundingClientRect(),
	    parent = container.parentNode,
	    isFixed = !includeScrollInFixed && _isFixed(element),
	    m = new Matrix2D((b2.left - b1.left) / 100, (b2.top - b1.top) / 100, (b3.left - b1.left) / 100, (b3.top - b1.top) / 100, b1.left + (isFixed ? 0 : _getDocScrollLeft()), b1.top + (isFixed ? 0 : _getDocScrollTop()));
	parent.removeChild(container);
	if (zeroScales) {
		b1 = zeroScales.length;
		while (b1--) {
			b2 = zeroScales[b1];
			b2.scaleX = b2.scaleY = 0;
			b2.renderTransform(1, b2);
		}
	}
	return inverse ? m.inverse() : m;
}

exports._getDocScrollTop = _getDocScrollTop;
exports._getDocScrollLeft = _getDocScrollLeft;
exports._setDoc = _setDoc;

// export function getMatrix(element) {
// 	_doc || _setDoc(element);
// 	let m = (_win.getComputedStyle(element)[_transformProp] + "").substr(7).match(/[-.]*\d+[.e\-+]*\d*[e\-\+]*\d*/g),
// 		is2D = m && m.length === 6;
// 	return !m || m.length < 6 ? new Matrix2D() : new Matrix2D(+m[0], +m[1], +m[is2D ? 2 : 4], +m[is2D ? 3 : 5], +m[is2D ? 4 : 12], +m[is2D ? 5 : 13]);
// }


"use strict";
var exports2={};
Object.defineProperty(exports2, "__esModule", {
	value: true
});
exports2.getRawPath = getRawPath;
exports2.copyRawPath = copyRawPath;
exports2.reverseSegment = reverseSegment;
exports2.convertToPath = convertToPath;
exports2.getRotationAtProgress = getRotationAtProgress;
exports2.sliceRawPath = sliceRawPath;
exports2.cacheRawPathMeasurements = cacheRawPathMeasurements;
exports2.subdivideSegment = subdivideSegment;
exports2.getPositionOnPath = getPositionOnPath;
exports2.transformRawPath = transformRawPath;
exports2.stringToRawPath = stringToRawPath;
exports2.bezierToPoints = bezierToPoints;
exports2.flatPointsToSegment = flatPointsToSegment;
exports2.pointsToSegment = pointsToSegment;
exports2.simplifyPoints = simplifyPoints;
exports2.getClosestData = getClosestData;
exports2.subdivideSegmentNear = subdivideSegmentNear;
exports2.rawPathToString = rawPathToString;
/*!
 * paths 3.6.1
 * https://greensock.com
 *
 * Copyright 2008-2021, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/
/* eslint-disable */

var _svgPathExp = /[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig,
    _numbersExp = /(?:(-)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig,
    _scientific = /[\+\-]?\d*\.?\d+e[\+\-]?\d+/ig,
    _selectorExp = /(^[#\.][a-z]|[a-y][a-z])/i,
    _DEG2RAD = Math.PI / 180,
    _RAD2DEG = 180 / Math.PI,
    _sin = Math.sin,
    _cos = Math.cos,
    _abs = Math.abs,
    _sqrt = Math.sqrt,
    _atan2 = Math.atan2,
    _largeNum = 1e8,
    _isString = function _isString(value) {
	return typeof value === "string";
},
    _isNumber = function _isNumber(value) {
	return typeof value === "number";
},
    _isUndefined = function _isUndefined(value) {
	return typeof value === "undefined";
},
    _temp = {},
    _temp2 = {},
    _roundingNum = 1e5,
    _wrapProgress = function _wrapProgress(progress) {
	return Math.round((progress + _largeNum) % 1 * _roundingNum) / _roundingNum || (progress < 0 ? 0 : 1);
},
    //if progress lands on 1, the % will make it 0 which is why we || 1, but not if it's negative because it makes more sense for motion to end at 0 in that case.
_round = function _round(value) {
	return Math.round(value * _roundingNum) / _roundingNum || 0;
},
    _roundPrecise = function _roundPrecise(value) {
	return Math.round(value * 1e10) / 1e10 || 0;
},
    _splitSegment = function _splitSegment(rawPath, segIndex, i, t) {
	var segment = rawPath[segIndex],
	    shift = t === 1 ? 6 : subdivideSegment(segment, i, t);
	if (shift && shift + i + 2 < segment.length) {
		rawPath.splice(segIndex, 0, segment.slice(0, i + shift + 2));
		segment.splice(0, i + shift);
		return 1;
	}
},
    _reverseRawPath = function _reverseRawPath(rawPath, skipOuter) {
	var i = rawPath.length;
	skipOuter || rawPath.reverse();
	while (i--) {
		rawPath[i].reversed || reverseSegment(rawPath[i]);
	}
},
    _copyMetaData = function _copyMetaData(source, copy) {
	copy.totalLength = source.totalLength;
	if (source.samples) {
		//segment
		copy.samples = source.samples.slice(0);
		copy.lookup = source.lookup.slice(0);
		copy.minLength = source.minLength;
		copy.resolution = source.resolution;
	} else if (source.totalPoints) {
		//rawPath
		copy.totalPoints = source.totalPoints;
	}
	return copy;
},

//pushes a new segment into a rawPath, but if its starting values match the ending values of the last segment, it'll merge it into that same segment (to reduce the number of segments)
_appendOrMerge = function _appendOrMerge(rawPath, segment) {
	var index = rawPath.length,
	    prevSeg = rawPath[index - 1] || [],
	    l = prevSeg.length;
	if (index && segment[0] === prevSeg[l - 2] && segment[1] === prevSeg[l - 1]) {
		segment = prevSeg.concat(segment.slice(2));
		index--;
	}
	rawPath[index] = segment;
},
    _bestDistance = void 0;

/* TERMINOLOGY
 - RawPath - an array of arrays, one for each Segment. A single RawPath could have multiple "M" commands, defining Segments (paths aren't always connected).
 - Segment - an array containing a sequence of Cubic Bezier coordinates in alternating x, y, x, y format. Starting anchor, then control point 1, control point 2, and ending anchor, then the next control point 1, control point 2, anchor, etc. Uses less memory than an array with a bunch of {x, y} points.
 - Bezier - a single cubic Bezier with a starting anchor, two control points, and an ending anchor.
 - the variable "t" is typically the position along an individual Bezier path (time) and it's NOT linear, meaning it could accelerate/decelerate based on the control points whereas the "p" or "progress" value is linearly mapped to the whole path, so it shouldn't really accelerate/decelerate based on control points. So a progress of 0.2 would be almost exactly 20% along the path. "t" is ONLY in an individual Bezier piece.
 */

//accepts basic selector text, a path instance, a RawPath instance, or a Segment and returns a RawPath (makes it easy to homogenize things). If an element or selector text is passed in, it'll also cache the value so that if it's queried again, it'll just take the path data from there instead of parsing it all over again (as long as the path data itself hasn't changed - it'll check).
function getRawPath(value) {
	value = _isString(value) && _selectorExp.test(value) ? document.querySelector(value) || value : value;
	var e = value.getAttribute ? value : 0,
	    rawPath = void 0;
	if (e && (value = value.getAttribute("d"))) {
		//implements caching
		if (!e._gsPath) {
			e._gsPath = {};
		}
		rawPath = e._gsPath[value];
		return rawPath && !rawPath._dirty ? rawPath : e._gsPath[value] = stringToRawPath(value);
	}
	return !value ? console.warn("Expecting a <path> element or an SVG path data string") : _isString(value) ? stringToRawPath(value) : _isNumber(value[0]) ? [value] : value;
}

//copies a RawPath WITHOUT the length meta data (for speed)
function copyRawPath(rawPath) {
	var a = [],
	    i = 0;
	for (; i < rawPath.length; i++) {
		a[i] = _copyMetaData(rawPath[i], rawPath[i].slice(0));
	}
	return _copyMetaData(rawPath, a);
}

function reverseSegment(segment) {
	var i = 0,
	    y = void 0;
	segment.reverse(); //this will invert the order y, x, y, x so we must flip it back.
	for (; i < segment.length; i += 2) {
		y = segment[i];
		segment[i] = segment[i + 1];
		segment[i + 1] = y;
	}
	segment.reversed = !segment.reversed;
}

var _createPath = function _createPath(e, ignore) {
	var path = document.createElementNS("http://www.w3.org/2000/svg", "path"),
	    attr = [].slice.call(e.attributes),
	    i = attr.length,
	    name = void 0;
	ignore = "," + ignore + ",";
	while (--i > -1) {
		name = attr[i].nodeName.toLowerCase(); //in Microsoft Edge, if you don't set the attribute with a lowercase name, it doesn't render correctly! Super weird.
		if (ignore.indexOf("," + name + ",") < 0) {
			path.setAttributeNS(null, name, attr[i].nodeValue);
		}
	}
	return path;
},
    _typeAttrs = {
	rect: "rx,ry,x,y,width,height",
	circle: "r,cx,cy",
	ellipse: "rx,ry,cx,cy",
	line: "x1,x2,y1,y2"
},
    _attrToObj = function _attrToObj(e, attrs) {
	var props = attrs ? attrs.split(",") : [],
	    obj = {},
	    i = props.length;
	while (--i > -1) {
		obj[props[i]] = +e.getAttribute(props[i]) || 0;
	}
	return obj;
};

//converts an SVG shape like <circle>, <rect>, <polygon>, <polyline>, <ellipse>, etc. to a <path>, swapping it in and copying the attributes to match.
function convertToPath(element, swap) {
	var type = element.tagName.toLowerCase(),
	    circ = 0.552284749831,
	    data = void 0,
	    x = void 0,
	    y = void 0,
	    r = void 0,
	    ry = void 0,
	    path = void 0,
	    rcirc = void 0,
	    rycirc = void 0,
	    points = void 0,
	    w = void 0,
	    h = void 0,
	    x2 = void 0,
	    x3 = void 0,
	    x4 = void 0,
	    x5 = void 0,
	    x6 = void 0,
	    y2 = void 0,
	    y3 = void 0,
	    y4 = void 0,
	    y5 = void 0,
	    y6 = void 0,
	    attr = void 0;
	if (type === "path" || !element.getBBox) {
		return element;
	}
	path = _createPath(element, "x,y,width,height,cx,cy,rx,ry,r,x1,x2,y1,y2,points");
	attr = _attrToObj(element, _typeAttrs[type]);
	if (type === "rect") {
		r = attr.rx;
		ry = attr.ry || r;
		x = attr.x;
		y = attr.y;
		w = attr.width - r * 2;
		h = attr.height - ry * 2;
		if (r || ry) {
			//if there are rounded corners, render cubic beziers
			x2 = x + r * (1 - circ);
			x3 = x + r;
			x4 = x3 + w;
			x5 = x4 + r * circ;
			x6 = x4 + r;
			y2 = y + ry * (1 - circ);
			y3 = y + ry;
			y4 = y3 + h;
			y5 = y4 + ry * circ;
			y6 = y4 + ry;
			data = "M" + x6 + "," + y3 + " V" + y4 + " C" + [x6, y5, x5, y6, x4, y6, x4 - (x4 - x3) / 3, y6, x3 + (x4 - x3) / 3, y6, x3, y6, x2, y6, x, y5, x, y4, x, y4 - (y4 - y3) / 3, x, y3 + (y4 - y3) / 3, x, y3, x, y2, x2, y, x3, y, x3 + (x4 - x3) / 3, y, x4 - (x4 - x3) / 3, y, x4, y, x5, y, x6, y2, x6, y3].join(",") + "z";
		} else {
			data = "M" + (x + w) + "," + y + " v" + h + " h" + -w + " v" + -h + " h" + w + "z";
		}
	} else if (type === "circle" || type === "ellipse") {
		if (type === "circle") {
			r = ry = attr.r;
			rycirc = r * circ;
		} else {
			r = attr.rx;
			ry = attr.ry;
			rycirc = ry * circ;
		}
		x = attr.cx;
		y = attr.cy;
		rcirc = r * circ;
		data = "M" + (x + r) + "," + y + " C" + [x + r, y + rycirc, x + rcirc, y + ry, x, y + ry, x - rcirc, y + ry, x - r, y + rycirc, x - r, y, x - r, y - rycirc, x - rcirc, y - ry, x, y - ry, x + rcirc, y - ry, x + r, y - rycirc, x + r, y].join(",") + "z";
	} else if (type === "line") {
		data = "M" + attr.x1 + "," + attr.y1 + " L" + attr.x2 + "," + attr.y2; //previously, we just converted to "Mx,y Lx,y" but Safari has bugs that cause that not to render properly when using a stroke-dasharray that's not fully visible! Using a cubic bezier fixes that issue.
	} else if (type === "polyline" || type === "polygon") {
		points = (element.getAttribute("points") + "").match(_numbersExp) || [];
		x = points.shift();
		y = points.shift();
		data = "M" + x + "," + y + " L" + points.join(",");
		if (type === "polygon") {
			data += "," + x + "," + y + "z";
		}
	}
	path.setAttribute("d", rawPathToString(path._gsRawPath = stringToRawPath(data)));
	if (swap && element.parentNode) {
		element.parentNode.insertBefore(path, element);
		element.parentNode.removeChild(element);
	}
	return path;
}

//returns the rotation (in degrees) at a particular progress on a rawPath (the slope of the tangent)
function getRotationAtProgress(rawPath, progress) {
	var d = getProgressData(rawPath, progress >= 1 ? 1 - 1e-9 : progress ? progress : 1e-9);
	return getRotationAtBezierT(d.segment, d.i, d.t);
}

function getRotationAtBezierT(segment, i, t) {
	var a = segment[i],
	    b = segment[i + 2],
	    c = segment[i + 4],
	    x = void 0;
	a += (b - a) * t;
	b += (c - b) * t;
	a += (b - a) * t;
	x = b + (c + (segment[i + 6] - c) * t - b) * t - a;
	a = segment[i + 1];
	b = segment[i + 3];
	c = segment[i + 5];
	a += (b - a) * t;
	b += (c - b) * t;
	a += (b - a) * t;
	return _round(_atan2(b + (c + (segment[i + 7] - c) * t - b) * t - a, x) * _RAD2DEG);
}

function sliceRawPath(rawPath, start, end) {
	end = _isUndefined(end) ? 1 : _roundPrecise(end) || 0; // we must round to avoid issues like 4.15 / 8 = 0.8300000000000001 instead of 0.83 or 2.8 / 5 = 0.5599999999999999 instead of 0.56 and if someone is doing a loop like start: 2.8 / 0.5, end: 2.8 / 0.5 + 1.
	start = _roundPrecise(start) || 0;
	var loops = Math.max(0, ~~(_abs(end - start) - 1e-8)),
	    path = copyRawPath(rawPath);
	if (start > end) {
		start = 1 - start;
		end = 1 - end;
		_reverseRawPath(path);
		path.totalLength = 0;
	}
	if (start < 0 || end < 0) {
		var offset = Math.abs(~~Math.min(start, end)) + 1;
		start += offset;
		end += offset;
	}
	path.totalLength || cacheRawPathMeasurements(path);
	var wrap = end > 1,
	    s = getProgressData(path, start, _temp, true),
	    e = getProgressData(path, end, _temp2),
	    eSeg = e.segment,
	    sSeg = s.segment,
	    eSegIndex = e.segIndex,
	    sSegIndex = s.segIndex,
	    ei = e.i,
	    si = s.i,
	    sameSegment = sSegIndex === eSegIndex,
	    sameBezier = ei === si && sameSegment,
	    wrapsBehind = void 0,
	    sShift = void 0,
	    eShift = void 0,
	    i = void 0,
	    copy = void 0,
	    totalSegments = void 0,
	    l = void 0,
	    j = void 0;
	if (wrap || loops) {
		wrapsBehind = eSegIndex < sSegIndex || sameSegment && ei < si || sameBezier && e.t < s.t;
		if (_splitSegment(path, sSegIndex, si, s.t)) {
			sSegIndex++;
			if (!wrapsBehind) {
				eSegIndex++;
				if (sameBezier) {
					e.t = (e.t - s.t) / (1 - s.t);
					ei = 0;
				} else if (sameSegment) {
					ei -= si;
				}
			}
		}
		if (1 - (end - start) < 1e-5) {
			eSegIndex = sSegIndex - 1;
		} else if (!e.t && eSegIndex) {
			eSegIndex--;
		} else if (_splitSegment(path, eSegIndex, ei, e.t) && wrapsBehind) {
			sSegIndex++;
		}
		if (s.t === 1) {
			sSegIndex = (sSegIndex + 1) % path.length;
		}
		copy = [];
		totalSegments = path.length;
		l = 1 + totalSegments * loops;
		j = sSegIndex;
		l += (totalSegments - sSegIndex + eSegIndex) % totalSegments;
		for (i = 0; i < l; i++) {
			_appendOrMerge(copy, path[j++ % totalSegments]);
		}
		path = copy;
	} else {
		eShift = e.t === 1 ? 6 : subdivideSegment(eSeg, ei, e.t);
		if (start !== end) {
			sShift = subdivideSegment(sSeg, si, sameBezier ? s.t / e.t : s.t);
			sameSegment && (eShift += sShift);
			eSeg.splice(ei + eShift + 2);
			(sShift || si) && sSeg.splice(0, si + sShift);
			i = path.length;
			while (i--) {
				//chop off any extra segments
				(i < sSegIndex || i > eSegIndex) && path.splice(i, 1);
			}
		} else {
			eSeg.angle = getRotationAtBezierT(eSeg, ei + eShift, 0); //record the value before we chop because it'll be impossible to determine the angle after its length is 0!
			ei += eShift;
			s = eSeg[ei];
			e = eSeg[ei + 1];
			eSeg.length = eSeg.totalLength = 0;
			eSeg.totalPoints = path.totalPoints = 8;
			eSeg.push(s, e, s, e, s, e, s, e);
		}
	}
	path.totalLength = 0;
	return path;
}

//measures a Segment according to its resolution (so if segment.resolution is 6, for example, it'll take 6 samples equally across each Bezier) and create/populate a "samples" Array that has the length up to each of those sample points (always increasing from the start) as well as a "lookup" array that's broken up according to the smallest distance between 2 samples. This gives us a very fast way of looking up a progress position rather than looping through all the points/Beziers. You can optionally have it only measure a subset, starting at startIndex and going for a specific number of beziers (remember, there are 3 x/y pairs each, for a total of 6 elements for each Bezier). It will also populate a "totalLength" property, but that's not generally super accurate because by default it'll only take 6 samples per Bezier. But for performance reasons, it's perfectly adequate for measuring progress values along the path. If you need a more accurate totalLength, either increase the resolution or use the more advanced bezierToPoints() method which keeps adding points until they don't deviate by more than a certain precision value.
function measureSegment(segment, startIndex, bezierQty) {
	startIndex = startIndex || 0;
	if (!segment.samples) {
		segment.samples = [];
		segment.lookup = [];
	}
	var resolution = ~~segment.resolution || 12,
	    inc = 1 / resolution,
	    endIndex = bezierQty ? startIndex + bezierQty * 6 + 1 : segment.length,
	    x1 = segment[startIndex],
	    y1 = segment[startIndex + 1],
	    samplesIndex = startIndex ? startIndex / 6 * resolution : 0,
	    samples = segment.samples,
	    lookup = segment.lookup,
	    min = (startIndex ? segment.minLength : _largeNum) || _largeNum,
	    prevLength = samples[samplesIndex + bezierQty * resolution - 1],
	    length = startIndex ? samples[samplesIndex - 1] : 0,
	    i = void 0,
	    j = void 0,
	    x4 = void 0,
	    x3 = void 0,
	    x2 = void 0,
	    xd = void 0,
	    xd1 = void 0,
	    y4 = void 0,
	    y3 = void 0,
	    y2 = void 0,
	    yd = void 0,
	    yd1 = void 0,
	    inv = void 0,
	    t = void 0,
	    lengthIndex = void 0,
	    l = void 0,
	    segLength = void 0;
	samples.length = lookup.length = 0;
	for (j = startIndex + 2; j < endIndex; j += 6) {
		x4 = segment[j + 4] - x1;
		x3 = segment[j + 2] - x1;
		x2 = segment[j] - x1;
		y4 = segment[j + 5] - y1;
		y3 = segment[j + 3] - y1;
		y2 = segment[j + 1] - y1;
		xd = xd1 = yd = yd1 = 0;
		if (_abs(x4) < 1e-5 && _abs(y4) < 1e-5 && _abs(x2) + _abs(y2) < 1e-5) {
			//dump points that are sufficiently close (basically right on top of each other, making a bezier super tiny or 0 length)
			if (segment.length > 8) {
				segment.splice(j, 6);
				j -= 6;
				endIndex -= 6;
			}
		} else {
			for (i = 1; i <= resolution; i++) {
				t = inc * i;
				inv = 1 - t;
				xd = xd1 - (xd1 = (t * t * x4 + 3 * inv * (t * x3 + inv * x2)) * t);
				yd = yd1 - (yd1 = (t * t * y4 + 3 * inv * (t * y3 + inv * y2)) * t);
				l = _sqrt(yd * yd + xd * xd);
				if (l < min) {
					min = l;
				}
				length += l;
				samples[samplesIndex++] = length;
			}
		}
		x1 += x4;
		y1 += y4;
	}
	if (prevLength) {
		prevLength -= length;
		for (; samplesIndex < samples.length; samplesIndex++) {
			samples[samplesIndex] += prevLength;
		}
	}
	if (samples.length && min) {
		segment.totalLength = segLength = samples[samples.length - 1] || 0;
		segment.minLength = min;
		l = lengthIndex = 0;
		for (i = 0; i < segLength; i += min) {
			lookup[l++] = samples[lengthIndex] < i ? ++lengthIndex : lengthIndex;
		}
	} else {
		segment.totalLength = samples[0] = 0;
	}
	return startIndex ? length - samples[startIndex / 2 - 1] : length;
}

function cacheRawPathMeasurements(rawPath, resolution) {
	var pathLength = void 0,
	    points = void 0,
	    i = void 0;
	for (i = pathLength = points = 0; i < rawPath.length; i++) {
		rawPath[i].resolution = ~~resolution || 12; //steps per Bezier curve (anchor, 2 control points, to anchor)
		points += rawPath[i].length;
		pathLength += measureSegment(rawPath[i]);
	}
	rawPath.totalPoints = points;
	rawPath.totalLength = pathLength;
	return rawPath;
}

//divide segment[i] at position t (value between 0 and 1, progress along that particular cubic bezier segment that starts at segment[i]). Returns how many elements were spliced into the segment array (either 0 or 6)
function subdivideSegment(segment, i, t) {
	if (t <= 0 || t >= 1) {
		return 0;
	}
	var ax = segment[i],
	    ay = segment[i + 1],
	    cp1x = segment[i + 2],
	    cp1y = segment[i + 3],
	    cp2x = segment[i + 4],
	    cp2y = segment[i + 5],
	    bx = segment[i + 6],
	    by = segment[i + 7],
	    x1a = ax + (cp1x - ax) * t,
	    x2 = cp1x + (cp2x - cp1x) * t,
	    y1a = ay + (cp1y - ay) * t,
	    y2 = cp1y + (cp2y - cp1y) * t,
	    x1 = x1a + (x2 - x1a) * t,
	    y1 = y1a + (y2 - y1a) * t,
	    x2a = cp2x + (bx - cp2x) * t,
	    y2a = cp2y + (by - cp2y) * t;
	x2 += (x2a - x2) * t;
	y2 += (y2a - y2) * t;
	segment.splice(i + 2, 4, _round(x1a), //first control point
	_round(y1a), _round(x1), //second control point
	_round(y1), _round(x1 + (x2 - x1) * t), //new fabricated anchor on line
	_round(y1 + (y2 - y1) * t), _round(x2), //third control point
	_round(y2), _round(x2a), //fourth control point
	_round(y2a));
	segment.samples && segment.samples.splice(i / 6 * segment.resolution | 0, 0, 0, 0, 0, 0, 0, 0);
	return 6;
}

// returns an object {path, segment, segIndex, i, t}
function getProgressData(rawPath, progress, decoratee, pushToNextIfAtEnd) {
	decoratee = decoratee || {};
	rawPath.totalLength || cacheRawPathMeasurements(rawPath);
	if (progress < 0 || progress > 1) {
		progress = _wrapProgress(progress);
	}
	var segIndex = 0,
	    segment = rawPath[0],
	    samples = void 0,
	    resolution = void 0,
	    length = void 0,
	    min = void 0,
	    max = void 0,
	    i = void 0,
	    t = void 0;
	if (!progress) {
		t = i = segIndex = 0;
		segment = rawPath[0];
	} else if (progress === 1) {
		t = 1;
		segIndex = rawPath.length - 1;
		segment = rawPath[segIndex];
		i = segment.length - 8;
	} else {
		if (rawPath.length > 1) {
			//speed optimization: most of the time, there's only one segment so skip the recursion.
			length = rawPath.totalLength * progress;
			max = i = 0;
			while ((max += rawPath[i++].totalLength) < length) {
				segIndex = i;
			}
			segment = rawPath[segIndex];
			min = max - segment.totalLength;
			progress = (length - min) / (max - min) || 0;
		}
		samples = segment.samples;
		resolution = segment.resolution; //how many samples per cubic bezier chunk
		length = segment.totalLength * progress;
		i = segment.lookup[~~(length / segment.minLength)] || 0;
		min = i ? samples[i - 1] : 0;
		max = samples[i];
		if (max < length) {
			min = max;
			max = samples[++i];
		}
		t = 1 / resolution * ((length - min) / (max - min) + i % resolution);
		i = ~~(i / resolution) * 6;
		if (pushToNextIfAtEnd && t === 1) {
			if (i + 6 < segment.length) {
				i += 6;
				t = 0;
			} else if (segIndex + 1 < rawPath.length) {
				i = t = 0;
				segment = rawPath[++segIndex];
			}
		}
	}
	decoratee.t = t;
	decoratee.i = i;
	decoratee.path = rawPath;
	decoratee.segment = segment;
	decoratee.segIndex = segIndex;
	return decoratee;
}

function getPositionOnPath(rawPath, progress, includeAngle, point) {
	var segment = rawPath[0],
	    result = point || {},
	    samples = void 0,
	    resolution = void 0,
	    length = void 0,
	    min = void 0,
	    max = void 0,
	    i = void 0,
	    t = void 0,
	    a = void 0,
	    inv = void 0;
	if (progress < 0 || progress > 1) {
		progress = _wrapProgress(progress);
	}
	if (rawPath.length > 1) {
		//speed optimization: most of the time, there's only one segment so skip the recursion.
		length = rawPath.totalLength * progress;
		max = i = 0;
		while ((max += rawPath[i++].totalLength) < length) {
			segment = rawPath[i];
		}
		min = max - segment.totalLength;
		progress = (length - min) / (max - min) || 0;
	}
	samples = segment.samples;
	resolution = segment.resolution;
	length = segment.totalLength * progress;
	i = segment.lookup[progress < 1 ? ~~(length / segment.minLength) : segment.lookup.length - 1] || 0;
	min = i ? samples[i - 1] : 0;
	max = samples[i];
	if (max < length) {
		min = max;
		max = samples[++i];
	}
	t = 1 / resolution * ((length - min) / (max - min) + i % resolution) || 0;
	inv = 1 - t;
	i = ~~(i / resolution) * 6;
	a = segment[i];
	result.x = _round((t * t * (segment[i + 6] - a) + 3 * inv * (t * (segment[i + 4] - a) + inv * (segment[i + 2] - a))) * t + a);
	result.y = _round((t * t * (segment[i + 7] - (a = segment[i + 1])) + 3 * inv * (t * (segment[i + 5] - a) + inv * (segment[i + 3] - a))) * t + a);
	if (includeAngle) {
		result.angle = segment.totalLength ? getRotationAtBezierT(segment, i, t >= 1 ? 1 - 1e-9 : t ? t : 1e-9) : segment.angle || 0;
	}
	return result;
}

//applies a matrix transform to RawPath (or a segment in a RawPath) and returns whatever was passed in (it transforms the values in the array(s), not a copy).
function transformRawPath(rawPath, a, b, c, d, tx, ty) {
	var j = rawPath.length,
	    segment = void 0,
	    l = void 0,
	    i = void 0,
	    x = void 0,
	    y = void 0;
	while (--j > -1) {
		segment = rawPath[j];
		l = segment.length;
		for (i = 0; i < l; i += 2) {
			x = segment[i];
			y = segment[i + 1];
			segment[i] = x * a + y * c + tx;
			segment[i + 1] = x * b + y * d + ty;
		}
	}
	rawPath._dirty = 1;
	return rawPath;
}

// translates SVG arc data into a segment (cubic beziers). Angle is in degrees.
function arcToSegment(lastX, lastY, rx, ry, angle, largeArcFlag, sweepFlag, x, y) {
	if (lastX === x && lastY === y) {
		return;
	}
	rx = _abs(rx);
	ry = _abs(ry);
	var angleRad = angle % 360 * _DEG2RAD,
	    cosAngle = _cos(angleRad),
	    sinAngle = _sin(angleRad),
	    PI = Math.PI,
	    TWOPI = PI * 2,
	    dx2 = (lastX - x) / 2,
	    dy2 = (lastY - y) / 2,
	    x1 = cosAngle * dx2 + sinAngle * dy2,
	    y1 = -sinAngle * dx2 + cosAngle * dy2,
	    x1_sq = x1 * x1,
	    y1_sq = y1 * y1,
	    radiiCheck = x1_sq / (rx * rx) + y1_sq / (ry * ry);
	if (radiiCheck > 1) {
		rx = _sqrt(radiiCheck) * rx;
		ry = _sqrt(radiiCheck) * ry;
	}
	var rx_sq = rx * rx,
	    ry_sq = ry * ry,
	    sq = (rx_sq * ry_sq - rx_sq * y1_sq - ry_sq * x1_sq) / (rx_sq * y1_sq + ry_sq * x1_sq);
	if (sq < 0) {
		sq = 0;
	}
	var coef = (largeArcFlag === sweepFlag ? -1 : 1) * _sqrt(sq),
	    cx1 = coef * (rx * y1 / ry),
	    cy1 = coef * -(ry * x1 / rx),
	    sx2 = (lastX + x) / 2,
	    sy2 = (lastY + y) / 2,
	    cx = sx2 + (cosAngle * cx1 - sinAngle * cy1),
	    cy = sy2 + (sinAngle * cx1 + cosAngle * cy1),
	    ux = (x1 - cx1) / rx,
	    uy = (y1 - cy1) / ry,
	    vx = (-x1 - cx1) / rx,
	    vy = (-y1 - cy1) / ry,
	    temp = ux * ux + uy * uy,
	    angleStart = (uy < 0 ? -1 : 1) * Math.acos(ux / _sqrt(temp)),
	    angleExtent = (ux * vy - uy * vx < 0 ? -1 : 1) * Math.acos((ux * vx + uy * vy) / _sqrt(temp * (vx * vx + vy * vy)));
	isNaN(angleExtent) && (angleExtent = PI); //rare edge case. Math.cos(-1) is NaN.
	if (!sweepFlag && angleExtent > 0) {
		angleExtent -= TWOPI;
	} else if (sweepFlag && angleExtent < 0) {
		angleExtent += TWOPI;
	}
	angleStart %= TWOPI;
	angleExtent %= TWOPI;
	var segments = Math.ceil(_abs(angleExtent) / (TWOPI / 4)),
	    rawPath = [],
	    angleIncrement = angleExtent / segments,
	    controlLength = 4 / 3 * _sin(angleIncrement / 2) / (1 + _cos(angleIncrement / 2)),
	    ma = cosAngle * rx,
	    mb = sinAngle * rx,
	    mc = sinAngle * -ry,
	    md = cosAngle * ry,
	    i = void 0;
	for (i = 0; i < segments; i++) {
		angle = angleStart + i * angleIncrement;
		x1 = _cos(angle);
		y1 = _sin(angle);
		ux = _cos(angle += angleIncrement);
		uy = _sin(angle);
		rawPath.push(x1 - controlLength * y1, y1 + controlLength * x1, ux + controlLength * uy, uy - controlLength * ux, ux, uy);
	}
	//now transform according to the actual size of the ellipse/arc (the beziers were noramlized, between 0 and 1 on a circle).
	for (i = 0; i < rawPath.length; i += 2) {
		x1 = rawPath[i];
		y1 = rawPath[i + 1];
		rawPath[i] = x1 * ma + y1 * mc + cx;
		rawPath[i + 1] = x1 * mb + y1 * md + cy;
	}
	rawPath[i - 2] = x; //always set the end to exactly where it's supposed to be
	rawPath[i - 1] = y;
	return rawPath;
}

//Spits back a RawPath with absolute coordinates. Each segment starts with a "moveTo" command (x coordinate, then y) and then 2 control points (x, y, x, y), then anchor. The goal is to minimize memory and maximize speed.
function stringToRawPath(d) {
	var a = (d + "").replace(_scientific, function (m) {
		var n = +m;return n < 0.0001 && n > -0.0001 ? 0 : n;
	}).match(_svgPathExp) || [],
	    //some authoring programs spit out very small numbers in scientific notation like "1e-5", so make sure we round that down to 0 first.
	path = [],
	    relativeX = 0,
	    relativeY = 0,
	    twoThirds = 2 / 3,
	    elements = a.length,
	    points = 0,
	    errorMessage = "ERROR: malformed path: " + d,
	    i = void 0,
	    j = void 0,
	    x = void 0,
	    y = void 0,
	    command = void 0,
	    isRelative = void 0,
	    segment = void 0,
	    startX = void 0,
	    startY = void 0,
	    difX = void 0,
	    difY = void 0,
	    beziers = void 0,
	    prevCommand = void 0,
	    flag1 = void 0,
	    flag2 = void 0,
	    line = function line(sx, sy, ex, ey) {
		difX = (ex - sx) / 3;
		difY = (ey - sy) / 3;
		segment.push(sx + difX, sy + difY, ex - difX, ey - difY, ex, ey);
	};
	if (!d || !isNaN(a[0]) || isNaN(a[1])) {
		console.log(errorMessage);
		return path;
	}
	for (i = 0; i < elements; i++) {
		prevCommand = command;
		if (isNaN(a[i])) {
			command = a[i].toUpperCase();
			isRelative = command !== a[i]; //lower case means relative
		} else {
			//commands like "C" can be strung together without any new command characters between.
			i--;
		}
		x = +a[i + 1];
		y = +a[i + 2];
		if (isRelative) {
			x += relativeX;
			y += relativeY;
		}
		if (!i) {
			startX = x;
			startY = y;
		}

		// "M" (move)
		if (command === "M") {
			if (segment) {
				if (segment.length < 8) {
					//if the path data was funky and just had a M with no actual drawing anywhere, skip it.
					path.length -= 1;
				} else {
					points += segment.length;
				}
			}
			relativeX = startX = x;
			relativeY = startY = y;
			segment = [x, y];
			path.push(segment);
			i += 2;
			command = "L"; //an "M" with more than 2 values gets interpreted as "lineTo" commands ("L").

			// "C" (cubic bezier)
		} else if (command === "C") {
			if (!segment) {
				segment = [0, 0];
			}
			if (!isRelative) {
				relativeX = relativeY = 0;
			}
			//note: "*1" is just a fast/short way to cast the value as a Number. WAAAY faster in Chrome, slightly slower in Firefox.
			segment.push(x, y, relativeX + a[i + 3] * 1, relativeY + a[i + 4] * 1, relativeX += a[i + 5] * 1, relativeY += a[i + 6] * 1);
			i += 6;

			// "S" (continuation of cubic bezier)
		} else if (command === "S") {
			difX = relativeX;
			difY = relativeY;
			if (prevCommand === "C" || prevCommand === "S") {
				difX += relativeX - segment[segment.length - 4];
				difY += relativeY - segment[segment.length - 3];
			}
			if (!isRelative) {
				relativeX = relativeY = 0;
			}
			segment.push(difX, difY, x, y, relativeX += a[i + 3] * 1, relativeY += a[i + 4] * 1);
			i += 4;

			// "Q" (quadratic bezier)
		} else if (command === "Q") {
			difX = relativeX + (x - relativeX) * twoThirds;
			difY = relativeY + (y - relativeY) * twoThirds;
			if (!isRelative) {
				relativeX = relativeY = 0;
			}
			relativeX += a[i + 3] * 1;
			relativeY += a[i + 4] * 1;
			segment.push(difX, difY, relativeX + (x - relativeX) * twoThirds, relativeY + (y - relativeY) * twoThirds, relativeX, relativeY);
			i += 4;

			// "T" (continuation of quadratic bezier)
		} else if (command === "T") {
			difX = relativeX - segment[segment.length - 4];
			difY = relativeY - segment[segment.length - 3];
			segment.push(relativeX + difX, relativeY + difY, x + (relativeX + difX * 1.5 - x) * twoThirds, y + (relativeY + difY * 1.5 - y) * twoThirds, relativeX = x, relativeY = y);
			i += 2;

			// "H" (horizontal line)
		} else if (command === "H") {
			line(relativeX, relativeY, relativeX = x, relativeY);
			i += 1;

			// "V" (vertical line)
		} else if (command === "V") {
			//adjust values because the first (and only one) isn't x in this case, it's y.
			line(relativeX, relativeY, relativeX, relativeY = x + (isRelative ? relativeY - relativeX : 0));
			i += 1;

			// "L" (line) or "Z" (close)
		} else if (command === "L" || command === "Z") {
			if (command === "Z") {
				x = startX;
				y = startY;
				segment.closed = true;
			}
			if (command === "L" || _abs(relativeX - x) > 0.5 || _abs(relativeY - y) > 0.5) {
				line(relativeX, relativeY, x, y);
				if (command === "L") {
					i += 2;
				}
			}
			relativeX = x;
			relativeY = y;

			// "A" (arc)
		} else if (command === "A") {
			flag1 = a[i + 4];
			flag2 = a[i + 5];
			difX = a[i + 6];
			difY = a[i + 7];
			j = 7;
			if (flag1.length > 1) {
				// for cases when the flags are merged, like "a8 8 0 018 8" (the 0 and 1 flags are WITH the x value of 8, but it could also be "a8 8 0 01-8 8" so it may include x or not)
				if (flag1.length < 3) {
					difY = difX;
					difX = flag2;
					j--;
				} else {
					difY = flag2;
					difX = flag1.substr(2);
					j -= 2;
				}
				flag2 = flag1.charAt(1);
				flag1 = flag1.charAt(0);
			}
			beziers = arcToSegment(relativeX, relativeY, +a[i + 1], +a[i + 2], +a[i + 3], +flag1, +flag2, (isRelative ? relativeX : 0) + difX * 1, (isRelative ? relativeY : 0) + difY * 1);
			i += j;
			if (beziers) {
				for (j = 0; j < beziers.length; j++) {
					segment.push(beziers[j]);
				}
			}
			relativeX = segment[segment.length - 2];
			relativeY = segment[segment.length - 1];
		} else {
			console.log(errorMessage);
		}
	}
	i = segment.length;
	if (i < 6) {
		//in case there's odd SVG like a M0,0 command at the very end.
		path.pop();
		i = 0;
	} else if (segment[0] === segment[i - 2] && segment[1] === segment[i - 1]) {
		segment.closed = true;
	}
	path.totalPoints = points + i;
	return path;
}

//populates the points array in alternating x/y values (like [x, y, x, y...] instead of individual point objects [{x, y}, {x, y}...] to conserve memory and stay in line with how we're handling segment arrays
function bezierToPoints(x1, y1, x2, y2, x3, y3, x4, y4, threshold, points, index) {
	var x12 = (x1 + x2) / 2,
	    y12 = (y1 + y2) / 2,
	    x23 = (x2 + x3) / 2,
	    y23 = (y2 + y3) / 2,
	    x34 = (x3 + x4) / 2,
	    y34 = (y3 + y4) / 2,
	    x123 = (x12 + x23) / 2,
	    y123 = (y12 + y23) / 2,
	    x234 = (x23 + x34) / 2,
	    y234 = (y23 + y34) / 2,
	    x1234 = (x123 + x234) / 2,
	    y1234 = (y123 + y234) / 2,
	    dx = x4 - x1,
	    dy = y4 - y1,
	    d2 = _abs((x2 - x4) * dy - (y2 - y4) * dx),
	    d3 = _abs((x3 - x4) * dy - (y3 - y4) * dx),
	    length = void 0;
	if (!points) {
		points = [x1, y1, x4, y4];
		index = 2;
	}
	points.splice(index || points.length - 2, 0, x1234, y1234);
	if ((d2 + d3) * (d2 + d3) > threshold * (dx * dx + dy * dy)) {
		length = points.length;
		bezierToPoints(x1, y1, x12, y12, x123, y123, x1234, y1234, threshold, points, index);
		bezierToPoints(x1234, y1234, x234, y234, x34, y34, x4, y4, threshold, points, index + 2 + (points.length - length));
	}
	return points;
}

/*
function getAngleBetweenPoints(x0, y0, x1, y1, x2, y2) { //angle between 3 points in radians
	var dx1 = x1 - x0,
		dy1 = y1 - y0,
		dx2 = x2 - x1,
		dy2 = y2 - y1,
		dx3 = x2 - x0,
		dy3 = y2 - y0,
		a = dx1 * dx1 + dy1 * dy1,
		b = dx2 * dx2 + dy2 * dy2,
		c = dx3 * dx3 + dy3 * dy3;
	return Math.acos( (a + b - c) / _sqrt(4 * a * b) );
},
*/

//pointsToSegment() doesn't handle flat coordinates (where y is always 0) the way we need (the resulting control points are always right on top of the anchors), so this function basically makes the control points go directly up and down, varying in length based on the curviness (more curvy, further control points)
function flatPointsToSegment(points) {
	var curviness = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

	var x = points[0],
	    y = 0,
	    segment = [x, y],
	    i = 2;
	for (; i < points.length; i += 2) {
		segment.push(x, y, points[i], y = (points[i] - x) * curviness / 2, x = points[i], -y);
	}
	return segment;
}

//points is an array of x/y points, like [x, y, x, y, x, y]
function pointsToSegment(points, curviness, cornerThreshold) {
	//points = simplifyPoints(points, tolerance);
	_abs(points[0] - points[2]) < 1e-4 && _abs(points[1] - points[3]) < 1e-4 && (points = points.slice(2)); // if the first two points are super close, dump the first one.
	var l = points.length - 2,
	    x = +points[0],
	    y = +points[1],
	    nextX = +points[2],
	    nextY = +points[3],
	    segment = [x, y, x, y],
	    dx2 = nextX - x,
	    dy2 = nextY - y,
	    closed = Math.abs(points[l] - x) < 0.001 && Math.abs(points[l + 1] - y) < 0.001,
	    prevX = void 0,
	    prevY = void 0,
	    angle = void 0,
	    slope = void 0,
	    i = void 0,
	    dx1 = void 0,
	    dx3 = void 0,
	    dy1 = void 0,
	    dy3 = void 0,
	    d1 = void 0,
	    d2 = void 0,
	    a = void 0,
	    b = void 0,
	    c = void 0;
	if (isNaN(cornerThreshold)) {
		cornerThreshold = Math.PI / 10;
	}
	if (closed) {
		// if the start and end points are basically on top of each other, close the segment by adding the 2nd point to the end, and the 2nd-to-last point to the beginning (we'll remove them at the end, but this allows the curvature to look perfect)
		points.push(nextX, nextY);
		nextX = x;
		nextY = y;
		x = points[l - 2];
		y = points[l - 1];
		points.unshift(x, y);
		l += 4;
	}
	curviness = curviness || curviness === 0 ? +curviness : 1;
	for (i = 2; i < l; i += 2) {
		prevX = x;
		prevY = y;
		x = nextX;
		y = nextY;
		nextX = +points[i + 2];
		nextY = +points[i + 3];
		if (x === nextX && y === nextY) {
			continue;
		}
		dx1 = dx2;
		dy1 = dy2;
		dx2 = nextX - x;
		dy2 = nextY - y;
		dx3 = nextX - prevX;
		dy3 = nextY - prevY;
		a = dx1 * dx1 + dy1 * dy1;
		b = dx2 * dx2 + dy2 * dy2;
		c = dx3 * dx3 + dy3 * dy3;
		angle = Math.acos((a + b - c) / _sqrt(4 * a * b)); //angle between the 3 points
		d2 = angle / Math.PI * curviness; //temporary precalculation for speed (reusing d2 variable)
		d1 = _sqrt(a) * d2; //the tighter the angle, the shorter we make the handles in proportion.
		d2 *= _sqrt(b);
		if (x !== prevX || y !== prevY) {
			if (angle > cornerThreshold) {
				slope = _atan2(dy3, dx3);
				segment.push(_round(x - _cos(slope) * d1), //first control point
				_round(y - _sin(slope) * d1), _round(x), //anchor
				_round(y), _round(x + _cos(slope) * d2), //second control point
				_round(y + _sin(slope) * d2));
			} else {
				slope = _atan2(dy1, dx1);
				segment.push(_round(x - _cos(slope) * d1), //first control point
				_round(y - _sin(slope) * d1));
				slope = _atan2(dy2, dx2);
				segment.push(_round(x), //anchor
				_round(y), _round(x + _cos(slope) * d2), //second control point
				_round(y + _sin(slope) * d2));
			}
		}
	}
	x !== nextX || y !== nextY || segment.length < 4 ? segment.push(_round(nextX), _round(nextY), _round(nextX), _round(nextY)) : segment.length -= 2;
	if (closed) {
		segment.splice(0, 6);
		segment.length = segment.length - 6;
	}
	return segment;
}

//returns the squared distance between an x/y coordinate and a segment between x1/y1 and x2/y2
function pointToSegDist(x, y, x1, y1, x2, y2) {
	var dx = x2 - x1,
	    dy = y2 - y1,
	    t = void 0;
	if (dx || dy) {
		t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
		if (t > 1) {
			x1 = x2;
			y1 = y2;
		} else if (t > 0) {
			x1 += dx * t;
			y1 += dy * t;
		}
	}
	return (x - x1) ** 2 + (y - y1) ** 2;
}

function simplifyStep(points, first, last, tolerance, simplified) {
	var maxSqDist = tolerance,
	    firstX = points[first],
	    firstY = points[first + 1],
	    lastX = points[last],
	    lastY = points[last + 1],
	    index = void 0,
	    i = void 0,
	    d = void 0;
	for (i = first + 2; i < last; i += 2) {
		d = pointToSegDist(points[i], points[i + 1], firstX, firstY, lastX, lastY);
		if (d > maxSqDist) {
			index = i;
			maxSqDist = d;
		}
	}
	if (maxSqDist > tolerance) {
		index - first > 2 && simplifyStep(points, first, index, tolerance, simplified);
		simplified.push(points[index], points[index + 1]);
		last - index > 2 && simplifyStep(points, index, last, tolerance, simplified);
	}
}

//points is an array of x/y values like [x, y, x, y, x, y]
function simplifyPoints(points, tolerance) {
	var prevX = parseFloat(points[0]),
	    prevY = parseFloat(points[1]),
	    temp = [prevX, prevY],
	    l = points.length - 2,
	    i = void 0,
	    x = void 0,
	    y = void 0,
	    dx = void 0,
	    dy = void 0,
	    result = void 0,
	    last = void 0;
	tolerance = (tolerance || 1) ** 2;
	for (i = 2; i < l; i += 2) {
		x = parseFloat(points[i]);
		y = parseFloat(points[i + 1]);
		dx = prevX - x;
		dy = prevY - y;
		if (dx * dx + dy * dy > tolerance) {
			temp.push(x, y);
			prevX = x;
			prevY = y;
		}
	}
	temp.push(parseFloat(points[l]), parseFloat(points[l + 1]));
	last = temp.length - 2;
	result = [temp[0], temp[1]];
	simplifyStep(temp, 0, last, tolerance, result);
	result.push(temp[last], temp[last + 1]);
	return result;
}

function getClosestProgressOnBezier(iterations, px, py, start, end, slices, x0, y0, x1, y1, x2, y2, x3, y3) {
	var inc = (end - start) / slices,
	    best = 0,
	    t = start,
	    x = void 0,
	    y = void 0,
	    d = void 0,
	    dx = void 0,
	    dy = void 0,
	    inv = void 0;
	_bestDistance = _largeNum;
	while (t <= end) {
		inv = 1 - t;
		x = inv * inv * inv * x0 + 3 * inv * inv * t * x1 + 3 * inv * t * t * x2 + t * t * t * x3;
		y = inv * inv * inv * y0 + 3 * inv * inv * t * y1 + 3 * inv * t * t * y2 + t * t * t * y3;
		dx = x - px;
		dy = y - py;
		d = dx * dx + dy * dy;
		if (d < _bestDistance) {
			_bestDistance = d;
			best = t;
		}
		t += inc;
	}
	return iterations > 1 ? getClosestProgressOnBezier(iterations - 1, px, py, Math.max(best - inc, 0), Math.min(best + inc, 1), slices, x0, y0, x1, y1, x2, y2, x3, y3) : best;
}

function getClosestData(rawPath, x, y, slices) {
	//returns an object with the closest j, i, and t (j is the segment index, i is the index of the point in that segment, and t is the time/progress along that bezier)
	var closest = { j: 0, i: 0, t: 0 },
	    bestDistance = _largeNum,
	    i = void 0,
	    j = void 0,
	    t = void 0,
	    segment = void 0;
	for (j = 0; j < rawPath.length; j++) {
		segment = rawPath[j];
		for (i = 0; i < segment.length; i += 6) {
			t = getClosestProgressOnBezier(1, x, y, 0, 1, slices || 20, segment[i], segment[i + 1], segment[i + 2], segment[i + 3], segment[i + 4], segment[i + 5], segment[i + 6], segment[i + 7]);
			if (bestDistance > _bestDistance) {
				bestDistance = _bestDistance;
				closest.j = j;
				closest.i = i;
				closest.t = t;
			}
		}
	}
	return closest;
}

//subdivide a Segment closest to a specific x,y coordinate
function subdivideSegmentNear(x, y, segment, slices, iterations) {
	var l = segment.length,
	    bestDistance = _largeNum,
	    bestT = 0,
	    bestSegmentIndex = 0,
	    t = void 0,
	    i = void 0;
	slices = slices || 20;
	iterations = iterations || 3;
	for (i = 0; i < l; i += 6) {
		t = getClosestProgressOnBezier(1, x, y, 0, 1, slices, segment[i], segment[i + 1], segment[i + 2], segment[i + 3], segment[i + 4], segment[i + 5], segment[i + 6], segment[i + 7]);
		if (bestDistance > _bestDistance) {
			bestDistance = _bestDistance;
			bestT = t;
			bestSegmentIndex = i;
		}
	}
	t = getClosestProgressOnBezier(iterations, x, y, bestT - 0.05, bestT + 0.05, slices, segment[bestSegmentIndex], segment[bestSegmentIndex + 1], segment[bestSegmentIndex + 2], segment[bestSegmentIndex + 3], segment[bestSegmentIndex + 4], segment[bestSegmentIndex + 5], segment[bestSegmentIndex + 6], segment[bestSegmentIndex + 7]);
	subdivideSegment(segment, bestSegmentIndex, t);
	return bestSegmentIndex + 6;
}

/*
Takes any of the following and converts it to an all Cubic Bezier SVG data string:
- A <path> data string like "M0,0 L2,4 v20,15 H100"
- A RawPath, like [[x, y, x, y, x, y, x, y][[x, y, x, y, x, y, x, y]]
- A Segment, like [x, y, x, y, x, y, x, y]

Note: all numbers are rounded down to the closest 0.001 to minimize memory, maximize speed, and avoid odd numbers like 1e-13
*/
function rawPathToString(rawPath) {
	if (_isNumber(rawPath[0])) {
		//in case a segment is passed in instead
		rawPath = [rawPath];
	}
	var result = "",
	    l = rawPath.length,
	    sl = void 0,
	    s = void 0,
	    i = void 0,
	    segment = void 0;
	for (s = 0; s < l; s++) {
		segment = rawPath[s];
		result += "M" + _round(segment[0]) + "," + _round(segment[1]) + " C";
		sl = segment.length;
		for (i = 2; i < sl; i++) {
			result += _round(segment[i++]) + "," + _round(segment[i++]) + " " + _round(segment[i++]) + "," + _round(segment[i++]) + " " + _round(segment[i++]) + "," + _round(segment[i]) + " ";
		}
		if (segment.closed) {
			result += "z";
		}
	}
	return result;
}

/*
// takes a segment with coordinates [x, y, x, y, ...] and converts the control points into angles and lengths [x, y, angle, length, angle, length, x, y, angle, length, ...] so that it animates more cleanly and avoids odd breaks/kinks. For example, if you animate from 1 o'clock to 6 o'clock, it'd just go directly/linearly rather than around. So the length would be very short in the middle of the tween.
export function cpCoordsToAngles(segment, copy) {
	var result = copy ? segment.slice(0) : segment,
		x, y, i;
	for (i = 0; i < segment.length; i+=6) {
		x = segment[i+2] - segment[i];
		y = segment[i+3] - segment[i+1];
		result[i+2] = Math.atan2(y, x);
		result[i+3] = Math.sqrt(x * x + y * y);
		x = segment[i+6] - segment[i+4];
		y = segment[i+7] - segment[i+5];
		result[i+4] = Math.atan2(y, x);
		result[i+5] = Math.sqrt(x * x + y * y);
	}
	return result;
}

// takes a segment that was converted with cpCoordsToAngles() to have angles and lengths instead of coordinates for the control points, and converts it BACK into coordinates.
export function cpAnglesToCoords(segment, copy) {
	var result = copy ? segment.slice(0) : segment,
		length = segment.length,
		rnd = 1000,
		angle, l, i, j;
	for (i = 0; i < length; i+=6) {
		angle = segment[i+2];
		l = segment[i+3]; //length
		result[i+2] = (((segment[i] + Math.cos(angle) * l) * rnd) | 0) / rnd;
		result[i+3] = (((segment[i+1] + Math.sin(angle) * l) * rnd) | 0) / rnd;
		angle = segment[i+4];
		l = segment[i+5]; //length
		result[i+4] = (((segment[i+6] - Math.cos(angle) * l) * rnd) | 0) / rnd;
		result[i+5] = (((segment[i+7] - Math.sin(angle) * l) * rnd) | 0) / rnd;
	}
	return result;
}

//adds an "isSmooth" array to each segment and populates it with a boolean value indicating whether or not it's smooth (the control points have basically the same slope). For any smooth control points, it converts the coordinates into angle (x, in radians) and length (y) and puts them into the same index value in a smoothData array.
export function populateSmoothData(rawPath) {
	let j = rawPath.length,
		smooth, segment, x, y, x2, y2, i, l, a, a2, isSmooth, smoothData;
	while (--j > -1) {
		segment = rawPath[j];
		isSmooth = segment.isSmooth = segment.isSmooth || [0, 0, 0, 0];
		smoothData = segment.smoothData = segment.smoothData || [0, 0, 0, 0];
		isSmooth.length = 4;
		l = segment.length - 2;
		for (i = 6; i < l; i += 6) {
			x = segment[i] - segment[i - 2];
			y = segment[i + 1] - segment[i - 1];
			x2 = segment[i + 2] - segment[i];
			y2 = segment[i + 3] - segment[i + 1];
			a = _atan2(y, x);
			a2 = _atan2(y2, x2);
			smooth = (Math.abs(a - a2) < 0.09);
			if (smooth) {
				smoothData[i - 2] = a;
				smoothData[i + 2] = a2;
				smoothData[i - 1] = _sqrt(x * x + y * y);
				smoothData[i + 3] = _sqrt(x2 * x2 + y2 * y2);
			}
			isSmooth.push(smooth, smooth, 0, 0, smooth, smooth);
		}
		//if the first and last points are identical, check to see if there's a smooth transition. We must handle this a bit differently due to their positions in the array.
		if (segment[l] === segment[0] && segment[l+1] === segment[1]) {
			x = segment[0] - segment[l-2];
			y = segment[1] - segment[l-1];
			x2 = segment[2] - segment[0];
			y2 = segment[3] - segment[1];
			a = _atan2(y, x);
			a2 = _atan2(y2, x2);
			if (Math.abs(a - a2) < 0.09) {
				smoothData[l-2] = a;
				smoothData[2] = a2;
				smoothData[l-1] = _sqrt(x * x + y * y);
				smoothData[3] = _sqrt(x2 * x2 + y2 * y2);
				isSmooth[l-2] = isSmooth[l-1] = true; //don't change indexes 2 and 3 because we'll trigger everything from the END, and this will optimize file size a bit.
			}
		}
	}
	return rawPath;
}
export function pointToScreen(svgElement, point) {
	if (arguments.length < 2) { //by default, take the first set of coordinates in the path as the point
		let rawPath = getRawPath(svgElement);
		point = svgElement.ownerSVGElement.createSVGPoint();
		point.x = rawPath[0][0];
		point.y = rawPath[0][1];
	}
	return point.matrixTransform(svgElement.getScreenCTM());
}

*/





var exports3={};
Object.defineProperty(exports3, "__esModule", {
	value: true
});
exports3.default = exports3.MotionPathPlugin = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /*!
                                                                                                                                                                                                                                                   * MotionPathPlugin 3.6.1
                                                                                                                                                                                                                                                   * https://greensock.com
                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                   * @license Copyright 2008-2021, GreenSock. All rights reserved.
                                                                                                                                                                                                                                                   * Subject to the terms at https://greensock.com/standard-license or for
                                                                                                                                                                                                                                                   * Club GreenSock members, the agreement issued with that membership.
                                                                                                                                                                                                                                                   * @author: Jack Doyle, jack@greensock.com
                                                                                                                                                                                                                                                  */
/* eslint-disable */

var _paths = exports2;

var _matrix = exports;

var _xProps = "x,translateX,left,marginLeft,xPercent".split(","),
    _yProps = "y,translateY,top,marginTop,yPercent".split(","),
    _DEG2RAD = Math.PI / 180,
    
    PropTween = void 0,
    _getUnit = void 0,
    _toArray = void 0,
    _getGSAP = function _getGSAP() {
	return gsap || typeof window !== "undefined" && (gsap = window.gsap) && gsap.registerPlugin && gsap;
},
    _populateSegmentFromArray = function _populateSegmentFromArray(segment, values, property, mode) {
	//mode: 0 = x but don't fill y yet, 1 = y, 2 = x and fill y with 0.
	var l = values.length,
	    si = mode === 2 ? 0 : mode,
	    i = 0,
	    v = void 0;
	for (; i < l; i++) {
		segment[si] = v = parseFloat(values[i][property]);
		mode === 2 && (segment[si + 1] = 0);
		si += 2;
	}
	return segment;
},
    _getPropNum = function _getPropNum(target, prop, unit) {
	return parseFloat(target._gsap.get(target, prop, unit || "px")) || 0;
},
    _relativize = function _relativize(segment) {
	var x = segment[0],
	    y = segment[1],
	    i = void 0;
	for (i = 2; i < segment.length; i += 2) {
		x = segment[i] += x;
		y = segment[i + 1] += y;
	}
},
    _segmentToRawPath = function _segmentToRawPath(plugin, segment, target, x, y, slicer, vars, unitX, unitY) {
	if (vars.type === "cubic") {
		segment = [segment];
	} else {
		segment.unshift(_getPropNum(target, x, unitX), y ? _getPropNum(target, y, unitY) : 0);
		vars.relative && _relativize(segment);
		var pointFunc = y ? _paths.pointsToSegment : _paths.flatPointsToSegment;
		segment = [pointFunc(segment, vars.curviness)];
	}
	segment = slicer(_align(segment, target, vars));
	_addDimensionalPropTween(plugin, target, x, segment, "x", unitX);
	y && _addDimensionalPropTween(plugin, target, y, segment, "y", unitY);
	return (0, _paths.cacheRawPathMeasurements)(segment, vars.resolution || (vars.curviness === 0 ? 20 : 12)); //when curviness is 0, it creates control points right on top of the anchors which makes it more sensitive to resolution, thus we change the default accordingly.
},
    _emptyFunc = function _emptyFunc(v) {
	return v;
},
    _numExp = /[-+\.]*\d+[\.e\-\+]*\d*[e\-\+]*\d*/g,
    _originToPoint = function _originToPoint(element, origin, parentMatrix) {
	// origin is an array of normalized values (0-1) in relation to the width/height, so [0.5, 0.5] would be the center. It can also be "auto" in which case it will be the top left unless it's a <path>, when it will start at the beginning of the path itself.
	var m = (0, _matrix.getGlobalMatrix)(element),
	    svg = void 0,
	    x = void 0,
	    y = void 0;
	if ((element.tagName + "").toLowerCase() === "svg") {
		svg = element.viewBox.baseVal;
		x = svg.x;
		y = svg.y;
		svg.width || (svg = { width: +element.getAttribute("width"), height: +element.getAttribute("height") });
	} else {
		svg = origin && element.getBBox && element.getBBox();
		x = y = 0;
	}
	if (origin && origin !== "auto") {
		x += origin.push ? origin[0] * (svg ? svg.width : element.offsetWidth || 0) : origin.x;
		y += origin.push ? origin[1] * (svg ? svg.height : element.offsetHeight || 0) : origin.y;
	}
	return parentMatrix.apply(x || y ? m.apply({ x: x, y: y }) : { x: m.e, y: m.f });
},
    _getAlignMatrix = function _getAlignMatrix(fromElement, toElement, fromOrigin, toOrigin) {
	var parentMatrix = (0, _matrix.getGlobalMatrix)(fromElement.parentNode, true, true);
	var m = parentMatrix.clone().multiply((0, _matrix.getGlobalMatrix)(toElement));
	var fromPoint = _originToPoint(fromElement, fromOrigin, parentMatrix);

	var _originToPoint2 = _originToPoint(toElement, toOrigin, parentMatrix);

	var x = _originToPoint2.x;
	var y = _originToPoint2.y;
	var p = void 0;
	m.e = m.f = 0;
	if (toOrigin === "auto" && toElement.getTotalLength && toElement.tagName.toLowerCase() === "path") {
		p = toElement.getAttribute("d").match(_numExp) || [];
		p = m.apply({ x: +p[0], y: +p[1] });
		x += p.x;
		y += p.y;
	}
	if (p || toElement.getBBox && fromElement.getBBox && toElement.ownerSVGElement === fromElement.ownerSVGElement) {
		p = m.apply(toElement.getBBox());
		x -= p.x;
		y -= p.y;
	}
	m.e = x - fromPoint.x;
	m.f = y - fromPoint.y;
	return m;
},
    _align = function _align(rawPath, target, _ref) {
	var align = _ref.align;
	var matrix = _ref.matrix;
	var offsetX = _ref.offsetX;
	var offsetY = _ref.offsetY;
	var alignOrigin = _ref.alignOrigin;

	var x = rawPath[0][0],
	    y = rawPath[0][1],
	    curX = _getPropNum(target, "x"),
	    curY = _getPropNum(target, "y"),
	    alignTarget = void 0,
	    m = void 0,
	    p = void 0;
	if (!rawPath || !rawPath.length) {
		return (0, _paths.getRawPath)("M0,0L0,0");
	}
	if (align) {
		if (align === "self" || (alignTarget = _toArray(align)[0] || target) === target) {
			(0, _paths.transformRawPath)(rawPath, 1, 0, 0, 1, curX - x, curY - y);
		} else {
			if (alignOrigin && alignOrigin[2] !== false) {
				gsap.set(target, { transformOrigin: alignOrigin[0] * 100 + "% " + alignOrigin[1] * 100 + "%" });
			} else {
				alignOrigin = [_getPropNum(target, "xPercent") / -100, _getPropNum(target, "yPercent") / -100];
			}
			m = _getAlignMatrix(target, alignTarget, alignOrigin, "auto");
			p = m.apply({ x: x, y: y });
			(0, _paths.transformRawPath)(rawPath, m.a, m.b, m.c, m.d, curX + m.e - (p.x - m.e), curY + m.f - (p.y - m.f));
		}
	}
	if (matrix) {
		(0, _paths.transformRawPath)(rawPath, matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
	} else if (offsetX || offsetY) {
		(0, _paths.transformRawPath)(rawPath, 1, 0, 0, 1, offsetX || 0, offsetY || 0);
	}
	return rawPath;
},
    _addDimensionalPropTween = function _addDimensionalPropTween(plugin, target, property, rawPath, pathProperty, forceUnit) {
	var cache = target._gsap,
	    harness = cache.harness,
	    alias = harness && harness.aliases && harness.aliases[property],
	    prop = alias && alias.indexOf(",") < 0 ? alias : property,
	    pt = plugin._pt = new PropTween(plugin._pt, target, prop, 0, 0, _emptyFunc, 0, cache.set(target, prop, plugin));
	pt.u = _getUnit(cache.get(target, prop, forceUnit)) || 0;
	pt.path = rawPath;
	pt.pp = pathProperty;
	plugin._props.push(prop);
},
    _sliceModifier = function _sliceModifier(start, end) {
	return function (rawPath) {
		return start || end !== 1 ? (0, _paths.sliceRawPath)(rawPath, start, end) : rawPath;
	};
};

var MotionPathPlugin = exports3.MotionPathPlugin = {
	version: "3.6.1",
	name: "motionPath",
	register: function register(core, Plugin, propTween) {
		gsap = core;
		_getUnit = gsap.utils.getUnit;
		_toArray = gsap.utils.toArray;
		PropTween = propTween;
	},
	init: function init(target, vars) {
		if (!gsap) {
			console.warn("Please gsap.registerPlugin(MotionPathPlugin)");
			return false;
		}
		if (!((typeof vars === "undefined" ? "undefined" : _typeof(vars)) === "object" && !vars.style) || !vars.path) {
			vars = { path: vars };
		}
		var rawPaths = [];
		var _vars = vars;
		var path = _vars.path;
		var autoRotate = _vars.autoRotate;
		var unitX = _vars.unitX;
		var unitY = _vars.unitY;
		var x = _vars.x;
		var y = _vars.y;
		var firstObj = path[0];
		var slicer = _sliceModifier(vars.start, "end" in vars ? vars.end : 1);
		var rawPath = void 0;var p = void 0;
		this.rawPaths = rawPaths;
		this.target = target;
		if (this.rotate = autoRotate || autoRotate === 0) {
			//get the rotational data FIRST so that the setTransform() method is called in the correct order in the render() loop - rotation gets set last.
			this.rOffset = parseFloat(autoRotate) || 0;
			this.radians = !!vars.useRadians;
			this.rProp = vars.rotation || "rotation"; // rotation property
			this.rSet = target._gsap.set(target, this.rProp, this); // rotation setter
			this.ru = _getUnit(target._gsap.get(target, this.rProp)) || 0; // rotation units
		}
		if (Array.isArray(path) && !("closed" in path) && typeof firstObj !== "number") {
			for (p in firstObj) {
				if (!x && ~_xProps.indexOf(p)) {
					x = p;
				} else if (!y && ~_yProps.indexOf(p)) {
					y = p;
				}
			}
			if (x && y) {
				//correlated values
				rawPaths.push(_segmentToRawPath(this, _populateSegmentFromArray(_populateSegmentFromArray([], path, x, 0), path, y, 1), target, x, y, slicer, vars, unitX || _getUnit(path[0][x]), unitY || _getUnit(path[0][y])));
			} else {
				x = y = 0;
			}
			for (p in firstObj) {
				p !== x && p !== y && rawPaths.push(_segmentToRawPath(this, _populateSegmentFromArray([], path, p, 2), target, p, 0, slicer, vars, _getUnit(path[0][p])));
			}
		} else {
			rawPath = slicer(_align((0, _paths.getRawPath)(vars.path), target, vars));
			(0, _paths.cacheRawPathMeasurements)(rawPath, vars.resolution);
			rawPaths.push(rawPath);
			_addDimensionalPropTween(this, target, vars.x || "x", rawPath, "x", vars.unitX || "px");
			_addDimensionalPropTween(this, target, vars.y || "y", rawPath, "y", vars.unitY || "px");
		}
	},
	render: function render(ratio, data) {
		var rawPaths = data.rawPaths,
		    i = rawPaths.length,
		    pt = data._pt;
		if (ratio > 1) {
			ratio = 1;
		} else if (ratio < 0) {
			ratio = 0;
		}
		while (i--) {
			(0, _paths.getPositionOnPath)(rawPaths[i], ratio, !i && data.rotate, rawPaths[i]);
		}
		while (pt) {
			pt.set(pt.t, pt.p, pt.path[pt.pp] + pt.u, pt.d, ratio);
			pt = pt._next;
		}
		data.rotate && data.rSet(data.target, data.rProp, rawPaths[0].angle * (data.radians ? _DEG2RAD : 1) + data.rOffset + data.ru, data, ratio);
	},
	getLength: function getLength(path) {
		return (0, _paths.cacheRawPathMeasurements)((0, _paths.getRawPath)(path)).totalLength;
	},

	sliceRawPath: _paths.sliceRawPath,
	getRawPath: _paths.getRawPath,
	pointsToSegment: _paths.pointsToSegment,
	stringToRawPath: _paths.stringToRawPath,
	rawPathToString: _paths.rawPathToString,
	transformRawPath: _paths.transformRawPath,
	getGlobalMatrix: _matrix.getGlobalMatrix,
	getPositionOnPath: _paths.getPositionOnPath,
	cacheRawPathMeasurements: _paths.cacheRawPathMeasurements,
	convertToPath: function convertToPath(targets, swap) {
		return _toArray(targets).map(function (target) {
			return (0, _paths.convertToPath)(target, swap !== false);
		});
	},
	convertCoordinates: function convertCoordinates(fromElement, toElement, point) {
		var m = (0, _matrix.getGlobalMatrix)(toElement, true, true).multiply((0, _matrix.getGlobalMatrix)(fromElement));
		return point ? m.apply(point) : m;
	},

	getAlignMatrix: _getAlignMatrix,
	getRelativePosition: function getRelativePosition(fromElement, toElement, fromOrigin, toOrigin) {
		var m = _getAlignMatrix(fromElement, toElement, fromOrigin, toOrigin);
		return { x: m.e, y: m.f };
	},
	arrayToRawPath: function arrayToRawPath(value, vars) {
		vars = vars || {};
		var segment = _populateSegmentFromArray(_populateSegmentFromArray([], value, vars.x || "x", 0), value, vars.y || "y", 1);
		vars.relative && _relativize(segment);
		return [vars.type === "cubic" ? segment : (0, _paths.pointsToSegment)(segment, vars.curviness)];
	}
};

_getGSAP() && gsap.registerPlugin(MotionPathPlugin);

exports3.default = MotionPathPlugin;