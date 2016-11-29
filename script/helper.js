/**
 * helper functions
 */
function d3SelectAll(base, obj, mydata, removeAll)
{
    var select;
    if (!removeAll) {
        select = base.selectAll(obj).data(mydata);
        select.exit().remove();
        select = select.enter().append(obj).merge(select);
        return select;
    } else {
        base.selectAll(obj).remove();
        select = base.selectAll(obj).data(mydata);
        select = select.enter().append(obj).merge(select);
        return select;
    }
}

/**
 * extend date function
 * @param date1
 * @param date2
 * @returns {number}
 */
Date.daysBetween = function( date1, date2 )
{
    //Get one day in milliseconds
    var one_day=1000*60*60*24;

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;

    // Convert back to days and return
    return Math.round(difference_ms/one_day);
};

/**
 * function to convert mm/dd/yyyy to number between 0 - 100 (max 250 per season)
 * @param date
 * @returns {number}
 */
function date2value (date)
{
    var y = +date.slice(6,10); // get year in number
    var m = +date.slice(0,2);  // ... month ...
    var d = +date.slice(3,5);  // ... date  ...
    var sDate, //< starting date
        cDate; //< current date
    cDate = new Date(y, m-1, d);
    // shift year to previous year
    // since NBA season spans from Oct/25 in self year to Jun/17 in the next year
    if (m > 9) {
        sDate = new Date(y  , 9, 25);
    } else {
        sDate = new Date(y-1, 9, 25);
    }
    return Date.daysBetween(sDate, cDate) / 2.5; // map [0,100] to [0,240]
}

/**
 * function to convert number 0-100 to mm/dd/xxxx (xxxx = 2000 or 2001)
 * @param value
 * @returns {string}
 */
function value2date (value)
{
    var oneDay=1000*60*60*24; // one day in MS
    var sDate = new Date(2000, 9, 25); //< an predefined starting date
    sDate.setTime(sDate.getTime() + oneDay * value * 2.4);
    return sDate.toDateString().slice(4,10);
}

function obj2array(x) {
    // console.log('change object to array', x);
	var result = [];
	for (var key in x) {
		result.push([key, x[key]]);
	}
    return result;
}
