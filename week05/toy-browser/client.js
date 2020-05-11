const net = require('net')

class Request {
    constructor(options) {
        this.method = options.method || 'GET'
        this.host = options.host
        this.path = options.path || '/'
        this.port = options.port || 80
        this.body = options.body || {}
        this.headers = options.headers || {}
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }
        if (this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body)
        } else if (this.headers['Content-Type'] = 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
        }
        this.headers['Content-Length'] = this.bodyText.length
    }
    // 构建请求头时要注意格式
    toString() {
        return `${this.method} / HTTP/1.1\r\nHost: 127.0.0.1\r\n${Object.keys(
          this.headers,
        )
          .map((key) => `${key}: ${this.headers[key]}`)
          .join('\r\n')}\r\n\r\n${this.bodyText}\r\n`;
      }
    send(connection) {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser()
            if (connection) {
                connection.write(this.toString())
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString())
                })
            }
            // data事件触发条件：1.buffer满了 2. 服务端收到一个ip包
            // body很大，会分为多个data发送(流式数据所有该回调函数触发次数未知)
            connection.on('data', data => {
                parser.receive(data.toString())
                if (parser.isFinished) {
                    // console.log('^^^^', parser.response)
                    resolve(parser.response)
                }
                // console.log(parser.headers)
                // resolve(data.toString())
                connection.end()
            })
            connection.on('error', error => {
                reject(error)
                connection.end()
            })
        }) 
    }
}

class Response {

}

/**
 * 格式： 响应行 + 响应头 + 响应体
 * 其中响应体根据Transfer-Encoding判断body解析方式-状态机
 */
class ResponseParser {
    constructor() {
       this.WAITING_STATUS_LINE = 0
       this.WAITING_STATUS_LINE_END = 1
       this.WAITING_HEADER_NAME = 2
       this.WAITING_HEADER_SPACE = 3
       this.WAITING_HEADER_VALUE = 4
       this.WAITING_HEADER_LINE_END = 5
       this.WAITING_HEADER_BLOCK_END = 6
       this.WAITING_BODY = 7

       this.current = this.WAITING_STATUS_LINE
       this.statusLine = ''
       this.headers = {}
       this.headerName = ''
       this.headerValue = ''
       this.bodyParser = null
    }
    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished
    }
    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\S\s]+)/);
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }
    receive (string) {
        for (let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i))
        }
    }
    receiveChar(char) {
        if (this.current === this.WAITING_STATUS_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_STATUS_LINE_END
            } else {
                this.statusLine += char
            }
        } else if (this.current === this.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME
            }
        } else if (this.current === this.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.current = this.WAITING_HEADER_SPACE
            } else if (char === '\r') {
                this.current = this.WAITING_HEADER_BLOCK_END
                if (this.headers['Transfer-Encoding'] === 'chunked') {
                    this.bodyParser = new TrunkedBodyParser()
                }
            } else {
                this.headerName += char
            }
        } else if (this.current === this.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.current = this.WAITING_HEADER_VALUE
            }
        } else if (this.current === this.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.current = this.WAITING_HEADER_LINE_END
                this.headers[this.headerName] = this.headerValue
                this.headerName = ''
                this.headerValue = ''
            } else {
                this.headerValue += char
            }
        } else if (this.current === this.WAITING_HEADER_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME
            }
        } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
            if (char === '\n') {
                this.current = this.WAITING_BODY
            }
        } else if (this.current === this.WAITING_BODY) {
            this.bodyParser.receiveChar(char)
        }
    }
}

class TrunkedBodyParser {
    constructor() {
       this.WAITING_LENGTH = 0
       this.WAITING_LENGTH_LINE_END = 1
       this.READING_THUNK = 2
       this.WAITING_NEW_LINE = 3
       this.WAITING_NEW_LINE_END = 4
       this.isFinished = false
       this.length = 0
       this.content = []

       this.current = this.WAITING_LENGTH
    }
    /**
     * @param {*} 
     *  "2"
        "\r"
        "\n"
        "o"
        "k"
        "\r"
        "\n"
        "0"  不用管后面的
        "\r"
        "\n"
        "\r"
        "\n"
     */
    receiveChar (char) {
        // 读chunk长度
        if (this.current === this.WAITING_LENGTH) {
            if (char === '\r') {
                if (this.length === 0) {
                    console.log('/////', this.content)
                    this.isFinished = true
                }
                this.current = this.WAITING_LENGTH_LINE_END
            } else {
                this.length *= 10
                this.length += char.charCodeAt(0) - '0'.charCodeAt(0)
            }
        } else if (this.current === this.WAITING_LENGTH_LINE_END) {
            if (char === '\n') {
                this.current = this.READING_THUNK
            }
        } else if (this.current === this.READING_THUNK) { // 读完所有chunk
            this.content.push(char)
            this.length--
            if (this.length === 0) {
                this.current = this.WAITING_NEW_LINE
            }
        } else if (this.current === this.WAITING_NEW_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_NEW_LINE_END
            }
        } else if (this.current === this.WAITING_NEW_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_LENGTH
            }
        } 
    }
}


void async function () {
    let request = new Request({
        method: 'GET',
        path: '/',
        host: '127.0.0.1',
        port: 8088,
        headers: {
            ['x-foo2']: 'custom'
        },
        body: {
            test: 1
        }
    })

    let response = await request.send()
    console.log(response)
    // request.write(request.toString())
}()