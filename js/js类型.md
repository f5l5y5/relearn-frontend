# Atom 原子
1. Grammar
   Literal Variable Keywords Whitespace Line Terminator
2. Runtime
   Types 、 Execution Context

## 类型 types
- Number
- String
- Boolean
- Object
- Null
- Undefined
- Symbol
- BigInt

赋值尽量使用null，不用undefined

## Number
[双浮点数](https://www.h-schmidt.net/FloatConverter/IEEE754.html)

浮点数 点可以来回运动  2^53
IEEE 754 Double Float
 - Sign(1) 符号位
 - Exponent (11) 指数
 - Fraction(52) 精度
  
0.1 转换成 二进制  3次转换和一次计算

### 表示方法
DecimalLiteral
- 0
- .2
- 0.
- 1e3
- 1000_000_000
BinaryIntegerLiteral
- 0b110
Octal
- 0o10
Hex
- 0xff
案例：
- 0.toString() 不行 0 .toString() 加空格
- 12 .toString(2 4 8 16 ) 转换成对应的进制

## String
Character 字符 ===  Code Point 码点 ===  Encoding 编码
   a                97           01100001
ASCll 只有 127个
Unicode 全世界字符集合 基于两个字节 0000-FFFF
GB
   - GB2312
   - GBK
   - GB18030 所有国标
ISO-8859
BIG5
语言不能混用，字符重合

### Encoding
UTF8 2个字节 1个字节一个字符
UTF8 4个字节 

### Grammar
“abc” 'abc' `abc` ==>  "\"abc\"" 

### Template
`ab${x}abc${y}abc` ==> 
- `ab${
- }abc${
- }abc`

## Boolean
- true
- false

## Null Undefined

- Null 关键字
- undefined 变量 -> void 0 任意编程undefined

## Object、Symbol
state 状态 identifier标识  behavior行为

Class Prototype

## Object in js
key  -> value
Symbol String -> Data Accessor
- key:symbol只能通过变量去读取
- value
  - Data 数据属性 [[value]] writable enumerable configurable
  - Accessor 访问器属性 get set enumerable configurable  -> 影响Object.keys等属性

### Object API/Grammar
- {} [] Object.defineProperty
- Object.create/setPrototypeOf/ getPrototypeOf
- new/class/extends
- new/function/prototype
### Function Object
[[call]] 行为  f() 调用会访问[[call]]
### Host Object
如 window对象 [[construct]] 访问不到，运行时会访问到

## Atom 

### Grammar
- Grammar tree vs Priority

* \+ - 
* \* / 
* ()

#### Expressions
- Member
  - a.b
  - a[b]
  - foo`string` 调用传入的是数组 ["1"]
  - super.b
  - super['b']
  - new.target
  - new Foo()  因为 new a()()
- New
  - new Foo  因为 new new a() -> new (new a())

- Reference
  - Object
  - Key
  - delete
  - assign

- Call
  - foo()
  - super()
  - foo()['b']
  - foo().b
  - foo()`abc`   new a()['b']->new a() -> ['b']

- Left hand side & Right hand side 
  - a.b = c 左值 能不能放在等号的左边
  - a + b = c
- Update
  - a++
  - a--
  - --a
  - ++a
例如： ++a++  ++(a++)
- Unary 单目 一元
  - delete a.b
  - void foo()
  - typeof a
  - \+ a
  - \-a
  - ~a
  - !a
  - await a
- Exponental 
  - ** 右结合 2**1**2  -> 2**(1**2)
- Multiplicative
  - .*/%
- Additive
  - \+ \-
- Shift
  - \>> << >>>
- Relationship
  - < > >= <= instanceof in
- Equality
  - ==
  - !=
  - ===
  - !==
- Bitwise
  - & ^ |
- Logical
  - &&
  - ||
- Conditional
  - ?:

### Runtime
- Type Conversion
  - a+b
  - "false"===false
  - a[o] = 1
转换规则

|-|-|
|12|123|
  
- Reference




