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

   this.isDarkColor = function(){
       return Math.round((
         parseInt(this.red) * 299 +
         parseInt(this.green) * 587 +
         parseInt(this.blue) * 114) / 1000
       ) <= 140;
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
