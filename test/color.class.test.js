const { expect, assert } = require('chai');
const Colour = require('../src/views/js/color.class');

describe('test case for colour class init', ()=>{
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

describe('test rgb functions', ()=>{
    let c;
    before(function(){
        cp = new Colour(100,100,100);
    })
    
    //set alpha
    it('alpha should be 0.5', ()=>{
        cp.setAlpha(0.5);
        expect(cp.alpha).to.be.equal(0.5);
    });

    //set colour from rbg
    it('r,g,b should be set true', ()=>{
        expect(cp.setColorFromRGB([0,30,80])).to.be.equal(true);
    }); 

    it('r,g,b should be [0,30,80]', ()=>{
        expect(cp.rgb).to.eql([0,30,80]);
    }); 
    
    it('r,g,b,a should be [0,30,80,0.5]', ()=>{
        expect(cp.rgba).to.eql([0,30,80,0.5]);
    });

    //set colour from hex
    it('r,g,b from hex should be set true', ()=>{
        expect(cp.setColorFromHex('#91312a')).to.be.equal(true);
    }); 

    it('r,g,b from hexConverter should be [145,49,42]', ()=>{
        expect(cp.getRGBFromHex('#91312a')).to.eql([145,49,42]);
    });

    it('r,g,b from hex should be [145,49,42]', ()=>{
        cp.setColorFromHex('#91312a')
        expect(cp.rgb).to.eql([145,49,42]);
    }); 

    it('r,g,b,a from hexConverter should be [145,49,42,0.5]', ()=>{
        expect(cp.getRGBAFromHex('#91312a')).to.eql([145,49,42,0.5]);
    });
    
    //set colour from hsl
    it('r,g,b from hsl should be set true', ()=>{
        expect(cp.setColorFromHSL([150,49,33])).to.be.equal(true);
    }); 

    it('r,g,b from hsl should be [42,125,84]', ()=>{ //There's a potential bug here in the rounding
        cp.setColorFromHSL([150,49,33])
        expect(cp.rgb).to.eql([43,125,84]);
    }); 

    it('r,g,b from hsl should be [43,125,84]', ()=>{ 
        expect(cp.getRGBFromHSL([150,49,33])).to.eql([43,125,84]);
    }); 

    //get css from rgb and rgba
    it('css ahould be rgb(10,20,30)', ()=>{
        expect(cp.getCSSFromRGB([10,20,30])).to.be.equal('rgb(10, 20, 30)');
    }); 

    it('css ahould be rgba(10,20,30, 0.80)', ()=>{
        expect(cp.getCSSFromRGBA([10,20,30,0.802])).to.be.equal('rgba(10, 20, 30, 0.80)');
    }); 

    //rgb -> rgba and vise versa
    it('r,g,b,a from rgb should be [150,49,33, 0.5]', ()=>{
        expect(cp.getRGBAFromRGB([150,49,33])).to.eql([150, 49, 33, 0.5]);
    }); 

    it('r,g,b from rgba should be [150,49,33]', ()=>{
        expect(cp.getRGBFromRGBA([150,49,33,0.75])).to.eql([150, 49, 33]);
    });
    
    // rgb from HSV
    //different test cases to test different h values
    const tests = [
        {"hsv": [120, 71, 80], "rgb": [59, 204, 59]},
        {"hsv": [121, 71, 80], "rgb": [59, 204, 61]}, // could be rounding error
        {"hsv": [122, 71, 80], "rgb": [59, 204, 64]},
        {"hsv": [123, 71, 80], "rgb": [59, 204, 66]},
        {"hsv": [124, 71, 80], "rgb": [59, 204, 69]},
        {"hsv": [125, 71, 80], "rgb": [59, 204, 71]},
    ];
    tests.forEach(t => {
        it(`r,g,b from rgba should be ${t.rgb}`, ()=>{ 
            expect(cp.getRGBFromHSV(t.hsv)).to.eql(t.rgb);
        });
    });
});

describe('test case for dark & negative functions', ()=>{
    beforeEach(function(){
        cp = new Colour(0,0,0);
    });
    
    //test isDarkColor
    it('rgb should be dark (true)', ()=>{
        expect(cp.isDarkColor([46, 61, 47])).to.be.true;
    });

    it('rgb shouldnt be dark (false)', ()=>{
        expect(cp.isDarkColor([87, 186, 147])).to.be.false;
    });

    it('set colour shouldnt be dark (true)', ()=>{
        expect(cp.isDarkColor()).to.be.true;
    });

    it('set colour shouldnt be dark (true)', ()=>{
        cp.setColor(255,255,255)
        expect(cp.isDarkColor()).to.be.false;
    });

    //test negatives
    it('rgb negative should be [155,105,55]', ()=>{
        expect(cp.getNegativeColor([100,150,200])).to.be.eql([155,105,55]);
    }); 

    it('rgb negative should be [155,105,55]', ()=>{
        expect(cp.setNegativeColor([100,150,200])).to.be.eql([155,105,55]);
    });

    it('rgb negative should be [255,255,255]', ()=>{
        expect(cp.setNegativeColor()).to.be.eql([255,255,255]);
    });
});


