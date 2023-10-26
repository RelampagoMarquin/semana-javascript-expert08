import { DataStream, createFile } from '../deps/mp4box.0.5.2.js'

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

        this.#file.onReady = this.#onReady.bind(this)

        this.#file.onSamples = this.#onSamples.bind(this)

        this.#file.onError = (error) => console.error('Deu bronca no mp4Demuxer', error)

        return this.#init(stream)

    }

    #description(track){
        const trak = this.#file.getTrackById(track.id)
        for(const entry of trak.mdia.minf.stbl.stsd.entries) {
            const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C
            if(box){
                const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN)
                box.write(stream);
                return new Uint8Array(stream.buffer, 8)
            }
        }
        throw new Error("avcC, hvcC, vpcC, or av1C box not found")
    }

    #onSamples(trackId, ref, samples){
        for (const sample of samples){
            this.#onChuck(new EncodedVideoChunk({
                type: sample.is_sync ? "key" : "delta",
                timestamp: 1e6 * sample.cts / sample.timescale,
                duration: 1e6 * sample.duration / sample.timescale,
                data: sample.data
            }))
        }
        
    }

    #onReady(info){
        const [track] = info.videoTracks
        this.#onConfig({
            codec: track.codec,
            codedHeight: track.video.height,
            codedWidth: track.video.width,
            description: this.#description(track),
            durationSecs: info.duration / info.timescale,
        })
        this.#file.setExtractionOptions(track.id)
        this.#file.start()
    }

    /**
     * 
     * @param {ReadableStream} stream
     * @returns Promise<void>
     * 
     */
    #init(stream){
        let _offset = 0
        const consumeFile = new WritableStream({
            /** @param {Uint8Array} chuck */
            write: (chuck) => {
                const copy = chuck.buffer
                copy.fileStart = _offset
                this.#file.appendBuffer(copy)

                _offset += chuck.length
            },
            close: () => {
                this.#file.flush()
            }
        })

        return stream.pipeTo(consumeFile)
    }
}