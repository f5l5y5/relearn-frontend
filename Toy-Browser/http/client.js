const net = require('net')
const parser = require('./parser.js')

/** 初始化options请求参数 */
class Request {
    constructor(options) {
        this.method = options.method || 'GET'
        this.host = options.host
        this.port = options.port || '80'
        this.path = options.path || '/'
        this.body = options.body || {}
        this.headers = options.headers || {}
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }

        if (this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body)
        } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')

        }
        this.headers['Content-Length'] = this.bodyText.length
    }
/** 2.发送 */
    send(connection){
        return new Promise((resolve, reject)=>{
            // 初始化响应解析定义状态机
            const parser = new ResponseParser
            // 如果有则不创建，没有则创建
            if (connection){
                connection.write(this.toString())
            }else{
                connection = net.createConnection({
                    host:this.host,
                    port:this.port
                },()=>{
                    connection.write(this.toString())
                })
            }
            /** 接受服务端传递的数据 */
            connection.on('data',(data)=>{
                console.log('data',data.toString())
                parser.receive(data.toString())
                if(parser.isFinished){
                    resolve(parser.response)
                    connection.end()
                }
            })


            connection.on('error',(err)=>{
                reject(err)
                connection.end()
            })


        })
    }

    toString(){
        // return `${this.method} ${this.path} HTTP/1.1\r
        // ${Object.keys(this.headers).map(key=>`${key}: ${this.headers[key]}`).join('\r\n')}\r\r
        // ${this.bodyText}`
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r
\r
${Buffer.from(this.bodyText,'utf-8')}`
    }
}
/** 3. 响应解析 状态机 */
class ResponseParser{
    constructor() {
        // 定义状态机 常量if的写法
        this.WAITING_STATUS_LINE = 0 //  \r
        this.WAITING_STATUS_LINE_END = 1 // \n 两个状态\r\n
        this.WAITING_HEADER_NAME = 2
        this.WAITING_HEADER_SPACE = 3
        this.WAITING_HEADER_VALUE = 4
        this.WAITING_HEADER_LINE_END = 5
        this.WAITING_HEADER_BLOCK_END = 6
        this.WAITING_BODY = 7
        // 存储解析过程结果
        this.current = this.WAITING_STATUS_LINE // 当前状态 初始
        this.statusLine = "" // HTTP/1.1 200 OK
        this.headers = {} // 存储header
        this.headerName = ""
        this.headerValue = ""
        this.bodyParser = null
    }
    get isFinished(){
        return this.bodyParser&&this.bodyParser.isFinished
    }
/** 获取响应 */
    get response(){
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
        return {
            statusCode:RegExp.$1,
            statusText:RegExp.$2,
            headers:this.headers,
            body:this.bodyParser.content.join('')
        }
    }

    /** 接受处理不同的字符 */
    receive(string){
        for (let i =0;i<string.length;i++){
            this.receiveChar(string.charAt(i))// 找到字符
        }
    }
    // 有限状态机的实现
    receiveChar(char){
        if(this.current===this.WAITING_STATUS_LINE){
            if(char==='\r'){
                this.current = this.WAITING_STATUS_LINE_END
            }else{
                this.statusLine += char
            }
        }else if(this.current===this.WAITING_STATUS_LINE_END){
            if(char==='\n'){
                this.current = this.WAITING_HEADER_NAME
            }
        }else if(this.current===this.WAITING_HEADER_NAME){
            if(char===':'){
                this.current = this.WAITING_HEADER_SPACE
            }else if(char==='\r'){
                this.current = this.WAITING_HEADER_BLOCK_END
                // 找到所有的header时 取默认的值
                if(this.headers['Transfer-Encoding']==='chunked'){
                    this.bodyParser = new TrunkedBodyParser()
                }
            }else {
                this.headerName+= char
            }
        }else if(this.current===this.WAITING_HEADER_SPACE){
            if(char===' '){
                this.current= this.WAITING_HEADER_VALUE
            }
        }else if(this.current===this.WAITING_HEADER_VALUE){
            if(char==='\r'){
                this.current = this.WAITING_HEADER_LINE_END
                this.headers[this.headerName] = this.headerValue
                this.headerName = ""
                this.headerValue = ""
            }else{
                this.headerValue += char
            }
        }else if(this.current===this.WAITING_HEADER_LINE_END){
            if(char==='\n'){
                this.current = this.WAITING_HEADER_NAME
            }
        }else if(this.current===this.WAITING_HEADER_BLOCK_END){
            if(char==='\n'){
                this.current = this.WAITING_BODY
            }
        }else if(this.current === this.WAITING_BODY){
            console.log(char)
            this.bodyParser.receiveChar(char)
        }
    }
}

/** Transfer-Encoding为'chunked'处理 body */
class TrunkedBodyParser{
    constructor() {
        this.WAITING_LENGTH = 0
        this.WAITING_LENGTH_LINE_END = 1
        this.READING_TRUNK = 2 // 长度，进行计数，控制是否退出
        this.WAITING_NEW_LINE = 3
        this.WAITING_NEW_LINE_END = 4
        this.length = 0
        this.content = []
        this.isFinished = false
        this.current = this.WAITING_LENGTH
    }
    receiveChar(char){
        if (this.current===this.WAITING_LENGTH){
            if(char==='\r'){
                if(this.length===0){
                    this.isFinished = true
                }
                this.current = this.WAITING_LENGTH_LINE_END
            }else {
                this.length *= 16 // 是十六进制
                this.length += parseInt(char,16) //要解析的字符串和基数（即要解析的字符串表示的数字的进制）A 代表 10
            }
        }else if(this.current === this.WAITING_LENGTH_LINE_END){
            if(char==='\n'){
                this.current = this.READING_TRUNK
            }
        }else if(this.current===this.READING_TRUNK){
            // 读取字符，存储
            this.content.push(char)
            this.length--
            if(this.length===0){
                this.current=this.WAITING_NEW_LINE
            }
        }else if(this.current===this.WAITING_NEW_LINE){
            if(char==='\r'){
                this.current = this.WAITING_NEW_LINE_END
            }
        }else  if(this.current===this.WAITING_NEW_LINE_END){
            if(char==='\n'){
                this.current = this.WAITING_LENGTH
            }
        }
    }
}


/** 1，发起请求 */
void async function () {
    let request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        port: '8088',
        path: '/',
        headers: {
            ['X-Foo2']: "custom"
        },
        body: {
            name: 'jack',
            age: 18
        }
    })

    let response = await request.send()
    // 采用全部接受，应该是分段处理
    let dom = parser.parseHTML(response.body)
    // console.log(response)
}()