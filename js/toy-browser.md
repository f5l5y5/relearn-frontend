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

### 1. 实现一个http请求

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

4. responseParser的解析
- 分段构造需要用ResponseParser装配
- 分段处理ResponseText 用状态机分析文本结构
5. BodyParser总结
- Response的body可能根据Content-Type有不同的结构，因此需要采用子parser结构解决问题
- TrunkedBodyParser，使用同样的状态机处理body格式

### 2. HTML解析
[html状态机](https://html.spec.whatwg.org/multipage/parsing.html#rcdata-state)

1. 文件拆分 

- parser.js 接受html文本作为参数。 
- 生成dom树


2. FSM实现HTML分析
词法、语法解析
- FSM 实现html分析
- html标准中，已经规定了html状态
- 完成最简单版本

3. 解析标签
- 开始标签 结束标签 自闭合标签
- 忽略所有属性

4. 创建元素
- 除了状态迁移 添加业务逻辑
- 标签结束状态提交标签token
  

5. 处理属性
- 单引号 双引号 无引号 
- 处理属性和标签类似

6. 用token构建DOM树
- 使用栈，
- 遇到开始标签入栈，遇到结束标签出栈，让元素放入stack的dom中，知道栈是空为止
7. 文本节点加入DOM树
- 文本节点与自封闭标签处理类似
- 多个文本节点需要合并


### 3. css计算
得到css信息，只解析style标签
使用 css库生成ast 

1. 收集css规则
- 遇到style标签保存css规则
- 调用css Parser分析css规则
- 查看ast结构组成


2. 添加调用
尽量保证所有选择器在startTag时就能匹配什么规则

- 创建一个元素，立即计算css
- 分析一个元素，所有css规则已经收集完毕
- 真实浏览器，遇到写在body的style标签，需要重新css计算情况，这里忽略

3. 获取父元素序列
- 在computeCSS函数中，我们必须知道父元素才能判断元素与规则是否匹配
- 获取本元素的所有父元素
- 我们首先获取的是`当前元素`,我们获得和计算父元素匹配的顺序是从内向外

例如：div(不知道是谁) div #myId(一定是当前元素)

4. 处理元素和选择器匹配问题

处理简单选择器 
- 选择器也需要向外排列
- 复杂选择器拆成针对单个元素的选择器，用循环匹配父元素队列

5. 选择器与元素选择器匹配

- 根据选择器的类型和元素属性 计算是否与当前元素匹配
- 仅仅实现三种基本选择器

6. 计算属性生成

- 一旦选择匹配 应用选择器到元素上，形成computedStyle

7. 选择器优先级处理specificity
四元组
[0       0        0           0 ]
style    id     class        tagName

- css规则根据specificity和后来优先覆盖
- specificity是一个四元组 左边权限高
- -个css规则的specificity根据包含的简单选择器相加而成

### 4. layout排版

主轴 副轴
flex-direction：row
Main: width x left right
Cross: height y top bottom

flex-direction：column
Cross: width x left right
Main: height y top bottom

1. 准备工作
- direction wrap 的工作抽象

2. 收集元素进`行`

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/482e1362a4604f02a503a492841b2053~tplv-k3u1fbpfcp-watermark.image?)


### 渲染

1. 环境
- 图形环境
- npm i images

2. 渲染
- 递归调用子元素绘制方法完成dom树绘制
- 忽略不需要绘制的节点

