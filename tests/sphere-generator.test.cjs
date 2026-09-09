// Run with: node --test tests/sphere-generator.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createHash } = require('node:crypto');
const vm = require('node:vm');
const root = join(__dirname, '..');
const context = vm.createContext({ window: {}, document: { documentElement: { lang: 'en' }, addEventListener() {} } });
const source = readFileSync(join(root, 'assets/sphere-generator.js'), 'utf8');
assert(source.includes('    document.addEventListener'));
vm.runInContext(source.replace('    document.addEventListener', '    window.test = {state, buildShape, buildAllLayersText};\n    document.addEventListener'), context);
vm.runInContext(readFileSync(join(root, 'assets/sphere-preview.js'), 'utf8'), context);
const { state, buildShape, buildAllLayersText } = context.window.test;
const { buildSurface } = context.window.SpherePreview;

// Golden counts and exports captured from the generator before the visual refresh.
const fixtures = [
  {
    "shape": "solid_sphere",
    "radius": 1,
    "thickness": 1,
    "blocks": 7,
    "layers": 3,
    "exportHash": "4b64d179b7fc6f3263d7a3fada6f8b028a6570919e19a31f06f67ded3bc5606b"
  },
  {
    "shape": "solid_sphere",
    "radius": 1,
    "thickness": 4,
    "blocks": 7,
    "layers": 3,
    "exportHash": "4b64d179b7fc6f3263d7a3fada6f8b028a6570919e19a31f06f67ded3bc5606b"
  },
  {
    "shape": "solid_sphere",
    "radius": 7,
    "thickness": 1,
    "blocks": 1575,
    "layers": 15,
    "exportHash": "24adf889a8cc121add4b670ec70ccf11ff6964f1eb13423acbe2ca3e985c4ecc"
  },
  {
    "shape": "solid_sphere",
    "radius": 7,
    "thickness": 4,
    "blocks": 1575,
    "layers": 15,
    "exportHash": "24adf889a8cc121add4b670ec70ccf11ff6964f1eb13423acbe2ca3e985c4ecc"
  },
  {
    "shape": "solid_sphere",
    "radius": 64,
    "thickness": 1,
    "blocks": 1110717,
    "layers": 129,
    "exportHash": "4848c17ae1dc1196db306becb4c645ab839b2cfa6d2944b9960f81ce1b7169ca"
  },
  {
    "shape": "solid_sphere",
    "radius": 64,
    "thickness": 4,
    "blocks": 1110717,
    "layers": 129,
    "exportHash": "4848c17ae1dc1196db306becb4c645ab839b2cfa6d2944b9960f81ce1b7169ca"
  },
  {
    "shape": "hollow_sphere",
    "radius": 1,
    "thickness": 1,
    "blocks": 7,
    "layers": 3,
    "exportHash": "4b64d179b7fc6f3263d7a3fada6f8b028a6570919e19a31f06f67ded3bc5606b"
  },
  {
    "shape": "hollow_sphere",
    "radius": 1,
    "thickness": 4,
    "blocks": 7,
    "layers": 3,
    "exportHash": "4b64d179b7fc6f3263d7a3fada6f8b028a6570919e19a31f06f67ded3bc5606b"
  },
  {
    "shape": "hollow_sphere",
    "radius": 7,
    "thickness": 1,
    "blocks": 776,
    "layers": 15,
    "exportHash": "874851f0abce912e4c4d288f9fb31755a9e6c5bc2ad50cbed9a05b6f8e67ab35"
  },
  {
    "shape": "hollow_sphere",
    "radius": 7,
    "thickness": 4,
    "blocks": 1494,
    "layers": 15,
    "exportHash": "45b59ddff916330f734ffa9c3f40f5deeba165feeef1d2a6ced6662fce1fe1d7"
  },
  {
    "shape": "hollow_sphere",
    "radius": 64,
    "thickness": 1,
    "blocks": 75992,
    "layers": 129,
    "exportHash": "f176a53049c5bcf52df90acc57591858007d56ce859c3257c0618b18f2400cb4"
  },
  {
    "shape": "hollow_sphere",
    "radius": 64,
    "thickness": 4,
    "blocks": 216498,
    "layers": 129,
    "exportHash": "36345b708ace937584cfcdb776051e77cb0275f6f7058b9689d289b7496ba9c3"
  },
  {
    "shape": "upper_dome",
    "radius": 1,
    "thickness": 1,
    "blocks": 6,
    "layers": 2,
    "exportHash": "9de0a0a94e4591746a7fddcc0762e77a3b58d41b02491ff981ee0b9841204240"
  },
  {
    "shape": "upper_dome",
    "radius": 1,
    "thickness": 4,
    "blocks": 6,
    "layers": 2,
    "exportHash": "9de0a0a94e4591746a7fddcc0762e77a3b58d41b02491ff981ee0b9841204240"
  },
  {
    "shape": "upper_dome",
    "radius": 7,
    "thickness": 1,
    "blocks": 872,
    "layers": 8,
    "exportHash": "63e0f05a374f8fa3e25b9bcc27e80007d15b4de002b1ba79569fe93c8dc235f4"
  },
  {
    "shape": "upper_dome",
    "radius": 7,
    "thickness": 4,
    "blocks": 872,
    "layers": 8,
    "exportHash": "63e0f05a374f8fa3e25b9bcc27e80007d15b4de002b1ba79569fe93c8dc235f4"
  },
  {
    "shape": "upper_dome",
    "radius": 64,
    "thickness": 1,
    "blocks": 561841,
    "layers": 65,
    "exportHash": "4e2b9aec32aee8c6b0d4f3de75acccb1194268ccb8fdebc0eed67b58fd68d6f6"
  },
  {
    "shape": "upper_dome",
    "radius": 64,
    "thickness": 4,
    "blocks": 561841,
    "layers": 65,
    "exportHash": "4e2b9aec32aee8c6b0d4f3de75acccb1194268ccb8fdebc0eed67b58fd68d6f6"
  },
  {
    "shape": "lower_dome",
    "radius": 1,
    "thickness": 1,
    "blocks": 6,
    "layers": 2,
    "exportHash": "0d7da61508e69b60ac01e66350f18d18b529118b570200c0cd9001d767d04083"
  },
  {
    "shape": "lower_dome",
    "radius": 1,
    "thickness": 4,
    "blocks": 6,
    "layers": 2,
    "exportHash": "0d7da61508e69b60ac01e66350f18d18b529118b570200c0cd9001d767d04083"
  },
  {
    "shape": "lower_dome",
    "radius": 7,
    "thickness": 1,
    "blocks": 872,
    "layers": 8,
    "exportHash": "34443689e95d44cccc971e82ede6ddc72eff4d118134af901d9cdcb38c421dba"
  },
  {
    "shape": "lower_dome",
    "radius": 7,
    "thickness": 4,
    "blocks": 872,
    "layers": 8,
    "exportHash": "34443689e95d44cccc971e82ede6ddc72eff4d118134af901d9cdcb38c421dba"
  },
  {
    "shape": "lower_dome",
    "radius": 64,
    "thickness": 1,
    "blocks": 561841,
    "layers": 65,
    "exportHash": "4015ad26aeaaac62e83dbec3845abf3d0af35ff63eac20a34c28a8d0d908aeb9"
  },
  {
    "shape": "lower_dome",
    "radius": 64,
    "thickness": 4,
    "blocks": 561841,
    "layers": 65,
    "exportHash": "4015ad26aeaaac62e83dbec3845abf3d0af35ff63eac20a34c28a8d0d908aeb9"
  },
  {
    "shape": "filled_circle",
    "radius": 1,
    "thickness": 1,
    "blocks": 5,
    "layers": 1,
    "exportHash": "6a2610443ed080821bd38924620f5c52e7b0d5a02d91ca0f4c6ba8cfa90e6290"
  },
  {
    "shape": "filled_circle",
    "radius": 1,
    "thickness": 4,
    "blocks": 5,
    "layers": 1,
    "exportHash": "6a2610443ed080821bd38924620f5c52e7b0d5a02d91ca0f4c6ba8cfa90e6290"
  },
  {
    "shape": "filled_circle",
    "radius": 7,
    "thickness": 1,
    "blocks": 169,
    "layers": 1,
    "exportHash": "b5d4d8213d61b2411bb4c551b1c2d7bb65013d037394731c3ed3329c68218693"
  },
  {
    "shape": "filled_circle",
    "radius": 7,
    "thickness": 4,
    "blocks": 169,
    "layers": 1,
    "exportHash": "b5d4d8213d61b2411bb4c551b1c2d7bb65013d037394731c3ed3329c68218693"
  },
  {
    "shape": "filled_circle",
    "radius": 64,
    "thickness": 1,
    "blocks": 12965,
    "layers": 1,
    "exportHash": "7b503ceb538daa507b2bb8405096437e1cd71bfde468efe82e0824f007bdfa5f"
  },
  {
    "shape": "filled_circle",
    "radius": 64,
    "thickness": 4,
    "blocks": 12965,
    "layers": 1,
    "exportHash": "7b503ceb538daa507b2bb8405096437e1cd71bfde468efe82e0824f007bdfa5f"
  },
  {
    "shape": "outline_circle",
    "radius": 1,
    "thickness": 1,
    "blocks": 5,
    "layers": 1,
    "exportHash": "6a2610443ed080821bd38924620f5c52e7b0d5a02d91ca0f4c6ba8cfa90e6290"
  },
  {
    "shape": "outline_circle",
    "radius": 1,
    "thickness": 4,
    "blocks": 5,
    "layers": 1,
    "exportHash": "6a2610443ed080821bd38924620f5c52e7b0d5a02d91ca0f4c6ba8cfa90e6290"
  },
  {
    "shape": "outline_circle",
    "radius": 7,
    "thickness": 1,
    "blocks": 68,
    "layers": 1,
    "exportHash": "6cda5a4b7b769fb6f62b61375e8c9418e826138ce3ad1795d9baea1bada841e7"
  },
  {
    "shape": "outline_circle",
    "radius": 7,
    "thickness": 4,
    "blocks": 148,
    "layers": 1,
    "exportHash": "8c83b11abb2dec126135d755787c985adc2a6a9aeee9cc9329c530d7e5be46c1"
  },
  {
    "shape": "outline_circle",
    "radius": 64,
    "thickness": 1,
    "blocks": 604,
    "layers": 1,
    "exportHash": "c1407b3ee43e5ed5e1d6f64f9c6b9ecb0569ec99920f6dd135d8fb839b8082a8"
  },
  {
    "shape": "outline_circle",
    "radius": 64,
    "thickness": 4,
    "blocks": 1752,
    "layers": 1,
    "exportHash": "3c33f45f0bc785a8eb13d8d114c6904f487dc6831a3690496aa5e5c46bcc053d"
  }
];
test('all six shapes preserve counts and exact layer exports at radii 1, 7 and 64', () => {
    for (const fixture of fixtures) {
        Object.assign(state, fixture);
        buildShape();
        assert.equal(state.totalBlocks, fixture.blocks);
        assert.equal(state.layers.length, fixture.layers);
        const hash = createHash('sha256').update(buildAllLayersText()).digest('hex');
        assert.equal(hash, fixture.exportHash, JSON.stringify(fixture));
    }
});
test('surface emits only exterior faces with outward triangle winding', () => {
    const isolated = buildSurface([{y:0, grid:[[true]]}], 0, 0, 'all');
    assert.equal(isolated.faceCount, 6);
    const joined = buildSurface([{y:0, grid:[[true,true]]}], 0, 0, 'all');
    assert.equal(joined.faceCount, 10);
    for (let p = 0; p < isolated.positions.length; p += 9) {
        const a = Array.from(isolated.positions.slice(p,p+3));
        const b = Array.from(isolated.positions.slice(p+3,p+6)).map((v,i)=>v-a[i]);
        const c = Array.from(isolated.positions.slice(p+6,p+9)).map((v,i)=>v-a[i]);
        const cross = [b[1]*c[2]-b[2]*c[1], b[2]*c[0]-b[0]*c[2], b[0]*c[1]-b[1]*c[0]];
        assert(cross.reduce((n,v,i)=>n+v*isolated.normals[p+i],0)>0);
    }
});
test('cutaway hides higher layers and slice mode shows exactly the selected cells', () => {
    const layers = [-1,0,1].map(y=>({y,grid:[[true,true],[true,false]]}));
    const cutaway = buildSurface(layers,1,0,'cutaway');
    for (let i=1;i<cutaway.positions.length;i+=3) assert(cutaway.positions[i]<=.5);
    const slice = buildSurface(layers,1,0,'slice');
    let tops=0;
    for (let i=0;i<slice.normals.length;i+=18) if(slice.normals[i+1]===1) tops++;
    assert.equal(tops,3);
    for (let i=1;i<slice.positions.length;i+=3) assert(Math.abs(slice.positions[i])===.5);
    assert.equal(buildSurface(layers,1,9,'slice').faceCount,0);
});
test('all localized pages have unique IDs and share the preview assets', () => {
    for (const language of ['', 'ru', 'fr', 'de']) {
        const html = readFileSync(join(root,language,'sphere-generator/index.html'),'utf8');
        const ids = Array.from(html.matchAll(/id="([^"]+)"/g),m=>m[1]);
        assert.equal(new Set(ids).size,ids.length);
        for (const id of ['sphereScene','sphereTab3d','sphereTabLayers','sphereLayerText','sphereLayerCanvas']) assert(ids.includes(id));
        assert(html.includes('/assets/sphere-preview.js?v='));
        assert(html.includes('/assets/sphere-generator.css?v='));
    }
});
