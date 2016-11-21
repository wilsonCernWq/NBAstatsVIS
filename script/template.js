function TemplateClass(divId, width, height) {
    var self = this;

    /**
     * Constructor
     * In self function you want to input all initial variables the class will need
     * @param divId ID of that divide in HTML
     * @param width
     * @param height
     */

    self.debug  = true;
    self.divId  = divId;
    self.width  = width;
    self.height = height;

    /**
     * Initialization
     */
    self.init = function () {};

    /**
     * self is a function to draw/update view
     */
    self.update = function () {};

    /**
     * self is a function to resize image
     */
    self.resize = function (width, heigh) {};

}


