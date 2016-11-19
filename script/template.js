function TemplateClass(divId, width, height) {

    /**
     * Constructor
     * In this function you want to input all initial variables the class will need
     * @param divId ID of that divide in HTML
     * @param width
     * @param height
     */

    this.debug  = true;
    this.divId  = divId;
    this.width  = width;
    this.height = height;

    /**
     * Initialization
     */
    this.init = function () {};

    /**
     * This is a function to draw/update view
     */
    this.update = function () {};

    /**
     * This is a function to resize image
     */
    this.resize = function (width, heigh) {};

}


