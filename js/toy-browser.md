# 浏览器工作原理
写一个Toy-Browser

URL -HTTP-> 
HTML -parse-> 
DOM -css computing-> 
DOM with CSS -layout-> 
DOM with position -render-> 
Bitmap 

## 前置知识 有限状态机处理字符串

- 每一个状态都是一个机器
- 所有的机器接受的输入一致
- 本身无状态，纯函数
- 知道下一个状态
  - 每个机器有确定的下一个状态 （Moore）
  - 根据输入决定下一个状态（Mealy）

```js
// 每一个函数是一个状态
function state(input){ // 函数参数就是输入
    //函数内可以自由的处理每个状态的逻辑
    return next // 返回值作为下一个状态
}

while(input){
    // 状态机的返回值作为下一个状态
    state = state(input) 
}
```

### 案例

在一个字符串中找到字符串 ‘a’

```js
    function match(string) {
        for (let c of string) {
            if(c==='a'){
                return true
            }
            return false
        }
    }

```

在一个字符串中找到字符串 ‘ab’
```js
    function match(string) {
        let foundA = false
        for (let c of string) {
            if(c==='a'){
                return true
            }else if(foundA&& c==='b'){
                return true
            }else{
                foundA = false
            }
        }
        return  false
    }

```

在一个字符串中找到字符串 ‘abcdef’
```js
    function match(string) {
        let foundA = false
        for (let c of string) {
            if(c==='a'){
                return true
            }else if(foundA&& c==='b'){
                return true
            }else{
                foundA = false
            }
        }
        return  false
    }

```

### 使用状态机
```js
function match(string) {
    let state = start
    for (let c of string) {
        state = state(c)
    }
    return state === end
}

function start(c) {
    if (c === 'a') {
        return foundA
    } else {
        return start
    }
}

function foundA(c) {
    if (c === 'b') {
        return foundB
    } else {
        return start(c)
    }
}

function foundB(c) {
    if (c === 'c') {
        return foundC
    } else {
        return start(c)
    }
}

function foundC(c) {
    if (c === 'd') {
        return foundD
    } else {
        return start(c)
    }
}

function foundD(c) {
    if (c === 'e') {
        return foundE
    } else {
        return start(c)
    }
}

function foundE(c) {
    if (c === 'f') {
        return end
    } else {
        return start(c)
    }
}

function end(c) {
    return end
}

```

注意： 每一个 return start 需要改成 return start(c) ,因为 ·ababcdef·这种在第一个ab的后，会将下一个a的字符跳过处理
resume 

在一个字符串中找到字符串 ‘abcabx’

```js
function match(string) {
    let state = start
    for (let c of string) {
        state = state(c)
    }
    return state === end
}

function start(c){
    if(c==='a'){
        return foundA
    }else
    return start
}

function end() {
    return end
}

function foundA(c) {
    if(c==='b'){
        return foundB
    }else
        return start(c)
}

function foundB(c) {
    if (c==='c'){
        return foundC
    }else
        return start(c)
}

function foundC(c) {
    if(c==='a'){
        return foundA2
    }else
        return  start(c)
}

function foundA2(c) {
    if(c==='b'){
        return foundB2
    }else
        return start(c)
}
// 在ab需要判断是x还是c
function foundB2(c) {
    if(c==='x'){
        return end
    }else
        return foundB(c)
}


```


## HTTP 协议解析
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a0174d659cbe456aa898ee4f2d42afb2~tplv-k3u1fbpfcp-watermark.image?)
不能使用http包，使用net包

### TCP/IP基础

- 流
- 端口
- require('net)

- 包
- IP地址
- libnet/libpcap

### HTTP
- Request
- Response

## 实现过程

### 0环境搭建
\r \n 结尾

1. 实现一个http请求

- 设计一个请求类
- content-type content-length
- body
- 不同的content-type 影响body格式

2. send函数
- 在Request的构造器中收集必要的信息
- 设计一个send函数，发送到服务器

3. 发送请求
- 支持已有和新建的connection
- 收到数据传parser
- 根据parser状态resolve 

4. response的解析