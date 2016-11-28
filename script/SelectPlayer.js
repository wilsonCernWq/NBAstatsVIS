/**
 * Drop down menu for selecting player
 * @constructor
 */
function SelectPlayer () {
    var self = this;

    self.init = function (height) {
        var _div_ = document.getElementById('menuView');
        var _sty_ = window.getComputedStyle(_div_, null); // console.log(style);
        self.width = parseInt(_sty_.getPropertyValue("width"), 10);
        self.height = height;
        // define plot margin (it gives the minimal margin)
        self.margin = {
            left:   0.02 * self.width,
            right:  0.02 * self.width,
            top:     0.1 * self.height,
            bottom:  0.1 * self.height
        };
        // setup SVG
        self.svg = d3.select('#menuView').append('svg');
        self.svg
            .attr("width", self.width)
            .attr("height", self.height);
        self.grpBar = self.svg.append('g');
    };

    /**
     *
     * @param _player_list_
     * @param _filter_
     *    Initial
     *    YearFrom
     *    YearTo
     *    AllStar
     *    HeightAbove
     *    HeightBelow
     *    WeightAbove
     *    WeightBelow
     *    Position
     *    Team
     */
    self.update = function (_player_list_, _filter_) {
        var barColLen = 100,
            barW = 100,
            barH = 10,
            barP = 0.2;
        var fontsize = 8,
            fontYOff = 8;
        // console.log(_player_list_);
        var _filtered_player_list_ = _player_list_.rowSet.filter(function (d) {
            if (_filter_.YearFrom) { if (d[3] < _filter_.YearFrom) { return false;} }
            if (_filter_.YearTo) { if (d[2] > _filter_.YearTo) { return false;} }
            return true;
        }).sort(function compare(a, b) {
            if (a[1] < b[1]) {
                return -1;
            }else if (a[1] > b[1]) {
                return 1;
            } else {
                return 0;
            }
        });
        // console.log(_filtered_player_list_);
        d3SelectAll(self.grpBar, 'rect', _filtered_player_list_)
            .attr('x', function(d,i) { return Math.floor(i / barColLen) * (barW + barP); })
            .attr('y', function(d,i) { return (i % barColLen) * (barH + barP); })
            .attr('width', barW)
            .attr('height', barH)
            .style('fill', '#ffffff')
            .style('opacity', 0.5)
            .on('click', function (d) {
                //console.log(d)
                currplayer = d[4];
                MainReload();
            });
        d3SelectAll(self.grpBar, 'text', _filtered_player_list_)
            .attr('x', function(d,i) { return Math.floor(i / barColLen) * (barW + barP); })
            .attr('y', function(d,i) { return (i % barColLen) * (barH + barP) + fontYOff; })
            .text(function (d) { return d[1]; })
            .style('font-size', fontsize)
            .on('click', function (d) {
                //console.log(d)
                currplayer = d[4];
                MainReload();
            });
        self.svg.attr('height', barColLen * (barH + barP));
    }
}
