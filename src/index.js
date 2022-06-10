import * as Tone from 'tone'
import * as PIXI from 'pixi.js'
import './main.css'
import './usefulFunctions'
import {
    getRandomInt
} from './usefulFunctions';

// variables
let toneStarted = false;
let lowMeter, highMeter, mic;

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
    mic = new Tone.UserMedia();
    // mic.open();
    // connect mic to the meter
    // mic.connect(lowPass);
    lowPass.connect(lowMeter);
    // the current level of the mic

    const highPass = new Tone.Filter(5000, "highpass");
    highMeter = new Tone.Meter();
    // connect mic to the meter
    // mic.connect(highPass);
    highPass.connect(highMeter);
    // the current level of the mic

    const player = new Tone.Player("/media/WarezHouse.mp3").connect(highPass).connect(lowPass).toDestination();
    // play as soon as the buffer is loaded
    player.autostart = true;

}

function initGraphics() {
    const app = new PIXI.Application({
        antialias: true,
        resizeTo: window
    });
    document.body.appendChild(app.view);

    app.stage.interactive = true;

    // let's create a moving shape
    const thing = new PIXI.Graphics();
    app.stage.addChild(thing);


    let count = 0;

    const blurFilter1 = new PIXI.filters.BlurFilter();
    thing.filters = [blurFilter1];

    const filter = new PIXI.filters.ColorMatrixFilter();
    filter.autoFit = false;

    app.stage.filters = [filter];


    // Just click on the stage to draw random lines
    window.app = app;

    let countColour = 0;

    app.ticker.add(() => {
        if (toneStarted === true) {
            thing.x = (window.innerWidth * 0.5);
            thing.y = (window.innerHeight * 0.5);
            count += 0.1;

            blurFilter1.blur = 50 - Math.abs(lowMeter.getValue());

            thing.lineStyle(Math.random() * 30, Math.random() * 0xFFFFFF, 1);
            thing.moveTo(Math.random() * 800, Math.random() * 600);
            thing.bezierCurveTo(
                Math.random() * 200, Math.random() * 600,
                Math.random() * 200, Math.random() * 600,
                Math.random() * 200, Math.random() * 800,
            );



            const {
                matrix
            } = filter;

            if (highMeter.getValue() > -24) {
                thing.x =  (Math.abs(highMeter.getValue()) * 0.001);
                thing.y =  (Math.abs(highMeter.getValue()) * 0.001);
                thing.rotation = count * (lowMeter.getValue() * 0.0006);
                countColour += 0.1;
                matrix[1] = Math.sin(countColour) * 3;
                matrix[2] = Math.cos(countColour);
                matrix[3] = Math.cos(countColour) * 1.5;
                matrix[4] = Math.sin(countColour / 3) * 2;
                matrix[5] = Math.sin(countColour / 2);
                matrix[6] = Math.sin(countColour / 4);
                thing.clear();
            }
        }
    });
}