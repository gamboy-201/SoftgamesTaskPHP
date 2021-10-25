namespace Tetris {
    export let style: object = {
        fontFamily: 'MS Courier New',
        fontSize: 48,
        fontStyle: '',
        fontWeight: 'bold',
        fill: ['#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 2,
        dropShadow: true,
        dropShadowColor: '#d4d4d4',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
    },
    styleMenu: object = {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: ['#ffffff'], // gradient
        fontWeight: 'bold'
    },
    styleMenuBtn: object = {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: ['#ffffff'], // gradient
        fontWeight: 'bold'
    },
    boxWidth:number=35,
    boxHeight:number=35,
    assetList:string[]= ["backgroundShader","backgroundStars","but_restart","buttonStock1d","but_exit","PlayBtn","emoticon1","emoticon2","particle","Sparks"],
    assetListSprite:string[]=["cards"],
    globalResources:any = {},
    particleJson:any = {
        "alpha": {
            "start": 1,
            "end": 1
        },
        "scale": {
            "start": 1.5,
            "end": 0.2,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": "#db8a21",
            "end": "#dec77c"
        },
        "speed": {
            "start": 200,
            "end": 50,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 180,
            "max": 360
        },
        "noRotation": false,
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 0.2,
            "max": 3
        },
        "blendMode": "normal",
        "frequency": 0.005,
        "emitterLifetime": -1,
        "maxParticles": 500,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "rect",
        "spawnRect": {
            "x": 0,
            "y": 0,
            "w": 100,
            "h": 100
        }
    },
    ticker = tickerShared;
}