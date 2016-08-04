$(document).ready(function(){

    // dependency   -> jquery, jspdf

    //params of initialize function -> svgSelector, canvas_id
    var svgToCanvas = SvgToCanvas.initialize("svg", "canvas");
    svgToCanvas.draw();
    // param -> pdf file name (without .pdf)
    svgToCanvas.downloadPdf(document.title);


});