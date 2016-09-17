/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "circle" element
 */

SVGCircleElement.prototype.consumeTransform = function(matrixIn) {
	var matrix = this.getTransformBase();
	if(matrixIn) {
		matrix = matrixIn.multiply(matrix);
	}
	if(matrix.isIdentity()) {
		this.removeAttribute('transform');
	} else {
		this.setAttribute(transform);
	}
}

SVGCircleElement.prototype.setCX = function(value) {
	this.setAttribute('cx', value);
}

SVGCircleElement.prototype.setCY = function(value) {
	this.setAttribute('cy', value);
}

SVGCircleElement.prototype.setR = function(value) {
	this.setAttribute('r', value);
}

SVGCircleElement.prototype.translateBy = function(byX, byY, makeHistory) {
	var oldCX = this.cx.baseVal.value;
	var oldCY = this.cy.baseVal.value;
	
	var transform = this.getTransformBase();
	var adjusted = transform.toUserspace(byX, byY);
	var adjustedZero = transform.toUserspace(0, 0);
	
	byX = adjusted.x - adjustedZero.x;
	byY = adjusted.y - adjustedZero.y;
	
	this.setAttribute('cx', oldCX+byX);
	this.setAttribute('cy', oldCY+byY);
	
	if(makeHistory) {
		var oldTransform = this.getTransformBase();
		svg.history.add(new historyAttribute(this.id, 
			{ 'cx': oldCX, 'cy': oldCY },
			{ 'cx': oldCX+byX, 'cy': oldCY+byY },
		true));
	}
}

SVGCircleElement.prototype.setRadius = function(x, y, makeHistory) {
	var newR = Math.sqrt(
		Math.pow(x-this.cx.baseVal.value, 2) +
		Math.pow(y-this.cy.baseVal.value, 2)
	);
	
	if(makeHistory && svg && history) {
		svg.history.add(new historyAttribute(this.id,
			{ 'r': this.r.baseVal.value },
			{ 'r': newR },
			true
		));
	}
	
	this.setR(newR);	
}

SVGCircleElement.prototype.generateAnchors = function() {
	var CTM = this.getCTMBase();
	
	var adjustedMid = CTM.toViewport(this.cx.baseVal.value, this.cy.baseVal.value);
	var adjustedRight = CTM.toViewport(this.cx.baseVal.value+this.r.baseVal.value, this.cy.baseVal.value);
	
	var mouseUpAction = "svg.select();";
	
	var anchRadius = new anchor(adjustedRight, this, 'rectangle', {
			'move': "this.element.setRadius(relative.x, relative.y, true);",
			'mouseup': mouseUpAction
			}, new constraintLinear(adjustedRight, adjustedMid, false, false)
		);
		
	return { 'anchors': [ [ anchRadius ] ] };
}

// returns element's center as its "cx" and "cy" attributes
// if viewport is true, value given is adjusted to current viewport
SVGCircleElement.prototype.getCenter = function(viewport) {
	var CTM = this.getCTMBase();
	var topLeft = CTM.toViewport(this.cx.baseVal.value-this.r.baseVal.value, this.cy.baseVal.value-this.r.baseVal.value);
	var botRight = CTM.toViewport(this.cx.baseVal.value+this.r.baseVal.value, this.cy.baseVal.value+this.r.baseVal.value);
		
	if(viewport) {	
		var adjusted = CTM.toViewport(this.cx.baseVal.value, this.cy.baseVal.value);
		var adjustedAnim = CTM.toViewport(this.cx.animVal.value, this.cy.animVal.value);
		
		return { 'x': adjusted.x, 'y': adjusted.y, 'x_anim': adjustedAnim.x, 'y_anim': adjustedAnim.y,
			'left': Math.min(topLeft.x, botRight.x), 'right': Math.max(topLeft.x, botRight.x),
			'top': Math.min(topLeft.y, botRight.y), 'bottom': Math.max(topLeft.y, botRight.y) };
	}
	return { 'x': this.cx.baseVal.value, 'y': this.cy.baseVal.value,
		'x_anim': this.cx.animVal.value, 'y_anim': this.cy.animVal.value,
		'left': Math.min(topLeft.x, botRight.x), 'right': Math.max(topLeft.x, botRight.x),
		'top': Math.min(topLeft.y, botRight.y), 'bottom': Math.max(topLeft.y, botRight.y)
	};
}

SVGCircleElement.prototype.toPath = function() {
	var path = document.createElementNS(svgNS, 'path');
	var pData = [];
		pData.push('m ' +(this.cx.baseVal.value+this.r.baseVal.value)+ ' ' + this.cy.baseVal.value);
		pData.push('a ' +this.r.baseVal.value+ ' ' +this.r.baseVal.value+ ' 0 0 1 ' + (-1*this.r.baseVal.value)+ ' ' +this.r.baseVal.value);
		pData.push('' +this.r.baseVal.value+ ' ' +this.r.baseVal.value+ ' 0 0 1 ' +(-1*this.r.baseVal.value)+ ' ' +(-1*this.r.baseVal.value));
		pData.push('' +this.r.baseVal.value+ ' ' +this.r.baseVal.value+ ' 0 0 1 ' +this.r.baseVal.value+ ' ' +(-1*this.r.baseVal.value));
		pData.push('' +this.r.baseVal.value+ ' ' +this.r.baseVal.value+ ' 0 0 1 ' +this.r.baseVal.value+ ' ' +this.r.baseVal.value);
		pData.push('z');
	
	path.setAttribute('d', pData.join(' '));
	
	for(var i = 0; i < this.attributes.length; i++) {
		if(this.attributes[i].name == 'r' || this.attributes[i].name == 'cx' || this.attributes[i].name == 'cy') { continue; }
		path.setAttribute(this.attributes[i].name, this.attributes[i].value);
	}
	
	this.parentNode.insertBefore(path, this);
	this.parentNode.removeChild(this);
	
	if(svg.selected == this) {
		svg.select(path);
	}
	return path;
}

