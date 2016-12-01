/**
 * Created by hanmengjiao on 11/24/16.
 */

function CompareView()
{
	var self = this;
	var header_text = [
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
	 * Initialization
	 */
	self.init = function () {
		self.hidden = false;
		var div = document.getElementById('CompareView');  // shortcuts
		var style = window.getComputedStyle(div, null);   // shortcuts
		//save margin
		self.margin = {
			left:   130,
			right:  100,
			top:    200,
			bottom: 40
		};
		// save width and height
		self.width = parseInt(style.getPropertyValue("width"), 10);
		self.height = 700;
		// setup class fields
		self.div = d3.select('#CompareView');
		self.svg = d3.select('#CompareView').append('svg')
			.attr('width', self.width)
			.attr('height', self.height);
	};

	/**
	 * Update/Draw View Function
	 * @param player1
	 * @param player2
	 */
	self.update = function () {
		var player1 = globData.currPlayerData,
			player2 = globData.comparePlayerData;
		// player name
		var player1_name = player1.info.FIRST_NAME + ' ' + player1.info.LAST_NAME;
		var player2_name = player2.info.FIRST_NAME + ' ' + player2.info.LAST_NAME;
		// career season
		var season1 = player1.info.FROM_YEAR + ' - ' + player1.info.TO_YEAR;
		var season2 = player2.info.FROM_YEAR + ' - ' + player2.info.TO_YEAR;
		// construct data
		var info = [player1_name,season1,player2_name,season2];
		// header
		var header = player1.career.header;
		var i, temp, G;
		//
		// --- Obtain player1 Data
		{
			var PostSeason1 = player1.career.PostSeason;
			var RegularSeason1 = player1.career.RegularSeason;
			// get GS and GP
			G = [PostSeason1.GP + RegularSeason1.GP, PostSeason1.GS + RegularSeason1.GS];
			// get perGame data from PostSeason and RegularSeason
			var perGame1 = [];
			for (i = 0; i < header.length; i++) {
				temp = PostSeason1.PerGame[i] + RegularSeason1.PerGame[i];
				perGame1.push(temp);
			}
			// Combine perGame Data for player1
			perGame1 = G.concat(perGame1);
		}
		//
		// --- Obtain player2 Data
		{
			var PostSeason2 = player2.career.PostSeason;
			var RegularSeason2 = player2.career.RegularSeason;
			// get GS and GP
			G = [PostSeason2.GP + RegularSeason2.GP, PostSeason2.GS + RegularSeason2.GS];
			// get perGame data from PostSeason and RegularSeason
			var perGame2 = [];
			for (i = 0; i < header.length; i++) {
				temp = PostSeason2.PerGame[i] + RegularSeason2.PerGame[i];
				perGame2.push(temp);
			}
			// Combine perGame Data for player2
			perGame2 = G.concat(perGame2);
		}
		// Get header
		header = ['GP', 'GS'].concat(header);
		// Drawing perGame View
		self.perGameView(self.svg,header,perGame1,perGame2,info);
	};

	/**
	 *
	 * @param svg
	 * @param header
	 * @param perGame1
	 * @param perGame2
	 * @param info
	 */
	self.perGameView = function(svg,header,perGame1,perGame2,info)
	{
		var ratio = self.width / 1520; // my stupid way of getting ratio
		// --- Drawing Per Game View
		var l = self.margin.left * ratio, // left
			r = self.margin.right * ratio, // left
			t = self.margin.top * ratio;  // top
		var W = self.width - l - r;
		// define some bar stuffs
		var barH = 18 * ratio;
		var barP = 4  * ratio;

		// Define tooltip for rect
		var tooltip = d3.select("#CompareView").selectAll('div').data([0]).enter().append('div')
			.attr('class','compare-bar-tip')
			.attr('opacity',0);

		// Drawing bar chart
		var perGame = perGame1.concat(perGame2);
		console.log(perGame);
		// empty svg
		// <div id="CompareView">
		// 	   <svg width="1883" height="700"></svg>
		//     <div class="bar-tip" opacity="0"></div>
		// </div>
		svg.selectAll('*').remove();
		var bar = svg.selectAll('g').data([0]).enter().append('g').selectAll('rect').data(perGame);
		var barEnter = bar.enter(); // create all bars here
		bar.exit().remove();        //
		bar = bar.merge(barEnter);  //
		barEnter
			.append('rect')
			.attr('x', function(d,i) {
				var len =  header.length;
				if (i < len) { // left part
					return l;
				} else { // -- // right part
					var p = W * (perGame1[i-len]/(perGame2[i-len] + perGame1[i-len]));
					return l + p;  //* ratio;
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
				if(i<header.length){
					var p = perGame1[i]/(perGame1[i] + perGame2[i]);
					var w = p * W;
					return w;
				}else{
					var m = i - header.length;
					var p = perGame2[m]/(perGame1[m] + perGame2[m]);
					var w = p * W;
					return w;
				}
			})
			.attr('class', function(d,i){
				if (i < header.length) {
					return 'compare-bar-left';
				} else{
					return "compare-bar-right";
				}
			})
			.attr('opacity',0.5)
			.on('mouseover', function(d,i){
				d3.select(this).attr('opacity',1);
				if (i < header.length){
					tooltip.transition()
						.duration(200)
						.style('opacity',1);
					tooltip.html("<strong>" + info[0] + "</strong>" +
						'<br/><span>' + 'Season:  ' + info[1] + '</span>' +
						'<br/><span>' + 'Performance:  ' + header_text[i] + '</span>' +
						'<br/><span>' + 'Value:  ' + d + '</span>')
						.style("left", d3.event.pageX + "px")
						.style("top", d3.event.pageY + "px");}
				else{
					tooltip.transition()
						.duration(200)
						.style('opacity',1);
					tooltip.html("<strong>" + info[2] + '</strong>' +
						'<br/><span>Season:  ' + info[3] + '</span><br/>' +
						'<span>Performance:  ' + header_text[i - header.length] + '</span>' +
						'<br/><span>Value:  ' + d + '</span>')
						.style("left", d3.event.pageX + "px")
						.style("top", d3.event.pageY + "px");}
			})
			.on('mouseout',function(d){
				d3.select(this).attr('opacity',0.6);
				tooltip.transition()
					.duration(500)
					.style('opacity',0);
			});
		// append title
		svg.append('path').attr('d','M'+(l+W/2)+','+(t-barP)+'L'+(l+W/2)+','+(t+(barH+barP)*header.length))
			.classed('compare-midline', true);
		svg
			.append('g')
			.append('text')
			.attr('x', self.width / 2)
			.attr('y', t/2 + 30 * ratio)
			.style("font-size", (30 * ratio) + "px")
			.text('Comparison View of Average Per Game Performance in whole career')
			.classed('compare-title', true);
		// Define d for the header tooltip
		var h = svg.append('g').selectAll('text').data(header).enter();
		var div = d3.select("#CompareView").append('div')
			.attr('class','compare-header-tooltip')
			.attr('opacity',0);
		h.append('text')
			.attr('x', l-5 * ratio)
			.attr('y',function(d,i){ return t + barH * (i+1) + barP * i; })
			.text(function(d){
				return d.replace('_PCT', '%');
			})
			.classed('compare-header',true)
			.on('mouseover', function(d,i){
				d3.select(this).attr('font-weight','bold');
				div.transition().duration(100).style('opacity',0.9);
				div.html(header_text[i])
					.style("left", l + 'px' )
					.style("top",  d3.event.pageY + 'px' );
			})
			.on('mouseout',function(d){
				d3.select(this).attr('font-weight','regular');
				div.transition()
					.duration(200)
					.style('opacity',0);
			});
	};

	/**
	 * Resize function
	 */
	self.resize = function ()
	{
		// adjust svg width only
		var div   = document.getElementById('CompareView'); // shortcuts
		var style = window.getComputedStyle(div, null);     // shortcuts
		self.width  = parseInt(style.getPropertyValue("width"), 10);
		self.svg.attr('width',  self.width);
		self.update();
	};

	/**
	 * Hide function
	 */
	self.hide = function(){
		self.hidden = true;
		self.div.selectAll('*').remove();
		self.div.style('display','none');
	};

	/**
	 * Show function
	 */
	self.show = function(){
		self.hidden = false;
		self.init();
		self.update();
	};


}
