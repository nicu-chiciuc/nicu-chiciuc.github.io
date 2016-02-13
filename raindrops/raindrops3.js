var Drop = (function() {

	var DropLogic = (function() {

		function printArr (arr, rows, cols) {
			var dbg = document.getElementById('debug')
			var s = '<br />'

			for (var i = 0; i < rows; i++) {
				for (var j = 0; j < cols; j++) {
					if (arr[i * cols + j] == -1)
						s += '*'
					else
						s += arr[i * cols + j] 
				}
				s += '<br />'
			}

			dbg.innerHTML += s
		}

		function get1or0 () {

			return Math.floor(Math.random()*2)
		}

		function setRandNumForFirstRow (arr, cols2) {
			for (var i = 0; i < cols2; i++)
				arr[i] = get1or0()
		}

		function sum4at (arr, cols, row, col) {
			return arr[row * cols + col] +
				arr[(row + 1)* cols + col] +
				arr[row * cols + col+1] +
				arr[(row+1) * cols + col+1]

		}

		function checkIfGood (arr, rows, cols) {
			for (var i = 0; i < rows-2; i+=2)
				for (var j = 0; j < cols-1; j+=2)
					if (sum4at(arr, cols, i, j) != 2)
						console.log(i, j)
					else if (sum4at(arr, cols, i+1, j+1) != 2)
						console.log(i+1, j+1)
						
			
		}

		function getSpecialArray (rows2, cols2) {
			var arr = new Int8Array(rows2 * cols2)
			arr.fill(-1)

			setRandNumForFirstRow(arr, cols2)

			for (var lastRow=0; lastRow<rows2; ++lastRow)
			{
				var iStart = 0
				if (lastRow % 2) {
					iStart = 1
					arr[(lastRow+1) * cols2 + 0] = get1or0()
					arr[(lastRow+1) * cols2 + (cols2-1)] = get1or0()
				}

				for (var i = iStart; i<cols2-1; i+=2)
		            if (arr[lastRow * cols2 + i] == arr[lastRow * cols2 + i+1])
		            {
		                arr[(lastRow+1) * cols2 + i] = !arr[lastRow * cols2 + i];
		                arr[(lastRow+1) * cols2 + i+1] = !arr[lastRow * cols2 + i];
		            }
		            else
		            {
		                arr[(lastRow+1) * cols2 + i] = get1or0();
		                arr[(lastRow+1) * cols2 + i+1] = !arr[(lastRow+1) * cols2 + i];
		            }
			}

			checkIfGood(arr, rows2, cols2)

			return arr
		}

		function getDelimiterArray (specialArr, rows2, cols2) {
			var nrows = rows2/2 - 1
			var ncols = cols2/2 - 1
			var arr = new Int8Array(nrows * ncols)

			var tmp
			for (var i = 1; i < rows2; i+=2)
				for (var j = 1; j < cols2; j+=2)
				{
					if (specialArr[i*cols2 + j] == specialArr[(i+1)*cols2 + j])
						tmp = 0  // horizontal line
					else
					if (specialArr[i*cols2 + j] == specialArr[i*cols2 + j+1])
						tmp = 1  // vertical line
					else
						tmp = get1or0()

					arr[(i-1)/2 * ncols + (j-1)/2] = tmp
				}

			return arr
		}

		function DropLogic(_rows, _cols) {
			var 
				rows  = _rows+2,
			    cols  = _cols+2,
			    nrows = rows-1,
			    ncols = cols-1,
			    rows2 = rows * 2,
			    cols2 = cols * 2

			var specialArr = getSpecialArray(rows2, cols2)
			var delimArr = getDelimiterArray(specialArr, rows2, cols2)

			// printArr(specialArr, rows2, cols2)
			// printArr(delimArr, nrows, ncols)


			
			function getReturnValue (row, col, rowInc, colInc) {
				var rowTmp = row*2 + rowInc
				var colTmp = col*2 + colInc

				var delRowTmp = row + rowInc - 1
				var delColTmp = col + colInc - 1
				if (specialArr[rowTmp*cols2 + colTmp])
				{
					if (delimArr[delRowTmp * ncols + delColTmp])
						return 'v'
					else
						return 'h'
				}

				return '_'
			}

			this.getAt = function (_row, _col) {
				var row = _row
				var col = _col

				if (row < 0 || row >= _rows ||
					col < 0 || col >= _cols)
				console.error('Out of range.')
			
				row ++
				col ++

				return [
					getReturnValue(row, col, 0, 1, 0, 1),
					getReturnValue(row, col, 1, 1, 3, 2),
					getReturnValue(row, col, 1, 0, 4, 5),
					getReturnValue(row, col, 0, 0, 7, 6),
				]
			}
		}


		return DropLogic
	})()

	///////////////////////////////////////////

	function svg_ArcTo (rx, ry, xAxisRotate, LargeArcFlag, SweepFlag, x,y) {
		return ' A' + rx +',' + ry + ' ' + xAxisRotate + ' ' + LargeArcFlag + ' ' + SweepFlag + ' ' + x + ',' + y + ' '
	}

	function svg_arcTo (rx, ry, xAxisRotate, LargeArcFlag, SweepFlag, x,y) {
		return ' a' + rx +',' + ry + ' ' + xAxisRotate + ' ' + LargeArcFlag + ' ' + SweepFlag + ' ' + x + ',' + y + ' '
	}

	function svg_lineTo (x, y) {
		return ' l' + x + ',' + y + ' '
	}

	var width = window.innerWidth
	var height = window.innerHeight - 4

	var draw = SVG('drawing').size(width, height)

	drawDroplets()

	function drawDroplets () {
		var rows = 2
		var cols = 3

		var dropLogic = new DropLogic(rows, cols)
		
		var rad = width / ((cols-1) * 2)
		var offsetX = 0
		var offsetY = 0

		for (var i=0; i<rows; i++)
			for (var j = 0; j < cols; j++) {
				var path = infoToPath(
					offsetX + rad*2*j, offsetY + rad*2*i, rad,
					dropLogic.getAt(i, j)
					)

				draw.path(path).attr({ 
					fill: getRandomColor(), 
					'fill-opacity': 0.9,
					stroke: '#222',
					'stoke-width': 4
				})
			}

		function svg_arcToSet(SweepFlag, x, y) {
			return svg_arcTo(rad, rad, 1, 0, SweepFlag, x, y)
		}

		function infoToPath (offsetX, offsetY, rad, info) {
			var xrad = rad, yrad = rad

			var path = 'M ' + offsetX + ' ' + (offsetY - rad) 

			switch (info[0]) {
				case '_':
					path += svg_arcToSet(1, xrad, yrad)
					break

				case 'v':
					path += 
						svg_arcToSet(0, xrad, -yrad) +
						svg_lineTo(0, 2 * yrad)
					break

				case 'h':
					path +=
						svg_lineTo(2*xrad, 0) +
						svg_arcToSet(0, -xrad, yrad)
			}

			switch (info[1]) {
				case '_':
					path += svg_arcToSet(1, -xrad, yrad)
					break

				case 'v':
					path +=
						svg_lineTo(0, 2*yrad) +
						svg_arcToSet(0, -xrad, -yrad)
					break

				case 'h':
					path +=
						svg_arcToSet(0, xrad, yrad) +
						svg_lineTo(-2*xrad, 0)
			}

			switch (info[2]) {
				case '_':
					path += svg_arcToSet(1, -rad, -rad)
					break

				case 'v':
					path +=
						svg_arcToSet(0, -rad, rad) +
						svg_lineTo(0, -2*rad)
					break

				case 'h':
					path +=
						svg_lineTo(-2*xrad, 0) +
						svg_arcToSet(0, rad, -rad)
					break	
			}

			switch (info[3]) {
				case '_':
					path += svg_arcToSet(1, rad, -rad)
					break

				case 'v':
					path +=
						svg_lineTo(0, -2*rad) +
						svg_arcToSet(0, rad, rad)
					break

				case 'h':
					path +=
						svg_arcToSet(0, -rad, -rad) +
						svg_lineTo(2*rad, 0)
					break
			}

			return path
		}
	}

	function getRandByte () {
		return Math.floor(Math.random() * 256)
	}

	function getRandomColor () {
		return 'rgb(' + getRandByte() + ',' + getRandByte() + ',' + getRandByte() + ')'
	}
	
	
})()