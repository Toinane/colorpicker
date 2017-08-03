'use strict';

let cp;

class Colorpicker extends Color{

  constructor(hex) {
    super();
    this.body = document.querySelector('body');
    this.hex_value = document.querySelector('#hex_value');
    this.rgb_value = document.querySelector('#rgb_value');
    this.rgbhtml = {
      red_progress: document.querySelector('.red_bar progress'),
      red_input: document.querySelector('.red_bar input'),
      red_range: document.querySelector('#red_value'),
      green_progress: document.querySelector('.green_bar progress'),
      green_input: document.querySelector('.green_bar input'),
      green_range: document.querySelector('#green_value'),
      blue_progress: document.querySelector('.blue_bar progress'),
      blue_input: document.querySelector('.blue_bar input'),
      blue_range: document.querySelector('#blue_value')
    };

    this.setNewColor(hex);
  }

  setNewRGBColor(rgb) {
    this.setNewColor(this.getHexFromRGB(rgb));
  }

  setNewColor(hex) {
    ipcRenderer.send('changeLastColor', hex);
    this.setColorFromHex(hex);
    const darknessColor = this.isDarkColor(this.rgb);

    for(let i = 0; i < Object.keys(this.rgbhtml).length; i++){
      this.rgbhtml[Object.keys(this.rgbhtml)[i]].value = this.rgb[Math.floor(i/3)];
    }
    this.hex_value.value = this.hex;
    this.rgb_value.innerHTML = this.getCSSFromRGB(this.rgb);
    this.body.style.background = this.hex;
    //this.changeShade();
  }

  changeShade(){
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
     document.querySelector('#nu6').style.background = this.hex;
     document.querySelector('#nu6').attributes['data-color'].value = this.hex;
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

}
