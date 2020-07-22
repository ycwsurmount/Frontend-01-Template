export class TimeLine {
    constructor() {
        this.animations = []
        this.requestID = null
        // 添加状态是避免重复操作带来的问题
        this.state = 'init'
    }

    tick() {
        let t = Date.now() - this.startTime
        console.log(t)
        let animations = this.animations.filter(animation => !animation.finished)
        for (let animation of animations) {
            let { object, property, template, start, end, duration, delay, timingFun, addTime} = animation
            let progression = timingFun((t- delay - addTime)/duration) // 0-1之间的数
            // 中间些许误差可忽略，但保证最终结果要一致
            if (t > duration + delay + addTime) {
                progression = 1 
                animation.finished = true
            }
            // ***关键参数修改方法**
            let value = animation.valueFormProgression(progression)
            // value一般是数字，tempalte在此主要是转换作用
            object[property] = template(value)
        }
        if (animations.length) {
            this.requestID = requestAnimationFrame(() => this.tick())
        }
    }

    start() {
        if (this.state !== 'init') {
            return
        }
        this.state = 'playing'
        this.startTime = Date.now()
        this.tick()
    }

    pause() {
        if (this.state !== 'playing') {
            return
        }
        this.state = 'pause'
        // 恢复的时候用
        this.pauseTime = Date.now()
        cancelAnimationFrame(this.requestID)
    }

    resume() {
        if (this.state !== 'pause') {
            return
        }
        this.state = 'playing'
        // 当前时间 = 当前时间 - 已动作的时间
        this.startTime += Date.now() - this.pauseTime
        this.tick()
    }

    restart() {
        if (this.state === 'playing') {
            this.pause()
        }
        this.animations = []
        this.requestID = null
        this.state = 'init'
        this.startTime = Date.now()
        this.pauseTime = null
        this.tick()
    }
    // 两种场景：从现在开始|从0开始
    add(animation, addTime) {
        this.animations.push(animation)
        animation.finished = false
        if (this.state === 'playing') {
            animation.addTime = addTime !== void 0 ? addTime:  Date.now() - this.startTime
        } else {
            animation.addTime = addTime !== void 0 ? addTime :  0
        }
    }
}

export class Animation {
    constructor(object, property, start, end, duration, delay, timingFun, template) {
        this.object = object
        this.property = property
        this.template = template
        this.start = start
        this.end = end
        this.duration = duration
        this.delay = delay || 0
        this.timingFun = timingFun
    }

    valueFormProgression(progression) {
        return this.start + progression * (this.end - this.start)
    }

}

export class colorAnimation {
    constructor(object, property, start, end, duration, delay, timingFun, template) {
        this.object = object
        this.property = property
        this.template = template || (v => `rgba(${v.r}, ${v.g}, ${v.b}, ${v.a})`)
        this.start = start
        this.end = end
        this.duration = duration
        this.delay = delay || 0
        this.timingFun = timingFun
    }

    valueFormProgression(progression) {
        return {
            r: this.start.r + progression * (this.end.r - this.start.r),
            g: this.start.g + progression * (this.end.g - this.start.g),
            b: this.start.b + progression * (this.end.b - this.start.b),
            a: this.start.a + progression * (this.end.a - this.start.a)
        }
    }

}

/* 设计思路
timeline 和 animation这两个类，分别实现2个功能，一个是任务队列（时间线），另外就是动画。 timeline是若干animation进行操作。  timeline的必要性，方便管理animation实现暂停、执行、预加载、释放资源

let animation = new Animation(Object, property, start, end, duration, delay, timingFun)
let animation2 = new Animation(Object, property, start, end, duration, delay, timingFun)

let timeline = new Timeline // 处理多个动画
timeline.add(animation)
timeline.add(animation2)

timeline.start()
timeline.stop()
timeline.pause()
timeline.resume()

setTimeout
setInterval
requestAnimationFrame

*/