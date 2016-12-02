/**
 * Class to display general information of a player
 * @constructor
 * HTML LOCATION:
 */
function InfoView ()
{
    var self = this;

    /**
     * Initialization
     */
    self.init = function(height)
    {
    	// [0]
	    // great HTML structure
	    self.div = d3.select('#divInfoView');
	    self.div.selectAll('*').remove(); // prevent bug
	    // creat button
	    self.div.append('button').attr('onclick', 'myChangePlayer(this)').text('Change Player');
	    self.div.append('button')
		    //.style('margin-left', 2+'px')
		    .attr('onclick', 'myComparePlayer(this)').text('Compare');
	    // creat SVG elements
	    self.svg     = self.div.append('svg').attr('id','svgInfoView');
	    // -- left part
	    self.grpCurr = self.svg.append('g').attr('id','groupCurrPlot-InfoView');
	    self.grpCurrAxis = self.svg.append('g').attr('id','groupYearAxis-InfoView');
	    // -- right part
	    self.right = self.svg.append('g');
	    self.grpComp = self.right.append('g').attr('id','groupCompPlot-InfoView');
	    self.grpCompAxis = self.right .append('g').attr('id','groupCompYearAxis-InfoView');
	    // -- radial plot
	    self.grpRadial = self.svg.append('g').attr('id','radialPlot-InfoView');
	    // * constructure correct structures
	    // add image
	    self.grpCurr.append('image');
	    self.grpComp.append('image');
	    // current view
	    self.grpCurrAxis.append('g').classed('axisGroup-InfoView', true);
	    self.grpCurrAxis.append('g').classed('barsGroup-InfoView', true);
	    self.grpCurrAxis.append('g').classed('brushGroup-InfoView', true);
	    // compare view
	    self.grpCompAxis.append('g').classed('axisGroup-InfoView', true);
	    self.grpCompAxis.append('g').classed('barsGroup-InfoView', true);
	    self.grpCompAxis.append('g').classed('brushGroup-InfoView', true);

	    self.hidden = false;
	    // [1]
        // calculate svg default size & get the correct width of the window
        var div   = document.getElementById('divInfoView'); // shortcuts
        var style = window.getComputedStyle(div, null);     // shortcuts
	    // [2]
        // save width and height
        self.svgW  = parseInt(style.getPropertyValue("width"), 10);
        self.svgH = height;
        self.svg
	        .attr('width',  self.svgW)
            .attr('height', self.svgH);
    };

	self.hideRadial = function () {
		self.grpRadial.selectAll('*').remove();
	};

	self.hideAxis = function (AxisGrp) {
		AxisGrp.select('.axisGroup-InfoView').selectAll('*').remove();
		AxisGrp.select('.barsGroup-InfoView').selectAll('*').remove();
		AxisGrp.select('.brushGroup-InfoView').selectAll('*').remove();
	};

	self.hideOneView = function (Grp) {
		Grp.select('image').remove();
		Grp.append('image');
		Grp.selectAll('text').remove();
	};

    /**
     * self is a function to draw/update view
     */
    self.update = function()
    {
    	// hide right view
	    self.hideOneView(self.grpComp);
	    self.hideAxis(self.grpCompAxis);
    	// draw new stuffs
        var player = globData.currPlayerData;
        var hView = self.OneInfo(self.grpCurr, player);
	    var hAxis = self.SeasonAxis(self.grpCurrAxis, player);
        var hRad = self.RadialView(self.grpRadial, player); // console.log(hView, hAxis);
	    self.svg.attr('height', Math.max(hRad, Math.min(hView + hAxis, self.svgH)));
    };

    self.compare = function () {
	    // get data
    	var player1 = globData.currPlayerData;
	    var player2 = globData.comparePlayerData;
	    // console.log(player1, player2);
	    // shift right area
	    self.right.attr('transform', 'translate(' + (self.svgW/2) + ',0)');
	    // clean radial
	    self.hideRadial();
	    // draw new stuffs
	    var hView1 = self.OneInfo(self.grpCurr, player1);
	    var hAxis1 = self.SeasonAxis(self.grpCurrAxis, player1);
	    var hView2 = self.OneInfo(self.grpComp, player2);
	    var hAxis2 =  self.SeasonAxis(self.grpCompAxis, player2);
	    // clean brush
	    self.div.selectAll('.brushGroup-InfoView').html('');
	    // adjust height
	    self.svg.attr('height', Math.min(Math.max(hView1 + hAxis1, hView2 + hAxis2), self.svgH));
    };

    /**
     * Function to resize
     */
    self.resize = function ()
    {
        // adjust svg width only
	    var div   = document.getElementById('divInfoView'); // shortcuts
	    var style = window.getComputedStyle(div, null);     // shortcuts
	    self.svgW  = parseInt(style.getPropertyValue("width"), 10);
	    self.svg.attr('width',  self.svgW);
	    if (globData.compareMode) {
	    	self.compare();
	    } else {
		    self.update();
	    }
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
    self.OneInfo = function (group, player)
    {
    	// [0]
        // get some shortcut names
    	var id = player.info.PERSON_ID;
        var ratio = self.svgW / 1520;  // a stupid way of getting rescaling ratio !!
	    // [1]
        // parameters
        var headSize   = 30 * ratio, // player name font size
            headHeight = 80 * ratio; // player name font height
        var textSize   = 16 * ratio,
            textHeight = 26 * ratio,
	        textYOffset  = 10 * ratio,  // space abvoe the main text
            textXOffset  = 450 * ratio; // space between divide left border and main text left border
        var imageWidth   = 230 * ratio, // profile picture width
            imageHeight  = 185 * ratio, // profile picture height
	        imageXOffset = (textXOffset - imageWidth)/2,
            imageYOffset = 20 * ratio;  // space between profile picture and divide border
	    var groupHeight  = 255 * ratio;
	    // [2]
        // attach an image under the svg
        var img = group.select('image')
	        .attr('x',imageXOffset)
	        .attr('y',imageYOffset)
            .attr('width',  imageWidth)
            .attr('height', imageHeight);
        var url = 'data/playerProfile/' + id + '.png';
        if (self.fileExists(url)) {
            img.attr("xlink:href", url);
        } else {
            img.attr("xlink:href", 'data/playerProfile/NoFound.png');
        }
	    // [3]
        // attach player information (construct data)
        var localPlayerData = [];
        var teamID = globData.globTeamList.lookup[player.info.TEAM];
        try {
            localPlayerData
	            .push(
	            	'Team: ' +
		            globData.globTeamList.current[teamID].TEAM_CITY + ' ' +
		            globData.globTeamList.current[teamID].TEAM_NAME);
        } catch (e) {
            console.log(player.info.TEAM);
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
	    // [4]
        // draw texts
        group.selectAll('text').remove();
        group.selectAll('text').data(localPlayerData).enter().append('text')
            .attr('x', textXOffset)
            .attr('y', function (d, i) { return textYOffset + (1 + i) * textHeight })
            .style('font-size', textSize)
	        .classed('info-text', true)
	        .text(function (d) { return d; });
        group.append('text') // attach header (player name)
            .attr('x', textXOffset/2)
            .attr('y', imageHeight + headHeight)
            .style('font-size', headSize)
	        .classed('info-title', true)
	        .text(player.info.FIRST_NAME + ' ' + player.info.LAST_NAME);
        return groupHeight;
    };

	/**
	 * generate the axis under a group tag
	 * @param group
	 * @param player
	 * @return {number}
	 */
    self.SeasonAxis = function (group, player)
    {
        // [0]
        // remember input values for reload/resize
        var sYear = player.info.FROM_YEAR;
        var eYear = player.info.TO_YEAR;
        var numOfYears = eYear - sYear + 1;
        //
        // rescaling ratio
        var ratio = self.svgW / 1520; // rescaling ratio
        // parameters
        var margin = {left: 50, right: 50}; // margin for the  axis
        var spanRatio = 0.510;   // the percentage that the axis will span
        var totalOffsetY = 265 * ratio, // this equals to the icon image height + name font height
            totalPadding = 30 * ratio;  // this is the margin for axis and info view
        var axisSize = 20 * ratio,  // the height of axis
            axisFont = 10 * ratio;  // font size of axis ticks
        var barsOffY   = 5 * ratio,   // padding between bar and axis
            barsSize   = 10 * ratio,  // rect size
            barsPad    = 1 * ratio,   // padding between two neighboring bars
            barsStroke = 2 * ratio;   // bar stroke
        var logoOffY  = 18 * ratio, // padding between team logo and bars
            logoSize  = 45 * ratio; // size of logo image
        var brushPad  = 10 * ratio; // padding for brush
        // -- calculate total plotting area
        var plotOffY = totalOffsetY + totalPadding + logoOffY + logoSize;
        var plotWidth = self.svgW * spanRatio - margin.left - margin.right; // the width that will be plotted
        var plotHeight = 140 * ratio;
        //
        // prepare data structore for the plot
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
            } else {
                team = null;
            }
        }
        //
        // DRAWING
        // console.log(teamList);
        // create scale and axis
        var scale = d3.scaleLinear()
            .domain([sYear - 0.5, eYear + 0.5]) // the range is being shifted, for axis ticks
            .range([margin.left, plotWidth + margin.left]);
        var axis  = d3.axisBottom().scale(scale).ticks(numOfYears,'d').tickSizeOuter(0);
        // adjust group properties
        group
            .attr('transform', 'translate(0,' + plotOffY + ')') // shift group position
            .select('.axisGroup-InfoView')
            .call(axis) // create axis (the axis will be created at level y = 0)
            .selectAll('text')
            .style('font-size', axisFont); // adjust axis font size based on window size
        // draw bars
        d3SelectAll(group.select('.barsGroup-InfoView'), 'rect', PlayerTeamList)
            .attr('x', function (d) { return scale(d.yearFrom - 0.5) + barsPad; }) // shift things back
            .attr('y', -barsSize - barsOffY) // shift bar based on axis position
            .attr('width', function (d) { return scale(d.yearTo + 0.5) - scale(d.yearFrom - 0.5) - barsPad; })
            .attr('height', barsSize)
            .style('stroke-width', barsStroke) // give rect some strokes
            .style('stroke', 'black')          // stroke color based on team color 2
            .style('fill', function (d) {
                // console.log(d, d.team);
	            var myTeamId = globData.globTeamList.lookup[d.team];
	            try {
	            	if (myTeamId) {
			            return globData.globTeamList.current[myTeamId].COLOR_1; // filling with team color 1
		            } else {
	            		return 'steelblue';
		            }
	            } catch (e) {
	            	console.log(myTeamId);
	            	return 'steelblue';
	            }
            });
        // draw team logo
        d3SelectAll(group.select('.barsGroup-InfoView'), 'image', PlayerTeamList)
            .attr('x', function (d) { // --> (somehow the logo is aligned at the center) applied a shift
                return scale((d.yearFrom + d.yearTo)/2) - logoSize/2; // logo align center
            })
            .attr('y', -logoSize - logoOffY) // shift logo based on axis position
            .attr('width',  logoSize)
            .attr('height', logoSize)
            .attr("xlink:href", function (d) {
	            var myTeamId = globData.globTeamList.lookup[d.team];
	            if (myTeamId) {
		            var myTeamAb = globData.globTeamList.current[myTeamId].TEAM_ABBREVIATION;
		            return 'data/teamLogo/' + myTeamAb + '_logo.svg'; // load data
	            } else {
		            return 'data/teamLogo/NBA_logo.svg'; // load data
	            }
            });
        // draw brush
        // --> reference https://bl.ocks.org/mbostock/6232537
        var brush = d3.brushX()
            .extent([[margin.left, -logoSize-logoOffY-brushPad],[margin.left+plotWidth, axisSize+brushPad]])
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
	            MainReload(false);
            });
        group.select('.brushGroup-InfoView')
	        .classed('brush', true)
	        .classed('brushInfoView', true)
	        .call(brush);
        group.select('.brushGroup-InfoView').select('.selection').style('display','none'); // hide selection
        group.select('.brushGroup-InfoView').select('.handle').style('display','none');    // when resizing
	    // return area height
	    return plotHeight;
    };

	/**
	 * Plot Radial View
	 * @param group
	 * @param player
	 * @return {number}
	 */
    self.RadialView = function(group, player)
    {
    	// compute rescaling ratio
	    var ratio = self.svgW / 1520; // rescaling ratio
        // predefined data range (different range for different data)
        var dataSet = [
            // [attribute, min, max, value]
	        ["TOV"],
	        ["REB"],
	        ["BLK"],
            ["STL"],
	        ["AST"],
            ["PTS"]
        ];
        // load data
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
        // [1]
        // define plotting parameters
	    var groupXOff = 1050 * ratio,
		    groupYOff = 180 * ratio;
        var barH = 40 * ratio,
            barWMax = 90 * ratio,
            barWMin = 50 * ratio;
        var attrTextFont = 12 * ratio,
            attrTextYOff =  4 * ratio,
            attrTextROff = -1 * ratio;
        var attrTagFont =  14 * ratio,
            attrTagYOff =   4 * ratio,
            attrTagROff = -40 * ratio;
        var attrPIEFont =  14 * ratio,
            attrPIEYOff =   5 * ratio;
        var plotHeight  = 350 * ratio;
        // [2]
        // define tooltip
	    // self.tooltips.selectAll('*').remove();
	    var tipLabel = d3.tip()
		    .attr('class', 'info-d3-tip')
		    .offset([-10, 0])
		    .html(function(d) {
		    	var remark = "Index 1.0 indicates the player has rank less than 20 for this attribute";
			    return "<strong>" + d.comment[0] + d.comment[1] + "</strong>" +
				    "<br/><span class='important'>" + d.comment[2] + "</span>" +
				    "<br/><span>" + remark + "</span>";
		    });
	    var tipValue = d3.tip()
		    .attr('class', 'info-d3-tip')
		    .offset([-10, 0])
		    .html(function(d) {
			    return "<strong>Career Average " + d.comment[0] + " : " + d[4] + "</strong>";
		    });
	    var tipPIE = d3.tip()
		    .attr('class', 'info-d3-tip')
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
	    // [3]
        // draw everything here
        // console.log(dataSet);
        group.attr('transform', 'translate(' + groupXOff + ',' + groupYOff + ')');
        group.selectAll('*').remove();
        // creat groups
        group.selectAll('g').data(dataSet).enter().append('g')
            .attr('transform', function (d,i) { return 'rotate(' + (360 * i / dataSet.length) + ')'; });

        // -- create background bars
	    {
		    group.selectAll('g').data(dataSet).append('rect')
			    .attr('x', 0).attr('y', -barH / 2)
			    .attr('height', barH).attr('width', barWMax + barWMin)
			    .classed('info-radial-backgound', true);
		    group.selectAll('g').data(dataSet).append('circle')
			    .attr('cx', barWMax + barWMin).attr('cy', 0).attr('r', barH / 2)
			    .classed('info-radial-backgound', true);
	    }
        // -- create bars representing data
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
	    group.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 40 * ratio)
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
	    var ODXoff =  280 * ratio,
		    ODYoff = -150 * ratio,
		    ODText = 20 * ratio,
		    ODShift = 8 * ratio;
	    group.append('text')
		    .attr('x', ODXoff)
		    .attr('y', ODYoff+ODShift)
		    .classed('rank-radial-OD', true)
		    .text('Offensive');
	    group.append('text')
		    .attr('x', ODXoff)
		    .attr('y', -ODYoff+ODShift)
		    .classed('rank-radial-OD', true)
		    .text('Defensive');
	    group.append('path')
		    .classed('rank-radial-OD', true)
		    .attr('d','M' + ODXoff + ',' + (ODYoff+ODText) + 'L' + ODXoff + ',' + (-ODYoff-ODText));
	    // console.log(dataSet);
	    var ODindex = (dataSet[0].index + dataSet[1].index + dataSet[2].index - dataSet[3].index - dataSet[4].index - dataSet[5].index) / 3;
	    var ODbarW = 20 * ratio, ODbarH = 4 * ratio;
	    // var ODscale = d3.scaleLinear().domain([-1,1]).range(['#FF2223', '#2C1F97'])
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
        return plotHeight/2 + groupYOff;
    };

	/**
	 * Hide this view entirely
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
	    self.init(self.svgH);
		self.update();
    };
}