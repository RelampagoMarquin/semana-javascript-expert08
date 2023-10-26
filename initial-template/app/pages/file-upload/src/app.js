import Clock from './deps/clock.js';
import View from './view.js';

let took = ''
const view = new View()
const clock = new Clock()
const worker = new Worker('./src/worker/worker.js', {type: 'module'})

worker.onmessage = ({ data }) => {
    if(data.status !== 'done') return;
    clock.stop()
    view.updateElapsedTime(`Process took ${took.replace('ago', '')}`)
}

worker.onerror = (error) => {
    console.error('error worker', error)
}

view.configureOnFileChange(file => {
    const canvas = view.getCanvas()
    worker.postMessage({
        file,
        canvas
    }, [ 
        canvas
    ])
    clock.start((time) => {
        took = time;
        view.updateElapsedTime(`Process started ${time}`)
    })
})

// commentar quando sair do ambiente de dev
async function fakefecth(){
    const filePath = '/videos/frag_bunny.mp4'
    const res = await fetch(filePath)

    const file = new File([await res.blob()], filePath, {
        type: 'video.mp4',
        lastModified: Date.now()
    })
    const event = new Event('change')
    Reflect.defineProperty(
        event,
        'target',
        {value: { files: [file]}}
    )
    document.getElementById('fileUpload').dispatchEvent(event)
}

fakefecth()

