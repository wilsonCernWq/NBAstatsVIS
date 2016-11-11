/**
 * Created by Qi on 2016/11/10.
 */

/**
 * Constructor
 * In this function you want to input all initial variables the class will need
 */
function InfoView(svgid, width, height){
    this.svgId = svgid;
}

/**
 * Initialization
 */
InfoView.prototype.init = function(){
    // var box = d3.select(this.svgId).getBoundingClientRect();
    // this.svgWidth  = box.width;
    // this.svgHeight = box.height;
    this.svgWidth  = 185;
    this.svgHeight = 230;
    this.svg = d3.select(this.svgId).select('svg');
    this.svg
        .attr('width', this.svgWidth)
        .attr('height', this.svgHeight);
    this.svg.append('image');
};

/**
 * This is a function to draw/update view
 */
InfoView.prototype.update = function(id, player){
    var fileExists = function (url)
    {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send();
        return http.status!=404;
    };

    var img = this.svg.select('image')
        .attr('x',0)
        .attr('y',0)
        .attr('width', this.svgWidth)
        .attr('height', this.svgHeight);

    var url = 'data/playerIcon/' + id + '.png';
    if (fileExists(url)) {
        img.attr("xlink:href", url);
    } else {
        img.attr("xlink:href", 'data/playerIcon/NoFound.png');
    }


};

/**
 * This is a function to resize image
 */
InfoView.prototype.resize = function(width, heigh){

};

/**
 * Helper function
 */
InfoView.prototype.helper = function () {

};


