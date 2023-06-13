const http = require('http')

http.createServer((request,response)=>{
    let body = []
    request.on('error',err=>{
        console.log(err)
    }).on('data',chunk=>{
        body.push(chunk.toString())
    }).on('end',()=>{
        // body = Buffer.concat(body).toString()
        console.log('body',body)
        response.writeHead(200,{'Content-Type':'text/html'})
        // response.end('hello,world\n')
			response.end(
				`<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
</head>
<body>
	<div>
		<img id="myId" />
		<img />
	</div>
</body>
</html>
			
`
			)
    })
}).listen(8088)

console.log('server started on http://localhost:8088')