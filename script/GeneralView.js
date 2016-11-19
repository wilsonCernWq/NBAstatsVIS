/**
 * Created by Qi on 2016/11/10.
 */

/**
 * Constructor
 * In this function you want to input all initial variables the class will need
 */
function GeneralView(svgid, width, height){
    this.debug = true;
    this.svgId = svgid;
    this.svgWidth  = width;
    this.svgHeight = height;
}

/**
 * Initialization
 */
GeneralView.prototype.init = function(){

    this.svg = d3.select(this.svgId).select('svg')
        .attr('width', this.svgWidth)
        .attr('height', this.svgHeight);

    this.group = this.svg.append('g');
    this.group
        .attr('transform', 'translate(0,' + this.svgHeight + ') scale(1, -1)')

};

/**
 * This is a function to draw/update view
 */
GeneralView.prototype.update = function(id, player){
    var data = player['career']['RegularSeason'][0].slice(14);
    var head = player['career']['headerRow'].slice(14);

    console.log(data);

    this.group.selectAll('rect').remove();
    this.group.selectAll('rect').data(data).enter()
        .append('rect')
        .attr('x', function (d, i) { return 10 + i * 40; })
        .attr('y', 20)
        .attr('width', 20)
        .attr('height', function (d) { return d * 4; });

    this.svg.selectAll('text').data(head).enter()
        .append('text')
        .attr('x', function (d, i) { return 7 + i * 40; })
        .attr('y', 50)
        .text(function (d) { return d; });
};

/**
 * This is a function to resize image
 */
GeneralView.prototype.resize = function(width, heigh){

};

/**
 * Helper function
 */
GeneralView.prototype.helper = function () {

};


