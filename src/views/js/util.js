'use strict';

const {remote} = require('electron');


let toggleFlexbox = el => {
   let el = document.querySelector(el);
   if(el.style.display === "none"){
      el.style.display = 'flex';
   }else{
      el.style.display = 'none';
   }
};
