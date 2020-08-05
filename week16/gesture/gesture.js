let element = document.body

function enableGesture(element) {
   
    let contexts = Object.create(null)

    let MOUSE_SYMBOL = Symbol('mouse')
    if (document.ontouchstart !== null) {
        element.addEventListener('mousedown', (event) => {
            contexts[MOUSE_SYMBOL] = Object.create(null)
            start(event, contexts[MOUSE_SYMBOL])
            let mousemove = event => {
                move(event, contexts[MOUSE_SYMBOL])
            }
        
            let mouseend = event => {
                end(event, contexts[MOUSE_SYMBOL])
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseend)
            }
            document.addEventListener('mousemove', mousemove);
            document.addEventListener('mouseup', mouseend)
        })
    }

    element.addEventListener('touchstart', event => {
        for (let touch of event.changedTouches) {
            contexts[touch.identifier] = Object.create(null)
            start(touch, contexts[touch.identifier])
        }
    })

    element.addEventListener('touchmove', event => {
        for (let touch of event.changedTouches) {
            move(touch, contexts[touch.identifier])
        }
    })

    // 有且仅触发一个touchend，touchcancel
    element.addEventListener('touchend', event => {
        for (let touch of event.changedTouches) {
            end(touch, contexts[touch.identifier])
            delete contexts[touch.identifier]
        }
    })
    element.addEventListener('touchcancel', event => {
        for (let touch of event.changedTouches) {
            cancel(touch, contexts[touch.identifier])
            delete contexts[touch.identifier]
        }
    })

    // tap|pan-panstart,panmove,panend|flick|press-pressstart pressend

    let start = (point, context) => {
        context.startX = point.clientX, context.startY = point.clientY
        context.moves = []
        context.isTap = true;
        context.isPan = false;
        context.isPress = false;
        context.timeoutHandler = setTimeout(() => {
            if (context.isPan) {
                return
            }
            context.isTap = false;
            context.isPan = false;
            context.isPress = true;
            console.log('press start')
        }, 500)
    }

    let move = (point, context) => {
        let dx = point.clientX - context.startX
        let dy = point.clientY - context.startY
        if (dx ** 2 + dy ** 2 > 100 && !context.isPan) {
            context.isTap = false;
            context.isPan = true;
            context.isPress = false;
            console.log('pan start')
        }
        
        if (context.isPan) {
            context.moves.push({
                dx,dy,
                t:Date.now()
            })
            context.moves = context.moves.filter(record => Date.now() - record.t < 300)
            console.log('pan')
        }
    }

    let end = (point, context) => {
        if (context.isPan) {
            let dx = point.startX - context.startX
            let dy = point.clientY - context.startY
            let record = context.moves[0]
            let speed = Math.sqrt(((record.dx - dx) ** 2 + (record.dy - dy) ** 2) / (Date.now - record.t))
            if (speed > 2.5) {
                console.log('flick')
            }
            console.log('pan end')
        } 
        if (context.isTap) {
            element.dispatch
            console.log('tap')
        }
        if (context.isPress) {
            console.log('press end')
        }
        clearTimeout(context.timeoutHandler)
    }

    let cancel = (point, context) => {
        clearTimeout(context.timeoutHandler)
    }
}

enableGesture(element)
