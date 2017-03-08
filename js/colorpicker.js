
function Color(){
   this.red;
   this.green;
   this.blue;
   this.rgb;
   this.hsl;

   this.setrgb = function(r, g, b){
      this.red = parseInt(r);
      this.green = parseInt(g);
      this.blue = parseInt(b);
      this.rgb = [this.red, this.green, this.blue];
      this.sethsl();
   }

   this.rgbarray = function(rgb){
      this.red = parseInt(rgb[0]);
      this.green = parseInt(rgb[1]);
      this.blue = parseInt(rgb[2]);
      this.rgb = [this.red, this.green, this.blue];
      this.sethsl();
   }

   this.hex = function(hex){
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
           this.red = parseInt(result[1], 16);
           this.green = parseInt(result[2], 16);
           this.blue=  parseInt(result[3], 16);
           this.rgb = [this.red, this.green, this.blue];
           this.sethsl();
   }

   this.red = function(){
      return this.red;
   }
   this.green = function(){
      return this.green;
   }
   this.blue = function(){
      return this.blue;
   }

   this.getrgb = function(r, g, b){
      if(isNaN(r)){
         return 'rgb('+this.red+', '+this.green+', '+this.blue+')';
      }
      else{
         return 'rgb('+r+', '+g+', '+b+')';
      }
   }

   this.negate = function(isRGB){
      var rgb = [];
      for(var i = 0; i < 3; i++){
         rgb[i] = 255 - this.rgb[i];
      }
      if(isRGB){
         return this.getrgb(rgb[0], rgb[1], rgb[2]);
      }
      else{
         return [rgb[0], rgb[1], rgb[2]];
      }

   }

   this.grayscale = function(){
      var gray = parseInt(this.red * 0.3 + this.green * 0.59 + this.blue * 0.11);
      if(gray < 0){gray = 0;}
      if(gray > 255){gray = 255;}
      return this.getrgb(gray, gray, gray);
   }

   this.lightness = function(l, isRGB){
      var lightness = this.hsltorgb(this.hsl[0], this.hsl[1], (this.hsl[2]+l));
      for(var i = 0; i < lightness.length; i++){
         if(lightness[i] < 0){lightness[i] = 0;}
         if(lightness[i] > 255){lightness[i] = 255;}
      }
      if(isRGB){
         return this.getrgb(lightness[0], lightness[1], lightness[2]);
      }
      else{
         return [lightness[0], lightness[1], lightness[2]];
      }

   }

   this.rotate = function(degrees, isRGB){
      var hue = this.hsl[0];
		hue = (hue + degrees) % 360;
		hue = hue < 0 ? 360 + hue : hue;
      hue = hue * 0.01;
		var rgb = this.hsltorgb(hue, this.hsl[1], this.hsl[2]);
      if(isRGB){
         return this.getrgb(rgb[0], rgb[1], rgb[2]);
      }
      else{
         return [rgb[0], rgb[1], rgb[2]];
      }
   }

   this.sethsl = function(){
      r = this.red/255, g = this.green/255, b = this.blue/255;
     var max = Math.max(r, g, b), min = Math.min(r, g, b);
     var h, s, l = (max + min) / 2;
     if(max == min){
         h = s = 0;
     }else{
         var d = max - min;
         s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
         switch(max){
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
         }
         h /= 6;
     }
     return this.hsl = [h, s, l];
   }

   this.hsltorgb = function(h, s, l){
      var r, g, b;
       if(s == 0){  r = g = b = l; // achromatic
       }else{
           var hue2rgb = function hue2rgb(p, q, t){
               if(t < 0) t += 1;
               if(t > 1) t -= 1;
               if(t < 1/6) return p + (q - p) * 6 * t;
               if(t < 1/2) return q;
               if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
               return p;
           }
           var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
           var p = 2 * l - q;
           r = hue2rgb(p, q, h + 1/3);
           g = hue2rgb(p, q, h);
           b = hue2rgb(p, q, h - 1/3);
       }

       return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
   }
}




