function fancyTimeFormat(time)
{
    //from https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds
    // Hours, minutes and seconds
    var mins = ~~((time % 3600) / 60);
    var secs = time % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + Math.floor(secs);
    return ret;
}
