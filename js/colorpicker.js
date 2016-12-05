/*jQuery.fn.toggleFlexbox = function(){
   var elm = $(this[0]);
   if(elm.css('display') === "none"){
      elm.slideDown(500, function(){
         elm.css('display', 'flex');
      });
      return;
   }else{
      elm.slideUp(500);
      return;
   }
};*/


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

   this.negate = function(){
      var rgb = [];
      for(var i = 0; i < 3; i++){
         rgb[i] = 255 - this.rgb[i];
      }
      return this.getrgb(rgb[0], rgb[1], rgb[2]);
   }

   this.grayscale = function(){
      var gray = parseInt(this.red * 0.3 + this.green * 0.59 + this.blue * 0.11);
      return this.getrgb(gray, gray, gray);
   }

   this.lightness = function(l){
      var lightness = this.hsltorgb(this.hsl[0], this.hsl[1], (this.hsl[2]+l));
      return this.getrgb(lightness[0], lightness[1], lightness[2]);
   }

   this.rotate = function(degrees){
      var hue = this.hsl[0];
		hue = (hue + degrees) % 360;
		hue = hue < 0 ? 360 + hue : hue;
      hue = hue * 0.01;
		var rgb = this.hsltorgb(hue, this.hsl[1], this.hsl[2]);
		return this.getrgb(rgb[0], rgb[1], rgb[2]);
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


// console.log(color.getrgb());
// console.log(color.negate());
// console.log(color.lighten(0.05));





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
      document.querySelector('.redBar progress').value = r;
      document.querySelector('.redBar input').value = r;
      document.querySelector('#rangeRed').value = r;
      document.querySelector('.greenBar progress').value = g;
      document.querySelector('.greenBar input').value = g;
      document.querySelector('#rangeGreen').value = g;
      document.querySelector('.blueBar progress').value = b;
      document.querySelector('.blueBar input').value = b;
      document.querySelector('#rangeBlue').value = b;
      document.querySelector("#numberHex").value = '#'+this.hexFromRGB(r, g, b);
      this.changeShade(r, g, b);
      document.querySelector("body").style.background = "#"+this.hexFromRGB(r, g, b);
   }


   this.changeShade = function(r, g, b){
      this.color.setrgb(r, g, b);
      document.querySelector('#nu1').style.background = this.color.lightness(0.16);
      document.querySelector('#nu2').style.background = this.color.lightness(0.08);
      document.querySelector('#nu3').style.background = this.color.lightness(0.04);
      document.querySelector('#nu4').style.background = this.color.lightness(0.02);
      document.querySelector('#nu5').style.background = this.color.lightness(0.01);
      document.querySelector('#nu6').style.background = 'rgb('+r+', '+g+', '+b+')';
      document.querySelector('#nu7').style.background = this.color.lightness(-0.01);
      document.querySelector('#nu8').style.background = this.color.lightness(-0.02);
      document.querySelector('#nu9').style.background = this.color.lightness(-0.04);
      document.querySelector('#nu10').style.background = this.color.lightness(-0.08);
      document.querySelector('#nu11').style.background = this.color.lightness(-0.16);

      document.querySelector('#ni1').style.background = this.color.negate();
      document.querySelector('#ni2').style.background = this.color.rotate(10);
      document.querySelector('#ni3').style.background = this.color.rotate(15);
      document.querySelector('#ni4').style.background = this.color.rotate(20);
      document.querySelector('#ni5').style.background = this.color.rotate(30);
      document.querySelector('#ni6').style.background = this.color.rotate(40);
      document.querySelector('#ni7').style.background = this.color.rotate(50);
      document.querySelector('#ni8').style.background = this.color.rotate(55);
      document.querySelector('#ni9').style.background = this.color.rotate(60);
      document.querySelector('#ni10').style.background = this.color.rotate(75);
      document.querySelector('#ni11').style.background = this.color.rotate(79);
   }


   this.construct = function(){
      this.color.setrgb(this.r, this.g, this.b);

      var els = document.querySelectorAll('header .ni, header .nu');
      for(el of els){ el.style.display = 'none'; }
      console.log("launch");
      this.changeColor(this.r, this.g, this.b);
   }


   document.querySelector('.nuance').onclick = () => {
         this.toggleFlexbox('header .nu');
         this.toggleFlexbox('header .ni');
   }

   document.querySelector('.alea').onclick = ()=>{
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
      console.log('close click');
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


   this.construct();
}

var Colorpicker = new Colorpicker(0, 174, 239);
