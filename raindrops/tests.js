var width = window.innerWidth
	var height = window.innerHeight - 4

	var draw = SVG('drawing').size(width, height)


	// var rect = draw.
	// 	rect(100, 20).
	// 	attr({x: 30, y:20}).
	// 	transform({skewX: 5})

	// rect.animate().attr({
	// 	width: 6,
	// 	height: 80
	// })

	function svg_Bezier (x1, y1, x2, y2, x, y) {
		return ' C ' + x1 + ' ' + y1 +' ' + x2 + ' ' + y2 +' ' +  x + ' ' + y + ' '
	}
	
	var approx = 0.552284749831
	var PI = Math.PI
	var n = 8
	var best = 4 / 3 * Math.tan(PI / (2 * n)) 

	console.log(best)

	var cos45 = Math.cos(PI / 4)  // cos45 == sin45

	var mainGroup = draw.
		group().
		transform({
			x: 200,
			y: 300,
			scaleX: 100,
			scaleY: 100,
		})

	var roundPath01 ='M 0,-1'
			+ svg_Bezier(best, -1, cos45 * (1 - best), cos45 * (-1 - best), cos45, -cos45)
			+ svg_Bezier(cos45 * (1 + best), cos45 * (-1 + best), 1, -best, 1, 0)

	var squarePath01 = 'M 0,-1'
			+ svg_Bezier(best, -1, 1 - best, -1, 1, -1)
			+ svg_Bezier(1, -1 + best, 1, -best, 1, 0)

	var dpath = draw.
		path( squarePath01 ).
		attr({
			id: 'pathId',
			fill: 'none',
			stroke: '#222',
			'stroke-width': 0.03
		})

	mainGroup.add(dpath)

	dpath.node.innerHTML = '<animate dur="1s" attributeName="d" values=' +
		'"' + roundPath01 + ';' + squarePath01 + ';' +
			'M 0,-1' + 
			svg_Bezier(approx, -1, 1, approx - 2, 1, -2)+
			svg_Bezier(1, approx-2, 1, -approx, 1, 0) +';' +
			'"/>'