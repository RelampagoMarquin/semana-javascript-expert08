import { createFile } from '../deps/mp4box.0.5.2.js'

export default class MP4Demuxer {
    #onConfig
    #onChuck
    #file

    /**
     * 
     * @param {ReadableStream} stream
     * @param {object} options
     * @param {(config: object) = void} options.onConfig
     * 
     * @returns {Promise<void>}
     */
    async run(stream, {onConfig, onChuck}) {
        this.#onConfig = onConfig
        this.#onChuck = onChuck
        
        this.#file = createFile()

        this.#file.onReady = (args) => {
            debugger
        }

        this.#file.onError = (error) => console.error('Deu bronca no mp4Demuxer', error)

        return this.#init(stream)

    }

    /**
     * 
     * @param {ReadableStream} stream
     * @returns Promise<void>
     * 
     */
    #init(stream){
        const consumeFile = new WritableStream({
            write: (chuck) => {
                debugger
            },
            close: () => {
                debugger
            }
        })

        return stream.pipeTo(consumeFile)
    }
}