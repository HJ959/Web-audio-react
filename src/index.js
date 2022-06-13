import * as Tone from 'tone'
import * as PIXI from 'pixi.js'
import './main.css'
import './usefulFunctions'
import {
    getRandomInt,
    scale
} from './usefulFunctions';

// variables
let toneStarted = false;
let lowMeter, midMeter, highMeter;

initGraphics();

//attach a click listener to a play button
document.addEventListener('pointerdown', async () => {
    if (toneStarted === false) {
        await Tone.start()
        console.log('audio is ready')
        initSound();
        toneStarted = true;
    }
})

function initSound() {
    const lowPass = new Tone.Filter(240, "lowpass");
    lowMeter = new Tone.Meter();
    lowPass.connect(lowMeter);

    const midPass = new Tone.Filter(1000, "bandpass");
    midMeter = new Tone.Meter();
    midPass.connect(midMeter);

    const highPass = new Tone.Filter(6000, "highpass");
    highMeter = new Tone.Meter();
    highPass.connect(highMeter);

    const tracks = ['SpectralPattern.mp3', 'AtLeastWeHavMusic.mp3', 'LeploopLagoon.mp3', 'WarezHouse.mp3']
    const player = new Tone.Player(`/media/${tracks[getRandomInt(0,tracks.length)]}`).connect(highPass).connect(lowPass).connect(midPass).toDestination();
    // play as soon as the buffer is loaded
    player.autostart = true;

}

function initGraphics() {
    const app = new PIXI.Application({
        antialias: true,
        resizeTo: window
    });
    document.body.appendChild(app.view);

    // let's create a moving shape
    const thing = new PIXI.Graphics();
    const thingTwo = new PIXI.Graphics();
    app.stage.addChild(thing);
    app.stage.addChild(thingTwo);

    let count = 0;

    const blurFilter1 = new PIXI.filters.BlurFilter();
    const blurFilter2 = new PIXI.filters.BlurFilter();
    thing.filters = [blurFilter1];
    thingTwo.filters = [blurFilter2];
    blurFilter1.autoFit = false;
    blurFilter2.autoFit = false;

    const filter = new PIXI.filters.ColorMatrixFilter();
    filter.autoFit = false;

    app.stage.filters = [filter];

    thing.x = window.innerWidth * 0.5
    thing.y = window.innerHeight * 0.5

    thingTwo.x = window.innerWidth * 0.5
    thingTwo.y = window.innerHeight * 0.5


    thing.pivot.set(window.innerWidth * 0.5, window.innerHeight * 0.5);
    thingTwo.pivot.set(window.innerWidth * 0.5, window.innerHeight * 0.5);

    let countColour = 0;

    app.ticker.add(() => {
        if (toneStarted === true) {

            count += 0.1;

            blurFilter1.blur = 50 - Math.abs(lowMeter.getValue());
            blurFilter2.blur = 50 - Math.abs(highMeter.getValue());

            squiggles(thing, count);
            // rectHoles(thingTwo);

            const {
                matrix
            } = filter;

            if (highMeter.getValue() > -24) {
                countColour += 0.1;
                matrix[1] = Math.sin(countColour) * 3;
                matrix[2] = Math.cos(countColour);
                matrix[3] = Math.cos(countColour) * 1.5;
                matrix[4] = Math.sin(countColour / 3) * 2;
                matrix[5] = Math.sin(countColour / 2);
                matrix[6] = Math.sin(countColour / 4);
            }
        }
    });
}

function squiggles(graphics, count) {
    graphics.lineStyle(Math.abs(lowMeter.getValue()), Math.random() * 0xFFFFFF, scale(lowMeter.getValue(), 0, -60, 1, 10)*0.1);
    graphics.moveTo(Math.random() * 800, Math.random() * 600);
    graphics.bezierCurveTo(
        Math.random() * Math.abs(lowMeter.getValue()), Math.random() * window.innerWidth,
        Math.random() * Math.abs(lowMeter.getValue()), Math.random() * window.innerWidth,
        Math.random() * Math.abs(lowMeter.getValue()), Math.random() * window.innerWidth,
    );
    graphics.beginHole();
    graphics.bezierCurveTo(
        Math.random() * Math.abs(lowMeter.getValue()), Math.random() * window.innerWidth,
        Math.random() * Math.abs(lowMeter.getValue()), Math.random() * window.innerWidth,
        Math.random() * Math.abs(lowMeter.getValue()), Math.random() * window.innerWidth,
    );
    graphics.endHole();
    if (midMeter.getValue() > -24) {
        graphics.rotation = count * (lowMeter.getValue() * 0.0006);
        graphics.clear();
    }
}

function rectHoles(graphics) {
    graphics.lineStyle(Math.abs(lowMeter.getValue()), 0x00000, getRandomInt(0,10)*0.1);
    graphics.moveTo(window.innerWidth + midMeter.getValue(), window.innerHeight + lowMeter.getValue());
    graphics.lineTo(getRandomInt(100, window.innerWidth*0.5)*Math.PI, getRandomInt(100, window.innerWidth*0.5)*Math.PI);
    graphics.beginHole();
    graphics.lineTo(getRandomInt(100, window.innerWidth*0.5)*Math.PI, getRandomInt(100, window.innerWidth*0.5)*Math.PI);
    graphics.endHole();
    graphics.closePath();

    if (midMeter.getValue() > -24) {
        graphics.clear();
        graphics.rotation = Math.sin(midMeter.getValue());
    }
}