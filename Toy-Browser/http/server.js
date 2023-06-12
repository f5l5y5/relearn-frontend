const http = require('http')

http.createServer((reqest,response)=>{
    let body = []
    request.on('error',err=>{
        console.log(error)
    }).on('data',chunk=>{
        body.push(chunk.toString())
    }).on('end',()=>{
        body = Buffer.concat(body).toString()
        console.log('body',body)
        response.writeHead(200,{'Content-Type':'application/x-www-form-urlencoded'})
        response.end('hello,world\n')

    })
}).listen(8088)

console.log('server started on http://localhost:8088')