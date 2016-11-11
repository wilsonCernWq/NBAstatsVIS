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
    this.svgWidth  = 230;
    this.svgHeight = 185;
    this.div = d3.select(this.svgId).select('div');
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

    this.div.select('h1')
        .text(player['info']['FIRST_NAME'] + ' ' + player['info']['LAST_NAME']);
    this.div.selectAll('li').remove();
    this.div.append('li')
        .text('Birthday: ' + player['info']['BIRTHDATE'].slice(0,10));
    this.div.append('li')
        .text('Position: ' + player['info']['POSITION']);
    this.div.append('li')
        .text('Team: ' + player['info']['TEAM']);
    this.div.append('li')
        .text('Height: ' + player['info']['HEIGHT']);
    this.div.append('li')
        .text('Weight: ' + player['info']['WEIGHT'] + ' lbs');
    this.div.append('li')
        .text('Country: ' + player['info']['COUNTRY']);
    this.div.append('li')
        .text('School: ' + player['info']['SCHOOL']);
    this.div.append('li')
        .text('Seasons: ' + player['info']['FROM_YEAR'] + ' - ' + player['info']['TO_YEAR']);

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


