/*
*   this class is responsible for drawing basic shapes like line, circle, ellipse and path
 */
var Draw = {

    _element : null,
    _context : null,

    // params -> canvas_id
    initialize : function(element){
        this._element = document.getElementById(element);
        this._context = this._element.getContext("2d");
        return this;
    },

    // return the canvas 2d context
    getContext : function(){
        return this._context;
    },

    // command 'M' for SVG
    moveTo : function(ponitX, pointY){
        this._context.moveTo(ponitX, pointY);
    },

    // draw line from one point two another
    line : function(startX, startY, endX, endY){
        this._context.moveTo(startX, startY);
        this._context.lineTo(endX, endY);
        this._context.stroke();
    },

    // draw quadratic curve
    // line 36 is commented out for author's personal matter. But originally to draw a quadratic curve you must uncomment that line
    quadraticCurve : function(startX, startY, controlX, controlY, endX, endY){
        //this._context.moveTo(startX, startY);
        this._context.quadraticCurveTo(controlX, controlY, endX, endY);
        this._context.stroke();
    },

    // draw circle
    // params -> self explanatory, but 'fill' => circle will be filled or not (boolean)
    circle : function(centerX, centerY, radius, fill){
        this._context.beginPath();
        this._context.arc(centerX, centerY, radius, 0, 2*Math.PI);
        this._context.stroke();
        if(fill){
            this._context.fill();
        }
    },

    // draw ellipse
    // params -> self explanatory, but 'fill' => ellipse will be filled or not (boolean)
    ellipse : function(x, y, w, h, fill){
        w *= 2;
        h *= 2;
        x -= w/2.0;
        y -= h/2;
        var kappa = .5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2;       // y-middle

        this._context.beginPath();
        this._context.moveTo(x, ym);
        this._context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        this._context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        this._context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        this._context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        this._context.stroke();
        if(fill){
            this._context.fill();
        }
    },

    //draw text on canvas
    text : function(font, text, posX, posY){
        this._context.font = font;
        this._context.textAlign = "center";
        this._context.fillText(text, posX, posY);
    },

    setStrokeColor : function(color){
        this._context.strokeStyle = color;
    },

    setFillColor : function(color){
        this._context.fillStyle = color;
    },

    setStrokeWidth : function(width){
        this._context.lineWidth = width;
    },

    // draw path from svg dada ('d' attribute of <path>)
    path : function(fillColor, strokeColor, d){
        this.setFillColor(fillColor);
        this.setStrokeColor(strokeColor);
        var commands = this._getCommands(d);
        var prevX;
        var prevY;
        for(var i in commands){
            if(commands[i].cmd == 'M'){
                this.moveTo(commands[i].arg[0], commands[i].arg[1]);

            }
            if(commands[i].cmd == 'C'){
                this.quadraticCurve(commands[i].arg[0], commands[i].arg[1], commands[i].arg[2], commands[i].arg[3], commands[i].arg[4], commands[i].arg[5]);
            }
            if(commands[i].cmd == 'L'){
                this.line(prevX, prevY, commands[i].arg[0], commands[i].arg[1]);
            }
            prevX = commands[i].arg[0];
            prevY = commands[i].arg[1];
        }
    },

    // get 'C'/'M'/'L' commands and related arguments from 'd' attribute of <path>
    _getCommands : function(d){
        var regex = /([A-Za-z])+([0-9\.,]+)/g;
        var match;
        var commands = [];
        do{
            match = regex.exec(d);
            if(match){
                commands.push({
                    cmd : match[1],
                    arg : match[2].split(",")
                });
            }
        }while(match);
        console.log(commands);
        return commands;
    }

};

/*
* this is a class to parse text, paths, circles and ellipse from SVG element
 */
