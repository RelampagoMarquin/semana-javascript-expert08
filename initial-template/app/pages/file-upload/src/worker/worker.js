import VideoProcessor from "./videoProcessor.js"
import MP4Demuxer from "./mp4Demuxer.js"
import CanvasRender from "./canvasRender.js"

const qvgaConst = {
    width: 320,
    height: 240
}

const vgaConst = {
    width: 640,
    height: 480
}

const hdConst = {
    width: 1280,
    height: 720
}

const encoderConfig = {
    ...qvgaConst,
    bitrate: 10e6,

    // WebM
    codec: 'vp09.00.10.08',
    pt: 4,
    hardwareAcceleration: 'prefer-software',

    // MP4
    // codec: 'avc1.42002A',
    // pt: 1,
    // hardwareAcceleration: 'prefer-hardware',
    // avc: { format: 'annexb' }
}

const mp4Demuxer = new MP4Demuxer()
const videoProcessor = new VideoProcessor({
    mp4Demuxer
})

onmessage = async ({ data }) => {
    const renderFrame = CanvasRender.getRenderer(data.canvas)
    await videoProcessor.start({
        file: data.file,
        renderFrame,
        encoderConfig,
        sendMessage(message){
            self.postMessage(message)
        }
    })

    self.postMessage({
        status: 'done'
    })
} 