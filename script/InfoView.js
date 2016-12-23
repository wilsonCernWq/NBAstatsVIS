/**
 * Class to display general information of a player
 * @constructor
 */
function InfoView () {

    var self = this;

    self.defaultW = 1500;
	self.defaultH = 300;

    self.setMargin = function () {
	    self.margin = {
		    left:   0.0 * self.svgW,
		    right:  0.0 * self.svgW,
		    top:    0.1 * self.svgH,
		    bottom: 0.1 * self.svgH
	    };
    };

    self.setupSize = function (W,H,lw,lh,bw,bh) {

	    // * Setup Element Attributes
	    // --- setup rescaling coefficient
	    var w = window.innerWidth;
	    var h = window.innerHeight;
	    // how to calculate this defines the rescaling behaviors
	    if (W && H) {
		    self.ratio = Math.min(w/1500, h/300);
	    } else if (!H) {
		    self.ratio = w/1500;
	    } else if (!W) {
		    self.ratio = h/300;
	    } else {
		    self.ratio = 1;
	    }
	    // --- save width and height
	    self.svgW = self.ratio * lw + (bw?bw:0);
	    self.svgH = self.ratio * lh + (bh?bh:0);
	    self.setMargin();
	    self.svg.attr('width',  self.svgW).attr('height', self.svgH);

    };

    /**
     * Initialization (CAN BE CALL MULTIPLE TIMES)
     */
    self.init = function()
    {
	    // * Initialize Class Fields
	    // --- other fields
	    self.hidden = false;
	    // --- HTML selections
	    d3.select('#divInfoView').selectAll('*').remove(); // delete everything for preventing bugs
	    self.div = d3.select('#divInfoView');
	    // (two button)
	    self.div.append('button')
		    .style('display','none')
		    .attr('onclick', 'myChangePlayer(this)')
		    .text('Change Player');
	    self.div.append('button')
		    .style('display','none')
		    .attr('onclick', 'myComparePlayer(this)')
		    .text('Compare');
	    // (SVG elements)
	    self.svg     = self.div.append('svg').attr('id','svgInfoView');
	    //  -- left part
	    self.left = self.right = self.svg.append('g');
	    self.grpCurr = self.left.append('g').attr('id','groupCurrPlot-InfoView');
	    self.grpCurrAxis = self.left.append('g').attr('id','groupYearAxis-InfoView');
	    //  -- right part
	    self.right = self.svg.append('g');
	    self.grpComp = self.right.append('g').attr('id','groupCompPlot-InfoView');
	    self.grpCompAxis = self.right .append('g').attr('id','groupCompYearAxis-InfoView');
	    //  -- radial plot
	    self.grpRadial = self.svg.append('g').attr('id','radialPlot-InfoView');

	    // * Constructure Correct Structures
	    // --- add image
	    self.grpCurr.append('image');
	    self.grpComp.append('image');
	    // --- current view
	    self.grpCurrAxis.append('g').classed('axisGroup-InfoView', true);
	    self.grpCurrAxis.append('g').classed('barsGroup-InfoView', true);
	    self.grpCurrAxis.append('g').classed('brushGroup-InfoView', true);
	    // --- compare view
	    self.grpCompAxis.append('g').classed('axisGroup-InfoView', true);
	    self.grpCompAxis.append('g').classed('barsGroup-InfoView', true);
	    self.grpCompAxis.append('g').classed('brushGroup-InfoView', true);

	    // * Setup Element Attributes
	    self.setupSize(true,true,self.defaultW,self.defaultH,0,0);

    };

	/**
	 * Function to resize
	 */
	self.resize = function () {

		// * Setup Element Attributes
		self.setupSize(true,true,self.defaultW,self.defaultH,0,0);

		// * Update View
		if (globData.compareMode) {
			self.compare();
		} else {
			self.update();
		}

	};

	/**
	 * Hide the Radial Plot
	 */
	self.hideRadial = function () { self.grpRadial.selectAll('*').remove(); };

	/**
	 * Hide the Axis Group
	 * @param AxisGrp
	 */
	self.hideAxis = function (AxisGrp) {

		AxisGrp.select('.axisGroup-InfoView').selectAll('*').remove();
		AxisGrp.select('.barsGroup-InfoView').selectAll('*').remove();
		AxisGrp.select('.brushGroup-InfoView').selectAll('*').remove();

	};

	/**
	 * Hide the Player Bio View
	 * @param Grp
	 */
	self.hideOneView = function (Grp) {

		Grp.select('image').remove();
		Grp.append('image');
		Grp.selectAll('text').remove();

	};

	/**
	 * Hide all view entirely
	 */
	self.hide  = function () {

		self.hidden = true;
		self.div.selectAll('*').remove();

	};

	/**
	 * show this view
	 */
	self.show = function () {

		self.hidden = false;
		self.init();
		self.update();

	};

    /**
     * self is a function to draw/update view
     */
    self.update = function()  {

	    // * Setup Element Attributes
	    self.setupSize(true,true,self.defaultW,self.defaultH,0,0);

    	// * Put button on right position
	    var buttonH = 30  * self.ratio,
		    buttonW = 100 * self.ratio,
		    buttonP = 10  * self.ratio,
		    buttonYOff = 5 * self.ratio,
		    buttonXOff = 5 * self.ratio,
		    buttonFontSize = 10  * self.ratio;
	    self.div.selectAll('button')
		    .style('top',  buttonYOff + 'px')
		    .style('left', function (d,i) { return buttonXOff + i * (buttonW + buttonP) + 'px'; })
		    .style('width',  buttonW + 'px')
		    .style('height', buttonH + 'px')
		    .style('font-size', buttonFontSize + 'px')
		    .style('display',null);

	    // * Call Sub-Views
    	// --- hide right view
	    self.hideOneView(self.grpComp);
	    self.hideAxis(self.grpCompAxis);
    	// --- draw new stuffs
        var player = globData.currPlayerData;
        self.PlayerView(self.grpCurr, player);
	    self.SeasonView(self.grpCurrAxis, player);
        self.RadialView(self.grpRadial, player);

    };


	/**
	 * draw compare view
	 */
	self.compare = function () {

		// * Setup Element Attributes
		self.setupSize(true,false,1500,self.defaultH,-35,0);

		// * Put button on right position
		var buttonH = 30  * self.ratio,
			buttonW = 100 * self.ratio,
			buttonP = 10  * self.ratio,
			buttonYOff = 5 * self.ratio,
			buttonXOff = 5 * self.ratio,
			buttonFontSize = 10  * self.ratio;
		self.div.selectAll('button')
			.style('top',  buttonYOff + 'px')
			.style('left', function (d,i) { return buttonXOff + i * (buttonW + buttonP) + 'px'; })
			.style('width',  buttonW + 'px')
			.style('height', buttonH + 'px')
			.style('font-size', buttonFontSize + 'px')
			.style('display',null);

		// * Get Data
		var player1 = globData.currPlayerData;
		var player2 = globData.comparePlayerData;
		// --- shift right area to correct place
		self.right.attr('transform', 'translate(' + (self.svgW/2) + ',0)');
		// --- clean radial
		self.hideRadial();
		// --- draw new stuffs
		self.PlayerView(self.grpCurr, player1);
		self.SeasonView(self.grpCurrAxis, player1);
		self.PlayerView(self.grpComp, player2);
		self.SeasonView(self.grpCompAxis, player2);
		// --- clean brush
		self.div.selectAll('.brushGroup-InfoView').html('');

	};

    /**
     * function to check if the icon file exist
     * @param url path to the file
     * @returns {boolean} if the file exists
     */
    self.fileExists = function  (url)
    {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false); //< make sure async is true
        http.send();
        return http.status != 404;
    };

    /**
     * generate one view under a group tag
     * @param group
     * @param player
     * @return {number}
     */
    self.PlayerView = function (group, player)
    {
    	// * Short Cut names
	    var id = player.info.PERSON_ID;
        var ratio = self.ratio;

	    // * Define Style Parameters
	    // --- name parameters
        var nameSize = 16 * ratio, // player name font size
            nameYoff = 50 * ratio; // player name font height
	    // --- text parameters
        var textSize   = 12 * ratio,
            textHeight = 16 * ratio,
	        textYoff  = 10 * ratio,  // space abvoe the main text
            textXoff  = 200 * ratio; // space between divide left border and main text left border
	    // --- image parameters
        var imageW = 184 * ratio, // profile picture width
            imageH = 110 * ratio, // profile picture height
	        imageXoff = (textXoff - imageW)/2,
            imageYoff = 20 * ratio;    // space between profile picture and divide border

	    // * Plot Objects
        // --- attach an image under for profile picture
        var img = group.select('image')
	        .attr('x',imageXoff + self.margin.left)
	        .attr('y',imageYoff + self.margin.top )
            .attr('width',  imageW)
            .attr('height', imageH);
        var url = 'data/playerProfile/' + id + '.png';
        if (self.fileExists(url)) {
            img.attr("xlink:href", url);
        } else {
            img.attr("xlink:href", 'data/playerProfile/NoFound.png');
        }
	    // --- attach player information (construct data)
        var localPlayerData = [];
        var teamID = globData.globTeamList.lookup[player.info.TEAM];
        try {
            localPlayerData
	            .push(
	            	'Team: ' +
		            globData.globTeamList.current[teamID].TEAM_CITY + ' ' +
		            globData.globTeamList.current[teamID].TEAM_NAME);
        } catch (e) {
	        localPlayerData.push('Team:');
	        if (!debugMuteAll) {
		        console.log('Error Team Name: ', player.info.TEAM);
	        }
        }
        if (player.info.POSITION)   { localPlayerData.push('Position: ' + player.info.POSITION); }
        if (player.info.HEIGHT)     { localPlayerData.push('Height: ' + player.info.HEIGHT + ' ft'); }
        if (player.info.WEIGHT)     { localPlayerData.push('Weight: ' + player.info.WEIGHT + ' lbs'); }
        if (player.info.BIRTHDATE)  { localPlayerData.push('Birthday: ' + player.info.BIRTHDATE.slice(0,10)); }
        if (player.info.SEASON_EXP) { localPlayerData.push('Experience: ' + player.info.SEASON_EXP + ' years'); }
	    if (player.info.SCHOOL)     { localPlayerData.push('Prior School: ' + player.info.SCHOOL); }
        localPlayerData.push('Seasons: ' + player.info.FROM_YEAR + ' - ' + player.info.TO_YEAR);
	    if (player.info.JERSEY)     { localPlayerData.push('Jersey: ' + player.info.JERSEY); }
	    if (player.info.ALL_STAR)   { localPlayerData.push('All Star Appearance: ' + player.info.ALL_STAR); }
	    // --- draw texts
        group.selectAll('text').remove();
        group.selectAll('text').data(localPlayerData).enter().append('text')
            .attr('x', textXoff + self.margin.left)
            .attr('y', function (d, i) { return textYoff + (1 + i) * textHeight + self.margin.top })
            .style('font-size', textSize)
	        .classed('info-text', true)
	        .text(function (d) { return d; });
	    // --- attach header (player name)
        group.append('text')
            .attr('x', textXoff/2 + self.margin.left)
            .attr('y', imageH + nameYoff + self.margin.top)
            .style('font-size', nameSize)
	        .classed('info-title', true)
	        .text(player.info.FIRST_NAME + ' ' + player.info.LAST_NAME);

    };

	/**
	 * generate the axis under a group tag
	 * @param group
	 * @param player
	 * @return {number}
	 */
    self.SeasonView = function (group, player)
    {
        // * Shortcut Variable Name
        var sYear = player.info.FROM_YEAR;
        var eYear = player.info.TO_YEAR;
        var numOfYears = eYear - sYear + 1;
	    var ratio = self.ratio; // rescaling ratio

        // * Define Styling Parameters
        var spanRatio = 0.4; // the length of the axis (count from left end)
	    // --- total offset
        var totalYoff = 150 * ratio + self.margin.top, // this equals to the icon image height + name font height
	        totalXoff = 10  * ratio + self.margin.left,
            totalYPad =  30 * ratio;                   // this is the margin for axis and info view
        // --- axis parameters
	    var axisHeight   = 40 * ratio,  // the height of axis
            axisFontSize = 10 * ratio;  // font size of axis ticks
        // --- bar above the axis
	    var barH      = 10 * ratio, // rect size
            barP      = 1 * ratio,  // padding between two neighboring bars
	        barYoff   = 5 * ratio,  // padding between bar and axis
	        barStroke = 2 * ratio;  // bar stroke
        // -- leam logo
	    var logoOffY  = 15 * ratio, // padding between team logo and bars
            logoSize  = 40 * ratio; // size of logo image
        var brushPad  = -2 * ratio; // padding for brush
        // -- calculate total plotting area
        var plotYoff = totalYoff + totalYPad + logoOffY + logoSize,
	        plotXoff = totalXoff,
	        plotW    = (self.svgW - self.margin.left - self.margin.right) * spanRatio;

        // * Prepare Data
        var year, team = null, PlayerTeamList = [];
        for (year = sYear; year <= eYear; ++year) {
            if (player.season.RegularSeason.hasOwnProperty(year)) {
                if (team != player.season.RegularSeason[year].team) {
                    // remember current team
                    team = player.season.RegularSeason[year].team;
                    // create new data object
                    PlayerTeamList.push({ team: team, yearFrom: year, yearTo: year});
                } else {
                    PlayerTeamList[PlayerTeamList.length-1].yearTo = year; // update yearTo information
                }
            } else {team = null; }
        }

        // * DRAWING
        // --- create scale and axis
        var scale = d3.scaleLinear()
            .domain([sYear - 0.5, eYear + 0.5]) // the range is being shifted, for axis ticks
            .range([plotXoff, plotW + plotXoff]);
        var axis  = d3.axisBottom().scale(scale).ticks(numOfYears,'d').tickSizeOuter(0);
        // --- adjust group properties
        group
            .attr('transform', 'translate(' + plotXoff + ',' + plotYoff + ')') // shift group position
            .select('.axisGroup-InfoView').call(axis) // create axis (the axis will be created at level y = 0)
            .selectAll('text')
	        .attr('transform','translate(' + (12*ratio) + ',' + (11*ratio) + ') rotate(60)')
            .style('font-size', axisFontSize); // adjust axis font size based on window size
        // draw bars
        d3SelectAll(group.select('.barsGroup-InfoView'), 'rect', PlayerTeamList)
            .attr('x', function (d) { return scale(d.yearFrom - 0.5) + barP; }) // shift things back
            .attr('y', -barH - barYoff) // shift bar based on axis position
            .attr('width', function (d) { return scale(d.yearTo + 0.5) - scale(d.yearFrom - 0.5) - barP; })
            .attr('height', barH)
            .style('stroke-width', barStroke) // give rect some strokes
            .style('stroke', 'black')          // stroke color based on team color 2
            .style('fill', function (d) {
	            var myTeamId = globData.globTeamList.lookup[d.team];
	            try {
		            return globData.globTeamList.current[myTeamId].COLOR_1; // filling with team color 1
	            } catch (e) {
	            	if (!debugMuteAll) {
			            console.log('Wrong Ream Id', d.team, myTeamId);
		            }
	            	return 'steelblue';
	            }
            });
        // draw team logo
        d3SelectAll(group.select('.barsGroup-InfoView'), 'image', PlayerTeamList)
            .attr('x', function (d) { // --> (somehow the logo is aligned at the center) applied a shift
                return scale((d.yearFrom + d.yearTo)/2) - logoSize/2; // logo align center
            })
            .attr('y', -logoSize-logoOffY) // shift logo based on axis position
            .attr('width',  logoSize)
            .attr('height', logoSize)
            .attr("xlink:href", function (d) {
	            var myTeamId = globData.globTeamList.lookup[d.team];
	            if (myTeamId) {
		            var myTeamAb = globData.globTeamList.current[myTeamId].TEAM_ABBREVIATION;
		            return 'data/teamLogo/' + myTeamAb + '_logo.svg'; // load data
	            } else {
	            	if (!debugMuteAll) {
			            console.log('Error: wrong team abbreviative', d.team);
		            }
		            return 'data/teamLogo/NBA_logo.svg';              // load data
	            }
            });

        // * Draw Brush
        // --> reference https://bl.ocks.org/mbostock/6232537
        var brush = d3.brushX()
            .extent([[totalXoff,-logoSize-logoOffY-brushPad],[totalXoff+plotW,axisHeight+brushPad]])
            .on("end", function () {
                if (!d3.event.sourceEvent) return; // Only transition after input.
                if (!d3.event.selection) { // Ignore empty selections
	                globData.currSelectedYearRange = [null, null];
                } else {
	                // calculate correct year selection
	                var value = d3.event.selection.map(scale.invert);
	                value[0] = Math.round(value[0] - 0.5);
	                value[1] = Math.round(value[1] - 0.5);
	                // ** call year selection function
	                // here I simply print things out, in the future, functions should be linked to here
	                if (value[0] < value[1]) {
		                globData.currSelectedYearRange[0] = Math.min(2015, value[0] + 1);
		                globData.currSelectedYearRange[1] = Math.min(2015, value[1]);
	                } else {
		                globData.currSelectedYearRange = [null, null];
	                }
	                console.log('selecting year: ', globData.currSelectedYearRange);
	                // adjust brush position so that it snaps on the correct year
	                value[0] += 0.5;
	                value[1] += 0.5;
	                d3.select(this).transition().call(d3.event.target.move, value.map(scale));
                }
                // call stuffs
	            MainReload(false); //< false means dont reload data
            });
        group.select('.brushGroup-InfoView')
	        .classed('brush', true)
	        .classed('brushInfoView', true)
	        .call(brush);
        group.select('.brushGroup-InfoView').select('.selection').style('display','none'); // hide selection
        group.select('.brushGroup-InfoView').select('.handle').style('display','none');    // when resizing

    };

	/**
	 * Plot Radial View
	 * @param group
	 * @param player
	 * @return {number}
	 */
    self.RadialView = function(group, player) {

    	// * Shortcut variable name
	    var ratio = self.ratio;  // rescaling ratio
        var dataSet = [["TOV"], ["REB"], ["BLK"], ["STL"], ["AST"], ["PTS"]]; // predefined data range
                                                                              // (different range for different data)
        // * Load Data
        var data = player.career.RegularSeason.PerGame;
        var head = player.career.header;
        for (var k = 0; k < dataSet.length; ++k) {
            var attrID = head.indexOf(dataSet[k][0]);
	        dataSet[k].push(globData.dataComment[dataSet[k][0]][3]);
	        dataSet[k].push(globData.dataComment[dataSet[k][0]][4]);
	        dataSet[k].push(globData.dataComment[dataSet[k][0]][5]);
            dataSet[k].push(data[attrID]);
            dataSet[k].comment = globData.dataComment[dataSet[k][0]].slice(0,3);
        }

        // * Define Plotting Parameters
	    // --- overall shift
	    var groupXoff = 550 * ratio,
		    groupYoff = self.svgH / 2;
        // --- bar parameters
        var barH = 30 * ratio,
            barWMax = 70 * ratio,
            barWMin = 30 * ratio;
        // --- index value parameters
        var attrTextFont = 12 * ratio,
            attrTextYOff =  4 * ratio,
            attrTextROff = -1 * ratio;
        // --- attribute tag parameters
        var attrTagFont =  14 * ratio,
            attrTagYOff =   4 * ratio,
            attrTagROff = -30 * ratio;
        // --- PIC parameters
        var attrPIEFont =  14 * ratio,
            attrPIEYOff =   5 * ratio,
	        attrPIERadius = 30 * ratio;

        // * Define Tooltip
	    var tipLabel = d3.tip().attr('class', 'info-tip')
		    .offset([-10, 0])
		    .html(function(d) {
		    	var remark = "Index 1.0 indicates the player has rank less than 20 for this attribute";
			    return "<strong>" + d.comment[0] + d.comment[1] + "</strong>" +
				    "<br/><span class='important'>" + d.comment[2] + "</span>" +
				    "<br/><span>" + remark + "</span>";
		    });
	    var tipValue = d3.tip().attr('class', 'info-tip')
		    .offset([-10, 0])
		    .html(function(d) {
			    return "<strong>Career Average " + d.comment[0] + " : " + d[4] + "</strong>";
		    });
	    var tipPIE = d3.tip().attr('class', 'info-tip')
		    .offset([-10, 0])
		    .html(function(d) {
			    return "<strong>Player Impact Estimate</strong><br/>" +
				    "<span>PIE measures a player's overall statistical contribution against the total statistics in games they play in. " +
				    "<br/>PIE yields results which are comparable to other advanced statistics (e.g. PER) using a simple formula." +
				    "<br/><img src='data/formula.svg' alt='PIEFormula' height='40' width='600'>" +
				    "</span>";
		    });
	    self.svg.call(tipLabel);
	    self.svg.call(tipValue);
	    self.svg.call(tipPIE);

	    // * Draw Everything here
        group.attr('transform', 'translate(' + groupXoff + ',' + groupYoff + ')');
        group.selectAll('*').remove(); // clean everything for preventing bug
        // --- creat groups
        group.selectAll('g').data(dataSet).enter().append('g')
            .attr('transform', function (d,i) { return 'rotate(' + (360 * i / dataSet.length) + ')'; });
        // --- create background bars
	    {
		    group.selectAll('g').data(dataSet).append('rect')
			    .attr('x', 0).attr('y', -barH / 2)
			    .attr('height', barH).attr('width', barWMax + barWMin)
			    .classed('info-radial-backgound', true);
		    group.selectAll('g').data(dataSet).append('circle')
			    .attr('cx', barWMax + barWMin).attr('cy', 0).attr('r', barH / 2)
			    .classed('info-radial-backgound', true);
	    }
        // --- create bars representing data
	    {
		    // creat rects
		    group.selectAll('g').data(dataSet).append('rect')
			    .attr('x', 0).attr('y', -barH / 2)
			    .attr('height', barH)
			    .attr('width', function (d) {
				    return Math.max(0, Math.min(1, (d[4] - d[1]) / (d[2] - d[1]))) * barWMax + barWMin;
			    })
			    .style('fill', function (d) { return d[3]; });
		    // creat circles
		    group.selectAll('g').data(dataSet).append('circle')
			    .attr('cx', function (d) {
				    return Math.max(0, Math.min(1, (d[4] - d[1]) / (d[2] - d[1]))) * barWMax + barWMin;
			    })
			    .attr('cy', 0).attr('r', barH / 2)
			    .style('fill', function (d) { return d[3]; });
	    }
        // --- other component
	    // central circle
	    group.append('circle').attr('cx', 0).attr('cy', 0).attr('r', attrPIERadius)
		    .classed('info-radial-PIE-circle', true) // PIE circle color
		    .on('mouseover', tipPIE.show)
		    .on('mouseout', tipPIE.hide);
	    // text for attribute index
	    group.append('g').selectAll('text').data(dataSet).enter().append('text')
		    .classed('info-radial-attribute-text', true)
		    .style('font-size', attrTextFont)
		    .attr('x', function (d, i) {
			    var r = Math.max(0, Math.min(1, (d[4] - d[1]) / (d[2] - d[1]))) * barWMax + barWMin;
			    var t = 2 * Math.PI * i / dataSet.length;
			    return (r - attrTextROff) * Math.cos(t);
		    })
		    .attr('y', function (d, i) {
			    var r = Math.max(0, Math.min(1, (d[4] - d[1]) / (d[2] - d[1]))) * barWMax + barWMin;
			    var t = 2 * Math.PI * i / dataSet.length;
			    return (r - attrTextROff) * Math.sin(t) + attrTextYOff;
		    })
		    .text(function (d) {
			    var r = Math.max(0, Math.min(1, (d[4] - d[1]) / (d[2] - d[1])));
			    r = Math.round(10 * r) / 10;
			    //console.log(d);
			    d.index = r;
			    return r.toFixed(1);
		    })
		    .on('mouseover', tipValue.show)
		    .on('mouseout', tipValue.hide);
	    // attribute label
	    group.append('g').selectAll('text').data(dataSet).enter()
		    .append('text')
		    .classed('info-radial-attribute-tag', true)
		    .style('font-size', attrTagFont)
		    .attr('x', function (d, i) {
			    var r = barWMax + barWMin,
				    t = 2 * Math.PI * i / dataSet.length;
			    return (r - attrTagROff) * Math.cos(t);
		    })
		    .attr('y', function (d, i) {
			    var r = barWMax + barWMin,
				    t = 2 * Math.PI * i / dataSet.length;
			    return (r - attrTagROff) * Math.sin(t) + attrTagYOff;
		    })
		    .text(function (d, i) {
			    return dataSet[i][0];
		    })
		    .on('mouseover', tipLabel.show)
		    .on('mouseout', tipLabel.hide)
		    .on('click', function (d) {
			    if (d3.select(this).classed('selected')) {
				    group.selectAll('.selected').classed('selected', false);
				    globData.currSelectedAttribute = [null,null];
				    MainReload(false);
			    } else {
				    group.selectAll('.selected').classed('selected', false);
				    d3.select(this).classed('selected', true);
				    globData.currSelectedAttribute = [d[0], d.comment[0]];
				    MainReload(false);
			    }
		    });
	    // draw central PIE text
	    var pie = player.info.PIE ? 'PIE: ' + Math.round(player.info.PIE * 10000)/100 : 'PIE: N/A';
	    group.append('text')
		    .attr('pointer-events', 'none')
		    .attr('x', 0)
		    .attr('y', attrPIEYOff)
		    .style('font-size',attrPIEFont)
		    .classed('info-radial-PIE',true)
		    .text(pie);
	    // plot texts (Offence and Defence)
	    var ODXoff =   180 * ratio,
		    ODYoff =  -110 * ratio,
		    ODYPad  =   15 * ratio,
		    ODShift =    8 * ratio,
		    ODTextFont = 12 * ratio;
	    group.append('text')
		    .attr('x', ODXoff)
		    .attr('y', ODYoff+ODShift)
		    .style('font-size',ODTextFont)
		    .classed('rank-radial-OD', true)
		    .text('Offensive');
	    group.append('text')
		    .attr('x', ODXoff)
		    .attr('y', -ODYoff+ODShift)
		    .classed('rank-radial-OD', true)
		    .style('font-size',ODTextFont)
		    .text('Defensive');
	    group.append('path')
		    .classed('rank-radial-OD', true)
		    .attr('d','M' + ODXoff + ',' + (ODYoff+ODYPad) + 'L' + ODXoff + ',' + (-ODYoff-ODYPad));
	    var ODindex = (dataSet[0].index + dataSet[1].index + dataSet[2].index - dataSet[3].index - dataSet[4].index - dataSet[5].index) / 3;
	    var ODbarW = 20 * ratio, ODbarH = 4 * ratio;
	    group.append('rect')
		    .attr('x', ODXoff - ODbarW/2)
		    .attr('y', -ODindex * ODYoff - ODbarH/2)
		    .attr('width', ODbarW)
		    .attr('height', ODbarH)
		    .style('fill', 'black')
		    .style('border-radius', '1px');
	    group.append('circle')
		    .attr('cx', ODXoff)
		    .attr('cy', 0)
		    .attr('r', ODbarW/8)
		    .style('fill', 'black');

    };

}