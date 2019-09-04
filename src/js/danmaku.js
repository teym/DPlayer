import utils from './utils';
import { CommentManager } from './lib/CommentCoreLibrary';
import { DanmuFormat } from './lib/CommentParser';

const parser = new DanmuFormat.JSONParser();

class Danmaku {
    constructor(options) {
        this.options = options;
        this.container = this.options.container;
        this.events = this.options.events;
        this.danma = new CommentManager(this.container);
        this.danma.options.global.opacity = this.options.opacity;
        this.danma.init('css');
        this.load();
    }

    load() {
        this.events && this.events.trigger('danmaku_load_start', []);
        const onLoad = (array) => {
            this.danma.load(array.map((i) => parser.parseOne(i)));
            this.events && this.events.trigger('danmaku_load_end');
            this.options.callback && this.options.callback();
        }

        this.options.apiBackend.read({
            url: this.options.api.address,
            id: this.options.api.id,
            success: (data) => {
                onLoad(data);
            },
            error: (msg) => {
                onLoad([]);
                this.options.error(msg);
            },
        });
    }

    reload(newAPI) {
        this.options.api = newAPI;
        this.dan = [];
        this.clear();
        this.load();
    }

    send(dan, callback) {
        const danma = parser.buildBase(dan);
        this.options.apiBackend.send({
            url: this.options.api.address,
            id: this.options.api.id,
            token: this.options.api.token,
            data: Object.assign(
                { t: this.options.api.id, h: null, f: danma.stime },
                parser.encode(danma)
            ),
            success: callback,
            error: (msg) => {
                this.options.error(msg || this.options.tran('Danmaku send failed'));
            },
        });
        danma.stime += 200;
        this.danma.send(danma);

        this.events && this.events.trigger('danmaku_send', danma);
    }

    frame() {
        this.danma.time(this.options.time());
    }

    opacity(percentage) {
        if (percentage !== undefined) {
            this.danma.options.global.opacity = percentage;
            this.events && this.events.trigger('danmaku_opacity', this.danma.options.global.opacity);
        }
        return this.danma.options.global.opacity;
    }

    play() {
        this.danma.start();
    }

    pause() {
        this.danma.stop();
    }

    seek() {
        this.danma.seek(this.options.time());
    }

    clear() {
        this.danma.clear();

        this.events && this.events.trigger('danmaku_clear');
    }

    htmlEncode(str) {
        return str.
            replace(/&/g, '&amp;').
            replace(/</g, '&lt;').
            replace(/>/g, '&gt;').
            replace(/"/g, '&quot;').
            replace(/'/g, '&#x27;').
            replace(/\//g, '&#x2f;');
    }

    resize(video) {
        const {width, height} = video;
        const danWidth = this.container.parentNode.offsetWidth;
        const danHeight = this.container.parentNode.offsetHeight;
        const size = height > 720 ? 1080 : 720;
        this.container.style.width = Math.floor(danWidth / danHeight * 720) + 'px';
        this.container.style.height = size + 'px';
        this.container.style.transform = 'scale('+ (danHeight / size).toFixed(4) +')';
        this.danma.setBounds();
        console.log('resize',danWidth, danHeight, Math.floor(danWidth / danHeight * 720), size, (danHeight / size).toFixed(4));
    }

    rate(rate) {
        this.danma.options.global.scale = (1 / rate).toFixed(4);
    }

    hide() {
        this.pause();

        this.events && this.events.trigger('danmaku_hide');
    }

    show() {
        this.seek(this.options.time());
        this.play();

        this.events && this.events.trigger('danmaku_show');
    }
}

export default Danmaku;