var Parser = {
    _svgSelector : null,
    _svgElement : null,
    _paths : null,
    _circles : null,
    _ellipse : null,
    _text : null,

    initialize : function(selector){
        this._svgSelector = selector;
        this._svgElement = $(this._svgSelector);
        return this;
    },

    parse : function(){
        this._paths = $("path", this._svgElement);
        this._circles = $("circle", this._svgElement);
        this._ellipse = $("ellipse", this._svgElement);
        this._text = $("text", this._svgElement);
    },

    getPaths : function(){
        return this._paths;
    },

    getCircles : function(){
        return this._circles;
    },

    getEllipse : function(){
        return this._ellipse;
    },
    
    getText : function(){
        return this._text;
    }

};

/*
* this class is used to export pdf from svg
* code example:
||-> params of initialize function -> svgSelector, canvas_id
| var svgToCanvas = SvgToCanvas.initialize("svg", "canvas");
| svgToCanvas.draw();
| svgToCanvas.downloadPdf(fileName);
 */
var SvgToCanvas = {

    _draw : null,
    _parser : null,
    _canvasId : null,

    initialize : function(svgSelector, canvasId){
        this._canvasId = canvasId;
        this._draw = Draw.initialize(canvasId);
        this._parser = Parser.initialize(svgSelector);
        return this;
    },

    draw : function(){
        this._parser.parse();
        var paths = this._parser.getPaths();
        var circles = this._parser.getCircles();
        var ellipse = this._parser.getEllipse();
        var text = this._parser.getText();

        this.drawPaths(paths);
        this.drawCircles(circles);
        this.drawEllipse(ellipse);
        this.drawText(text);

    },

    drawPaths : function(paths){
        for(var i=0; i<paths.length; i++){
            var fillColor = $(paths[i]).attr("fill");
            var strokeColor = $(paths[i]).attr("stroke");
            var d = $(paths[i]).attr("d");

            if(fillColor = "none") fillColor = "#ffffff";

            this._draw.path(fillColor, strokeColor, d);
        }
    },

    drawCircles : function(circles){
        for(var i=0; i<circles.length; i++){
            var centerX = $(circles[i]).attr("cx");
            var centerY = $(circles[i]).attr("cy");
            var radius = /([0-9]+).*/g.exec($(circles[i]).attr("r"))[1];        // from 40px to 40
            var fillColor = $(circles[i]).attr("fill");
            var strokeColor = $(circles[i]).attr("stroke");
            var strokeWidth = $(circles[i]).attr("stroke-width");

            this._draw.setFillColor(fillColor);
            this._draw.setStrokeColor(strokeColor);
            this._draw.setStrokeWidth(strokeWidth);

            this._draw.circle(centerX, centerY, radius, true);

        }
    },

    drawEllipse : function(ellipse){
        for(var i=0; i<ellipse.length; i++){
            var cx = $(ellipse[i]).attr("cx");
            var cy = $(ellipse[i]).attr("cy");
            var rx = $(ellipse[i]).attr("rx");
            var ry = $(ellipse[i]).attr("ry");
            var fillColor = $(ellipse[i]).attr("fill");
            var strokeColor = $(ellipse[i]).attr("stroke");
            var strokeWidth = $(ellipse[i]).attr("stroke-width");

            this._draw.setFillColor(fillColor);
            this._draw.setStrokeColor(strokeColor);
            this._draw.setStrokeWidth(strokeWidth);

            this._draw.ellipse(cx, cy, rx, ry, true);

        }
    },

    drawText : function(text){
        for(var i=0; i<text.length; i++){
            var x = $(text[i]).attr("x");
            var y = $(text[i]).attr("y");
            var font = $(text[i]).attr("font");
            var fillColor = $(text[i]).attr("fill");
            var strokeColor = $(text[i]).attr("stroke");
            var string = $("tspan", text[i]).html();

            this._draw.setFillColor(fillColor);
            this._draw.setStrokeColor(strokeColor);

            this._draw.text(font, string, x, y);

        }
    },

    // call this method to download pdf from canvas
    // canvas -> png -> pdf
    downloadPdf : function(fileName){
        var imgData = document.getElementById(this._canvasId).toDataURL('image/png');
        var doc = new jsPDF('p', 'mm');
        doc.addImage(imgData, 'PNG', 0, 0);
        doc.save(document.title + '.pdf');
    }

};