/**
 * ColorPicker Class.
 * @constructor
 * @param {int} r - The Red color value between 0 and 255.
 * @param {int} g - The Green color value between 0 and 255.
 * @param {int} b - The Blue color value between 0 and 255.
 */
function Colorpicker(r, g, b){
   this.r = r;
   this.g = g;
   this.b = b;
   this.nuance = false;
   this.color = new Color();
   this.maximize = false;

   let remote = require('electron').remote, self = this;

   /**
    * hexFromRGB function.
    * @function
    * @param {int} r - The Red color value between 0 and 255.
    * @param {int} g - The Green color value between 0 and 255.
    * @param {int} b - The Blue color value between 0 and 255.
    * @return {string} - Hexadecimal string.
    */
   this.hexFromRGB = function(r, g, b){
      var hex = [Number(r).toString(16), Number(g).toString(16), Number(b).toString(16)];
      for(var i = 0; i<3; i++){
         if(hex[i] < 10 || hex[i].length === 1){ hex[i] = '0'+hex[i]; }
      }
      return hex.join("").toUpperCase();
   }


   /**
    * hexFromArray function.
    * @function
    * @param {array} rgb - The Red, Green and Blue color value between 0 and 255.
    * @return {string} - Hexadecimal string.
    */
   this.hexFromArray = function(array){
      var hex = [Number(array[0]).toString(16), Number(array[1]).toString(16), Number(array[2]).toString(16)];
      for(var i = 0; i<3; i++){
         if(hex[i] < 10 || hex[i].length === 1){ hex[i] = '0'+hex[i]; }
      }
      return hex.join("").toUpperCase();
   }


   /**
    * hexToRGB function.
    * @function
    * @param {string} hex - The Hexadecimal value.
    * @return {array} - {r: {int}, g: {int}, b: {int}}).
    */
   this.hexToRGB = function(hex){
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
           r: parseInt(result[1], 16),
           g: parseInt(result[2], 16),
           b: parseInt(result[3], 16)
      } : null;
   }


   this.toggleFlexbox = function(el){
      var el = document.querySelector(el);
      if(el.style.display === "none"){
         el.style.display = 'flex';
      }else{
         el.style.display = 'none';
      }
   };


   this.changeColor = function(r, g, b){
      if((r <= 255 && g <= 126 && b <= 255) || (r <= 70 && g <= 55 && b <= 255))
      { document.querySelector('body').classList.add('whited'); }
      else{ document.querySelector('body').classList.remove('whited'); }
      document.querySelector('.redBar progress').value = r;
      document.querySelector('.redBar input').value = r;
      document.querySelector('#rangeRed').value = r;
      document.querySelector('#r').innerHTML = r;
      document.querySelector('.greenBar progress').value = g;
      document.querySelector('.greenBar input').value = g;
      document.querySelector('#rangeGreen').value = g;
      document.querySelector('#g').innerHTML = g;
      document.querySelector('.blueBar progress').value = b;
      document.querySelector('.blueBar input').value = b;
      document.querySelector('#rangeBlue').value = b;
      document.querySelector('#b').innerHTML = b;
      document.querySelector("#numberHex").value = '#'+this.hexFromRGB(r, g, b);
      this.changeShade(r, g, b);
      document.querySelector("body").style.background = "#"+this.hexFromRGB(r, g, b);
      this.r = r;
      this.g = g;
      this.b = b;
   }


      /*var value = document.getElementById('text-rgb'), range = document.createRange();
      range.selectNode(value);
      window.getSelection().addRange(range);
      document.execCommand('copy');
      window.getSelection().removeAllRanges();*/


   this.changeShade = function(r, g, b){
      this.color.setrgb(r, g, b);
      document.querySelector('#nu1').style.background = this.color.lightness(0.16, true);
      document.querySelector('#nu1').attributes['data-color'].value = this.hexFromArray(this.color.lightness(0.16));
      document.querySelector('#nu2').style.background = this.color.lightness(0.08, true);
      document.querySelector('#nu2').attributes['data-color'].value = this.hexFromArray(this.color.lightness(0.08));
      document.querySelector('#nu3').style.background = this.color.lightness(0.04, true);
      document.querySelector('#nu3').attributes['data-color'].value = this.hexFromArray(this.color.lightness(0.04));
      document.querySelector('#nu4').style.background = this.color.lightness(0.02, true);
      document.querySelector('#nu4').attributes['data-color'].value = this.hexFromArray(this.color.lightness(0.02));
      document.querySelector('#nu5').style.background = this.color.lightness(0.01, true);
      document.querySelector('#nu5').attributes['data-color'].value = this.hexFromArray(this.color.lightness(0.01));
      document.querySelector('#nu6').style.background = 'rgb('+r+', '+g+', '+b+')';
      document.querySelector('#nu6').attributes['data-color'].value = this.hexFromRGB(r, g, b);
      document.querySelector('#nu7').style.background = this.color.lightness(-0.01, true);
      document.querySelector('#nu7').attributes['data-color'].value = this.hexFromArray(this.color.lightness(-0.01));
      document.querySelector('#nu8').style.background = this.color.lightness(-0.02, true);
      document.querySelector('#nu8').attributes['data-color'].value = this.hexFromArray(this.color.lightness(-0.02));
      document.querySelector('#nu9').style.background = this.color.lightness(-0.04, true);
      document.querySelector('#nu9').attributes['data-color'].value = this.hexFromArray(this.color.lightness(-0.04));
      document.querySelector('#nu10').style.background = this.color.lightness(-0.08, true);
      document.querySelector('#nu10').attributes['data-color'].value = this.hexFromArray(this.color.lightness(-0.08));
      document.querySelector('#nu11').style.background = this.color.lightness(-0.16, true);
      document.querySelector('#nu11').attributes['data-color'].value = this.hexFromArray(this.color.lightness(-0.16));

      document.querySelector('#ni1').style.background = this.color.negate(true);
      document.querySelector('#ni1').attributes['data-color'].value = this.hexFromArray(this.color.negate());
      document.querySelector('#ni2').style.background = this.color.rotate(10, true);
      document.querySelector('#ni2').attributes['data-color'].value = this.hexFromArray(this.color.rotate(10));
      document.querySelector('#ni3').style.background = this.color.rotate(15, true);
      document.querySelector('#ni3').attributes['data-color'].value = this.hexFromArray(this.color.rotate(15));
      document.querySelector('#ni4').style.background = this.color.rotate(20, true);
      document.querySelector('#ni4').attributes['data-color'].value = this.hexFromArray(this.color.rotate(20));
      document.querySelector('#ni5').style.background = this.color.rotate(30, true);
      document.querySelector('#ni5').attributes['data-color'].value = this.hexFromArray(this.color.rotate(30));
      document.querySelector('#ni6').style.background = this.color.rotate(40, true);
      document.querySelector('#ni6').attributes['data-color'].value = this.hexFromArray(this.color.rotate(40));
      document.querySelector('#ni7').style.background = this.color.rotate(50, true);
      document.querySelector('#ni7').attributes['data-color'].value = this.hexFromArray(this.color.rotate(50));
      document.querySelector('#ni8').style.background = this.color.rotate(55, true);
      document.querySelector('#ni8').attributes['data-color'].value = this.hexFromArray(this.color.rotate(55));
      document.querySelector('#ni9').style.background = this.color.rotate(60, true);
      document.querySelector('#ni9').attributes['data-color'].value = this.hexFromArray(this.color.rotate(60));
      document.querySelector('#ni10').style.background = this.color.rotate(75, true);
      document.querySelector('#ni10').attributes['data-color'].value = this.hexFromArray(this.color.rotate(75));
      document.querySelector('#ni11').style.background = this.color.rotate(79, true);
      document.querySelector('#ni11').attributes['data-color'].value = this.hexFromArray(this.color.rotate(79));
   }

   this.picker = function(){
      //document.querySelector('*').style.cursor = "crosshair";

      const {desktopCapturer} = require('electron');
      desktopCapturer.getSources({types: ['window', 'screen']}, (error, sources) => {
        if (error) throw error
        for (let i = 0; i < sources.length; ++i) {
          console.log(sources);
          if (sources[i].name === 'Entire screen') {
            console.log('ok');
            navigator.webkitGetUserMedia({
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: sources[i].id,
                  minWidth: 1280,
                  maxWidth: 1280,
                  minHeight: 720,
                  maxHeight: 720
                }
              }
            }, handleStream, handleError)
            return
          }
        }
      });

      function handleStream (stream) {
        console.log(stream);

        var robot = require("robotjs");

// Get mouse position.
var mouse = robot.getMousePos();

// Get pixel color in hex format.
var hex = robot.getPixelColor(mouse.x, mouse.y);
console.log("#" + hex + " at x:" + mouse.x + " y:" + mouse.y);
        //document.querySelector('video').src = URL.createObjectURL(stream);
      }

      function handleError (e) {
        console.log(e)
      }
   }


   this.construct = function(){
      this.initListener();
      this.color.setrgb(this.r, this.g, this.b);
      document.querySelector('.box').style.background = '#'+this.hexFromArray(this.color.negate());
      document.querySelector('#numberBoxHex').value = '#'+this.hexFromArray(this.color.negate());
      document.querySelector('header .ni').style.display = 'none';
      document.querySelector('header .nu').style.display = 'none';

      this.changeColor(this.r, this.g, this.b);
   }


   this.initListener = ()=>{

      document.querySelector('#onTop').onclick = function(){
         this.classList.toggle('active');
         if(this.classList.contains('active')){
            remote.getCurrentWindow().setAlwaysOnTop(true);
         }
         else{
            remote.getCurrentWindow().setAlwaysOnTop(false);
         }
      }
      /*document.querySelector('#picker').onclick = () => {
        this.picker();
      }*/
      document.querySelector('#nuances').onclick = () => {
         document.querySelector('#nuances').classList.toggle('active');
         this.toggleFlexbox('header .nu');
         this.toggleFlexbox('header .ni');
      }
      document.querySelector('#random').onclick = ()=>{
         var r = Math.floor(Math.random() * 255) + 0,
         g = Math.floor(Math.random() * 255) + 0,
         b = Math.floor(Math.random() * 255) + 0;
         this.changeColor(r, g, b);
      }

      document.querySelector('#minimize').onclick = function(){
         remote.getCurrentWindow().minimize();
      }
      document.querySelector('#square').onclick = function(){
         var window = remote.getCurrentWindow();
         if(this.maximize){
            window.unmaximize();
            this.maximize = false;
         }
         else{
            window.maximize();
            this.maximize = true;
         }
      }
      document.querySelector('#close').onclick = function(){
         remote.getCurrentWindow().close();
      }

      document.querySelector('.redBar input').oninput = () =>{
         this.r = document.querySelector('.redBar input').value
         this.changeColor(this.r, this.g, this.b);
      }
      document.querySelector('.greenBar input').oninput = () =>{
         this.g = document.querySelector('.greenBar input').value;
         this.changeColor(this.r, this.g, this.b);
      }
      document.querySelector('.blueBar input').oninput = () =>{
         this.b = document.querySelector('.blueBar input').value;
         this.changeColor(this.r, this.g, this.b);
      }

      document.querySelector('#rangeRed').oninput = function(e){
         var red = this.value;
         if(red > 255){this.value = 255; red = 255;}
         if(red < 0){this.value = 0; red = 0;}
         self.changeColor(red, self.g, self.b);
      }
      document.querySelector('#rangeGreen').oninput = function(e){
         var green = this.value;
         if(green > 255){this.value = 255; green = 255;}
         if(green < 0){this.value = 0; green = 0;}
         self.changeColor(self.r, green, self.b);
      }
      document.querySelector('#rangeBlue').oninput = function(e){
         var blue = this.value;
         if(blue > 255){this.value = 255; blue = 255;}
         if(blue < 0){this.value = 0; blue = 0;}
         self.changeColor(self.r, self.g, blue);
      }
      document.querySelector('#numberHex').oninput = function(e){
         var hex = this.value.replace('#', '');
         if(hex.length == 6){
            var color = self.hexToRGB('#'+hex);
            if(color.r && color.g && color.b){
               self.changeColor(color.r, color.g, color.b);
            }
         }
      }
      document.querySelector('#numberBoxHex').oninput = function(e){
         var hex = this.value.replace('#', '');
         if(hex.length == 6){
            document.querySelector('.box').style.background = '#'+hex;
         }
      }
      document.querySelector('#numberBoxHex').onfocus = function(e){
         this.onkeydown = function(e){ changeHex(e, this.value); }
         this.onwheel = function(e){ changeHex(e, this.value); }
         function changeHex(e, hex){
            console.log('okokok');
            var color = self.hexToRGB(hex);
            if(hex.length >= 6){
               if(e.keyCode == 38 || e.deltaY < 0){
                  if(color.r >= 255){color.r = 254;}
                  if(color.g >= 255){color.g = 254;}
                  if(color.b >= 255){color.b = 254;}
                  document.querySelector('#numberBoxHex').value = '#'+self.hexFromRGB(color.r+1, color.g+1, color.b+1);
                  document.querySelector('.box').style.background = '#'+self.hexFromRGB(color.r+1, color.g+1, color.b+1);
               }
               else if(e.keyCode == 40 || e.deltaY > 0){
                  if(color.r <= 0){color.r = 1;}
                  if(color.g <= 0){color.g = 1;}
                  if(color.b <= 0){color.b = 1;}
                  document.querySelector('#numberBoxHex').value = '#'+self.hexFromRGB(color.r-1, color.g-1, color.b-1);
                  document.querySelector('.box').style.background = '#'+self.hexFromRGB(color.r-1, color.g-1, color.b-1);
               }
            }
         }
      }

      var els = document.querySelectorAll('#rangeRed, #rangeGreen, #rangeBlue, #numberHex');
      for(el of els){
         el.onfocus = function(){
            this.onkeydown = function(e){
               var val = this.value.replace('#', '');
               changeHex(e, val);
            }
            this.onwheel = function(e){
               var val = this.value.replace('#', '');
               changeHex(e, val);
            }
            function changeHex(e, hex){
               var color = self.hexToRGB('#'+hex);
               if(hex.length == 6){
                  if(e.keyCode == 38 || e.deltaY < 0){
                     if(color.r >= 255){color.r = 254;}
                     if(color.g >= 255){color.g = 254;}
                     if(color.b >= 255){color.b = 254;}
                     self.changeColor(color.r+1, color.g+1, color.b+1);
                  }
                  else if(e.keyCode == 40 || e.deltaY > 0){
                     if(color.r <= 0){color.r = 1;}
                     if(color.g <= 0){color.g = 1;}
                     if(color.b <= 0){color.b = 1;}
                     self.changeColor(color.r-1, color.g-1, color.b-1);
                  }
               }
            }
         }
      }


      var els = document.querySelectorAll('header .ni aside, header .nu aside');
      for(el of els){
         el.onclick = function(){
            var color = self.hexToRGB(this.attributes['data-color'].value);
            self.changeColor(color.r, color.g, color.b);
         }
      }

      document.querySelector('#newBox').onclick = function(){
         this.classList.toggle('active');
         if(document.querySelector('body').classList.contains('boxed')){
            document.querySelector('body').classList.remove('boxed');
            document.querySelector('.box').style.right = '-200px';
            document.querySelector('#numberBoxHex').style.cursor = 'default';
            document.querySelector('#numberBoxHex').style.visibility = 'none';
            document.querySelector('#numberBoxHex').style.opacity = '0';
         }
         else{
            document.querySelector('body').classList.add('boxed');
            document.querySelector('.box').style.right = '0';
            document.querySelector('#numberBoxHex').style.cursor = 'text';
            document.querySelector('#numberBoxHex').style.visibility = 'visible';
            document.querySelector('#numberBoxHex').style.opacity = '1';
         }

      }

   }


   this.construct();
}

var Colorpicker = new Colorpicker(0, 174, 239);
