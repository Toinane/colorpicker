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

    it('r should be 0', ()=>{
        expect(cp.red).to.be.equal(0);
    }); 
    
    it('g should be 0', ()=>{
        expect(cp.green).to.be.equal(0);
    });  

    it('b should be 0', ()=>{
        expect(cp.blue).to.be.equal(0);
    });  

    it('r,g,b should be [0,0,0]', ()=>{
        expect(cp.rgb).to.eql([0,0,0]);
    }); 
    
    it('r,g,b,a should be [0,0,0,1]', ()=>{
        expect(cp.rgba).to.eql([0,0,0,1]);
    });
});

