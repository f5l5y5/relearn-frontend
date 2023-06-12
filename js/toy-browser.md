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