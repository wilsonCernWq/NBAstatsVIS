/**
 * Created by hanmengjiao on 11/24/16.
 */
/**
 *
 * @constructor
 */
function CompareView()
{
	var self = this;

	self.hidden = false;

	var headerText = [
		'Game Played',
		'Game Started',
		'Min',
		'Field Goals Made',
		'Field Goals Attempted',
		'Field Goals Percentage',
		'Three-point Field Goals Made',
		'Three-point Field Goals Attempted',
		'Three-point Field Goals Percentage',
		'Free Throws Made',
		'Free Throws Attempted',
		'Free Throws Percentage',
		'Offensive Rebounds',
		'Defensive Rebounds',
		'Rebounds',
		'Assists',
		'Steals',
		'Blocks',
		'Turnovers',
		'Personal Fouls',
		'Points'
	];

	/**
	 * setMargin: Setup Margin Values
	 */
	self.setMargin = function () {
		self.margin = {
			left:   430 * self.ratio,
			right:  400 * self.ratio,
			top:    200 * self.ratio,
			bottom: 40  * self.ratio
		};
	};

	/**
	 * Initialization (CAN BE CALLED FOR MULTIPLE TIMES)
	 */
	self.init = function () {

		// * Initialize Class Fields
		// --- selections
		d3.select('#CompareView').selectAll('*').remove(); // clean up
		self.div = d3.select('#CompareView');
		self.svg = d3.select('#CompareView').append('svg');

		// * Compute Style
		// --- calculate current style
		var div = document.getElementById('CompareView'); // shortcuts
		var sty = window.getComputedStyle(div, null);     // shortcuts
		var width = parseInt(sty.getPropertyValue("width"), 10);

		// * Setup Element Attributes
		// --- setup rescaling coefficient
		self.ratio = width / 1500; // how to calculate this defines the rescaling behaviors
		// --- get window width
		self.svgW = self.ratio * 1500;
		self.svgH = self.ratio * 700;
		self.setMargin();
		// --- setup svg fields
		self.svg
			.attr('width',  self.svgW)
			.attr('height', self.svgH);

	};

	/**
	 * Update/Draw View Function
	 */
	self.update = function () {

		// * Pre-Process Data
		var player1 = globData.currPlayerData,
			player2 = globData.comparePlayerData;
		var header  = player1.career.header;
		// --- player name
		var player1_name = player1.info.FIRST_NAME + ' ' + player1.info.LAST_NAME,
			player2_name = player2.info.FIRST_NAME + ' ' + player2.info.LAST_NAME;
		// --- career season
		var season1 = player1.info.FROM_YEAR + ' - ' + player1.info.TO_YEAR,
			season2 = player2.info.FROM_YEAR + ' - ' + player2.info.TO_YEAR;
		// --- attributes
		var processPlayer = function (playerData) {
			var i, temp, G; // temp variables
			var pSeason = playerData.career.PostSeason;
			var rSeason = playerData.career.RegularSeason;
			// --- get GS and GP
			G = [pSeason.GP + rSeason.GP, pSeason.GS + rSeason.GS];
			// --- get perGame data from PostSeason and RegularSeason
			var perGame1 = [];
			for (i = 0; i < header.length; i++) {
				temp = 0;
				temp += pSeason.PerGame[i] ? pSeason.PerGame[i] * pSeason.GP : 0;
				temp += rSeason.PerGame[i] ? rSeason.PerGame[i] * rSeason.GP : 0;
				temp /= G[0];
				perGame1.push(temp);
			}
			// Combine perGame Data for player1
			return G.concat(perGame1);
		};
		// --- player 1 Data
		var perGame1 = processPlayer(player1),
			perGame2 = processPlayer(player2);
		// --- update header
		header = ['GP', 'GS'].concat(header);
		// --- construct data
		var info = [player1_name,season1,player2_name,season2];
		// --- debug
		if (!debugMuteAll) {
			console.log('comparing', player1, player2);
		}
		// --- drawing per-game view
		self.perGameView(self.svg,header,perGame1,perGame2,info);
	};

	/**
	 * perGameView: Drawing Per-Game View
	 * @param svg
	 * @param header
	 * @param perGame1
	 * @param perGame2
	 * @param info
	 */
	self.perGameView = function(svg,header,perGame1,perGame2,info) {

		// * Get Rescaling Ratio
		var ratio = self.ratio; // my stupid way of getting ratio

		// --- Drawing Per Game View
		var l = self.margin.left,  // left
			r = self.margin.right, // left
			t = self.margin.top;   // top
		var W = self.svgW - l - r;
		// --- define bar styling parameters
		var barH = 18 * ratio,
			barP = 4  * ratio,
			barOpacity = 0.5;
		// --- define title style
		var titleYoff = t/2 + 30 * ratio,
			titleFontSize = 30 * ratio;
		// --- define attribute header style
		var headerXoff = l-5 * ratio,
			headerFontSize = (isMac ? 14 : 16) * ratio;
		// --- tip parameter
		var tipOpacity = 0.9;

		// * Define Tooltips for rect
		var rectTip = self.div.append('div')
			.attr('class','compare-bar-tip')
			.style('display','none')
			.attr('opacity',0);
		var headerTip = self.div.append('div')
			.attr('class','compare-header-tip')
			.style('display','none')
			.attr('opacity',0);

		// * Drawing Bar Chart
		// --- prepare data
		var perGame = perGame1.concat(perGame2);
		// --- draw svg
		svg.selectAll('*').remove();
		d3SelectAll(svg.append('g'), 'rect', perGame)
			.attr('x', function(d,i) {
				var len =  header.length;
				if (i < len) { // left part
					return l;
				} else {       // right
					var p = W * (perGame1[i-len]/(perGame2[i-len] + perGame1[i-len]));
					return l + p;
				}
			})
			.attr('y',function (d,i) {
				if (i < header.length) {
					return t + (barH + barP) * i;
				} else {
					return t + (barH + barP) * (i - header.length);
				}
			})
			.attr('height', barH)
			.attr('width', function(d,i){
				var w, p;
				if(i<header.length){
					p = perGame1[i] / (perGame1[i] + perGame2[i]);
					w = p * W;
				} else {
					var m = i - header.length;
					p = perGame2[m] / (perGame1[m] + perGame2[m]);
					w = p * W;
				}
				return w;
			})
			.attr('class', function(d,i){ return (i < header.length) ?  'compare-bar-left' : "compare-bar-right"; })
			.attr('opacity',barOpacity)
			.on('mouseover', function(d,i){
				d3.select(this).attr('opacity',1);
				var innerHtml =
					"<strong>" + (i<header.length?info[0]:info[2]) + "</strong>" +
					'<br/><span>Season:  ' + (i<header.length?info[1]:info[3]) + '</span>' +
					'<br/><span>Performance:  ' + (i<header.length?headerText[i]:headerText[i-header.length]) + '</span>' +
					'<br/><span>Value:  ' + d.toFixed(1) + '</span>';
				// --- show tip with texts
				rectTip.transition()
					.style('display',null)
					.duration(200)
					.style('opacity',tipOpacity);
				rectTip
					.html(innerHtml)
					.style("left", d3.event.pageX + "px")
					.style("top",  d3.event.pageY + "px");
			})
			.on('mouseout',function(d){
				d3.select(this).attr('opacity',barOpacity);
				rectTip.transition().duration(500).style('opacity',0).style('display','none');
			});
		// --- draw a vertical line in the middle
		svg.append('path')
			.attr('d','M'+(l+W/2)+','+(t-barP)+'L'+(l+W/2)+','+(t+(barH+barP)*header.length))
			.classed('compare-midline', true);
		// --- plot the overall title for this view
		svg.append('g').append('text')
			.attr('x', self.svgW / 2).attr('y', titleYoff)
			.style("font-size", titleFontSize + "px")
			.classed('compare-title', true)
			.text('Comparison View of Average Per Game Performance in whole career');
		// --- plot attribute titles
		svg.append('g').selectAll('text').data(header)
			.enter().append('text')
			.attr('x', headerXoff)
			.attr('y', function (d,i) { return t + barH * (i+1) + barP * i; })
			.style('font-size', headerFontSize)
			.classed('compare-header', true)
			.text(function(d){ return d.replace('_PCT', '%'); })
			.on('mouseover', function(d,i){
				d3.select(this).attr('font-weight','bold');
				headerTip.transition().duration(100).style('display',null).style('opacity',tipOpacity);
				headerTip.html(headerText[i])
					.style("left", l+'px' ).style("top",  d3.event.pageY + 'px' );
			})
			.on('mouseout',function(d){
				d3.select(this).attr('font-weight','regular');
				headerTip.transition().duration(200).style('opacity',0).style('display','none');
			});

	};

	/**
	 * Resize function
	 */
	self.resize = function () {

		// * Compute Style
		// --- calculate current style
		var div = document.getElementById('CompareView'); // shortcuts
		var sty = window.getComputedStyle(div, null);     // shortcuts
		var width = parseInt(sty.getPropertyValue("width"), 10);

		// * Setup Element Attributes
		// --- setup rescaling coefficient
		self.ratio = width / 1500; // how to calculate this defines the rescaling behaviors
		// --- get window width
		self.svgW = self.ratio * 1500;
		self.svgH = self.ratio * 700;
		self.setMargin();
		// --- setup svg fields
		self.svg
			.attr('width',  self.svgW)
			.attr('height', self.svgH);

		// * Update View
		self.update();

	};

	/**
	 * Hide function
	 */
	self.hide = function () {

		self.hidden = true;
		self.svg.selectAll('*').remove();
		self.div.style('display','none');

	};

	/**
	 * Show function
	 */
	self.show = function() {

		self.hidden = false;
		self.div.style('display',null);
		self.init();
		self.update();

	};

}
