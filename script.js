;(function(KO, $) {

	$(function() {

		KO.UI.init();

	});


	KO.UI = {

		scrollActive: false,

		supports : {
			transform3d: false
		},


		init : function () {
			this.handleZooming();
		},

		handleZooming : function () {

			var zoomContent = $('.illust-container');

			ZUI = new Zoomer(zoomContent);

			//make sure page is at the top when reloaded
			window.scrollTo(0, 0);

		}
	};

// the constructor that will do all the work
function Zoomer( content ) {

	this.setLevels = function() {

		if (this.docWidth > 1500) {
			this.levels = 6.2;
			this.verticalTranslate = 3000;
		} else if (this.docWidth > 1350) {
			this.levels = 6;
			this.verticalTranslate = 2750;
		} else if (this.docWidth > 1250) {
			this.levels = 5.8;
			this.verticalTranslate = 2450;
		} else if (this.docWidth > 1150) {
			this.levels = 5.7;
			this.verticalTranslate = 2350;
		} else if (this.docWidth > 1050) {
			this.levels = 5.5;
			this.verticalTranslate = 2100;
		} else if (this.docWidth > 950) {
			this.levels = 5.35;
			this.verticalTranslate = 1900;
		} else if (this.docWidth > 850) {
			this.levels = 5.15;
			this.verticalTranslate = 1700;
		} else {
			this.levels = 4.9;
			this.verticalTranslate = 1520;
		}

	};



	// keep track of DOM
	this.content = content;

	this.header = $('.page-header');
	this.body = $('body');
	this.town = $('.illust-level--town');
	this.townSymbols = $('.illust-level--symbolsTown');
	this.house = $('.svg-house');
	this.carollers = $('.svg-carollers');
	this.star = $('.svg-star');

	// position of vertical scroll
	this.scrolled = 0;

	var body = document.body,
		html = document.documentElement;

	// height of document
	this.docHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
	this.docWidth = html.clientWidth;

	// zero-based number of sections
	this.setLevels();


	// bind Zoomer to scroll event
	window.addEventListener( 'scroll', this, false);
}

// enables constructor to be used within event listener
// like obj.addEventListener( eventName, this, false )
Zoomer.prototype.handleEvent = function( event ) {
	if ( this[event.type] ) {
		this[event.type](event);
	}
};

// triggered every time window scrolls
Zoomer.prototype.scroll = function( event ) {

	this.recalculatePositions();

};

Zoomer.prototype.recalculatePositions = function () {

	//LETS HAVE SOME DEFAULTS HERE
	var INITIAL_TOWN_WIDTH = 350,
		INITIAL_TOWN_HEIGHT = 320,
		TARGET_TOWN_WIDTH = 2800,
		TARGET_TOWN_HEIGHT = 2560,

		TARGET_BG_ZSCALE = 200,

		OFFSET_MARGIN = 80,

		TARGET_VERTICAL_TRANSLATE = 2600;


	var supportPageOffset = window.pageXOffset !== undefined;
	var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

	var yOffset = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

	// normalize scroll value from 0 to 1
	this.scrolled = yOffset / ( this.docHeight - window.innerHeight );

	var transformValue,
		townTransform,
		symboltransformValue;

	this.checkStates();

	var scrollFactor = (this.scrolled < 0.5 ? this.scrolled : 0.5);
	var scale = Math.pow( 3, scrollFactor * this.levels );
	var townHeight = Math.round(scale * INITIAL_TOWN_HEIGHT);
	var townWidth = Math.round(scale * INITIAL_TOWN_WIDTH);
	var townOffset = Math.round(scale * OFFSET_MARGIN) - OFFSET_MARGIN;

	//first half of app is the scale – this zooms into the house
	if (scrollFactor < 0.5) {

		var townYPos = Math.round(((townHeight / 2) + townOffset));

		//if we support translate3d
		if (KO.UI.supports.transform3d) {
			transformValue = 'translate3d(0, 0, 0) scale(' + scale + ')';

			townTransform = 'translate3d(-50%, -' + townYPos + 'px, 0)';
			symboltransformValue = 'translate3d(-' + (townWidth / 2) + 'px, -' + townYPos + 'px, 0)' + ' scale(' + scale + ')';
		} else {
			transformValue = 'translate(0, 0) scale(' + scale + ')';

			townTransform = 'translate(-50%, -' + townYPos + 'px)';
			symboltransformValue = 'translate(-' + (townWidth / 2) + 'px, -' + townYPos + 'px)' + ' scale(' + scale + ')';
		}

	//the second half is the translate vertically
	} else {

		var percentageThroughSection = ((this.scrolled - 0.5) / 0.5); //get the percentage of the amount through the section (on a scale 0-1)
		var verticalTranslate = percentageThroughSection * this.verticalTranslate; //gets a scaled amount dependent on the percentage of the section scrolled through

		var townYPos = Math.round((townHeight / 2) + townOffset - verticalTranslate);

		//if we support translate3d
		if (KO.UI.supports.transform3d) {
			transformValue = 'translate3d(0, 0, 0) scale(' + scale + ')';
			townTransform = 'translate3d(-50%, -' + townYPos + 'px, 0)';
		} else {
			transformValue = 'translate(0, 0) scale(' + scale + ')';
			townTransform = 'translate(-50%, -' + townYPos + 'px)';
		}

	}

	// SETTING OF OUR NEW VALUES

	//update width and height of town
	this.town[0].style.width = townWidth + 'px';
	this.town[0].style.height = townHeight + 'px';

	// //update the transformed value for the town
	this.town[0].style.WebkitTransform = townTransform;
	this.town[0].style.MozTransform = townTransform;
	this.town[0].style.msTransform = townTransform;
	this.town[0].style.transform = townTransform;

	// //update scale factor of the outside illustrations and text
	// if(navigator.userAgent.toLowerCase().indexOf('firefox') === -1) {
		this.content[0].style.WebkitTransform = transformValue;
		this.content[0].style.MozTransform = transformValue;
		this.content[0].style.msTransform = transformValue;
		this.content[0].style.transform = transformValue;
	// }

	// //town symbols scaling
	this.townSymbols[0].style.WebkitTransform = 'scale(' + scale + ')';
	this.townSymbols[0].style.MozTransform = 'scale(' + scale + ')';
	this.townSymbols[0].style.msTransform = 'scale(' + scale + ')';
	this.townSymbols[0].style.transform = 'scale(' + scale + ')';

};


Zoomer.prototype.checkStates = function () {

	if (this.scrolled > 0) {
		this.header.addClass('scaled');
	} else {
		this.header.removeClass('scaled');
	}


	//do a test whether to switch to night or not (after 0.25 scrolled)
	if (this.scrolled > 0.15) {
		this.body.addClass('night');
	} else {
		this.body.removeClass('night');
	}

	//test between state of movement
	if (this.scrolled < 0.5) {

		this.house.removeClass('inactive'); //make house visible
		this.carollers.removeClass('inactive'); //make carollers invisible
		this.star.addClass('inactive'); //make carollers invisible
		this.townSymbols.find('.symbols--inside').addClass('inactive'); //make nativity symbols not visible
		this.townSymbols.find('.symbols--outside').removeClass('inactive'); //make nativity symbols not visible

	} else {

		this.house.addClass('inactive'); //make house not visible
		this.carollers.addClass('inactive'); //make carollers invisible
		this.star.removeClass('inactive'); //make carollers invisible
		this.townSymbols.find('.symbols--inside').removeClass('inactive'); //make nativity symbols visible
		this.townSymbols.find('.symbols--outside').addClass('inactive'); //make nativity symbols not visible
	}
};


})(window.KO = window.KO || {}, jQuery);