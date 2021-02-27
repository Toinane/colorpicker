const { expect } = require('chai');
const Colour = require('../src/views/js/color.class');

describe('test case for colour class init', ()=>{
    let c;
    before(function(){
        cp = new Colour(0,0,0);
    })
    
    it('should be an object', ()=>{
        expect(cp).to.be.a('object');
    });

    it('alpha should be 1', ()=>{
        expect(cp.alpha).to.be.equal(1);
    });

    it('r,g,b should be set true', ()=>{
        expect(cp.setColor(0,0,0)).to.be.equal(true);
    });
});