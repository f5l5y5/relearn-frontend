const css = require('css') // 处理css内容
const EOF = Symbol('EOF') // end of line 结束状态
const layout = require('./layout.js')

let currentToken = null // 当前的token
let currentAttribute = null // 当前属性
let currentTextNode = null // 文本节点
let rules = [] // css规则
/** 添加css规则 */
function addCSSRules(text) {
	let ast = css.parse(text)
	console.log('打印***ast', JSON.stringify(ast, null, '      '))
	rules.push(...ast.stylesheet.rules)
}

/** 处理选择器优先级 */
function specificity(selector) {
	let p = [0, 0, 0, 0]
	let selectorParts = selector.split(" ")
	for (let part of selectorParts) {
		if (part.charAt(0) === '#') {
			p[1]+=1
		}else if (part.charAt(0) === '.') {
			p[2]+=1
		} else {
			p[3]+=1
		}
	}
	return p
}

/** 比较选择器优先级 */
function compare(sp1, sp2) {
	if (sp1[0] - sp2[0]) {
		return sp1[0]-sp2[0]
	}
	if (sp1[1] - sp2[1]) {
		return sp1[1]-sp2[1]
	}
	if (sp1[2] - sp2[2]) {
		return sp1[2]-sp2[2]
	}
	return sp1[3] - sp2[3]
}




/** 匹配函数 . # tagName */
function match(element, selector) {
	if (!selector || !element.attributes) {
		return false
	}
	if (selector.charAt(0) === '#') {
		let attr = element.attributes.filter(attr => attr.name === 'id')[0]
		if (attr && attr.value === selector.replace('#', '')) {
			return true
		}
	}else if (selector.charAt(0) === '.') {
		let attr = element.attributes.filter(attr => attr.name === 'class')[0]
		if (attr && attr.value === selector.replace('.', '')) {
			return true
		}
	} else {
		if (element.tagName === selector) {
			return true
		}
	}

	return false
}

/** 计算css */
function computeCSS(element) {
	let elements = stack.slice().reverse() // 获取父元素 避免污染，reverse是要在父元素找
	// 判断是否有
	if (!element.computedStyle) {
		element.computedStyle = {}
	}

	for (let rule of rules) {
		let selectorParts = rule.selectors[0].split(' ').reverse() // 找到最后面的选择器进行匹配

		if (!match(element, selectorParts[0])) continue

		let matched = false

		let j = 1 // 选择器的位置   [div img #myid] [{element}]
		for (let i = 0; i < elements.length; i++) {
			if (match(elements[i], selectorParts[i])) {
				j++
			}
		}

		if (j >= selectorParts.length) {
			matched = true
		}

		if (matched) {
			let sp = specificity(rule.selectors[0])

			// 如果匹配上 假如
			let computedStyle = element.computedStyle

			for (const declaration of rule.declarations) {
				if (!computedStyle[declaration.property]) {
					computedStyle[declaration.property] = {}
				}
				// 比较specificity 
				if (!computedStyle[declaration.property].specificity) {
					computedStyle[declaration.property].value = declaration.value
					computedStyle[declaration.property].specificity = sp
					
				} else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
					// 旧的更小，新的需要覆盖
						computedStyle[declaration.property].value = declaration.value
						computedStyle[declaration.property].specificity = sp
				}

			}
			console.log('打印***computedStyle',computedStyle)
		}
	}
}

/** 收集构造token token构建dom  */
let stack = [{ type: 'document', children: [] }]

/** 思路是：使用栈，遇到开始标签入栈，遇到结束标签出栈，让元素放入stack的dom中 */
function emit(token) {
	let top = stack[stack.length - 1] // 取出栈顶元素
	// {type: "startTag",tagName: "html",lang: "en"}
	if (token.type === 'startTag') {
		let element = {
			type: 'element',
			children: [],
			attributes: []
		}
		element.tagName = token.tagName
		// 将type和tagName的属性去除，其余的为属性
		for (let p in token) {
			if (p !== 'type' && p !== 'tagName') {
				element.attributes.push({
					name: p,
					value: token[p]
				})
			}
		}

		// 在startTag时计算css
		computeCSS(element)

		top.children.push(element)
		// element.parent = top
		if (!token.isSelfClosing) {
			stack.push(element)
		}
		currentTextNode = null
	} else if (token.type === 'endTag') {
		if (top.tagName !== token.tagName) {
			throw new Error("Tag start end doesn't match")
		} else {
			/** ============    style结束标签，执行添加css规则的操作  ===================== */
			if (top.tagName === 'style') {
				addCSSRules(top.children[0].content)
			}

			stack.pop()
		}
		currentTextNode = null
	} else if (token.type === 'text') {
		if (currentTextNode === null) {
			currentTextNode = {
				type: 'text',
				content: ''
			}
			top.children.push(currentTextNode)
		}
		currentTextNode.content += token.content
	}
	console.log(token)
}

// <!DOCTYPE html> <html lang="en">
/** 开始处理标签 */
function data(c) {
	if (c === '<') {
		return tagOpen
	} else if (c === EOF) {
		emit({
			type: 'EOF'
		})
	} else {
		emit({
			type: 'text',
			content: c
		})
		return data // 文本节点
	}
}

function tagOpen(c) {
	if (c === '/') {
		return endTagOpen
	} else if (c.match(/^[a-zA-Z]$/)) {
		currentToken = {
			type: 'startTag',
			tagName: ''
		}
		return tagName(c)
	} else {
		emit({
			type: 'text',
			content: c
		})
	}
}

function endTagOpen(c) {
	if (c.match(/^[a-zA-Z]$/)) {
		currentToken = {
			type: 'endTag',
			tagName: ''
		}
		return tagName(c)
	} else if (c === '>') {
	} else if (c === EOF) {
	} else {
	}
}

function tagName(c) {
	// <html name=1 属性
	if (c.match(/^[\t\n\f ]$/)) {
		return beforeAttributeName
	} else if (c === '/') {
		return selfClosingStartTag
	} else if (c.match(/^[a-zA-Z]$/)) {
		currentToken.tagName += c
		return tagName
	} else if (c === '>') {
		emit(currentToken)
		return data // 普通开始标签
	} else {
		currentToken.tagName += c
		return tagName
	}
}

/** 处理属性 <html lang="en"> */
function beforeAttributeName(c) {
	if (c.match(/^[\t\n\f ]$/)) {
		return beforeAttributeName
	} else if (c === '>' || c === '/' || c === EOF) {
		return afterAttributeName(c)
	} else if (c === '=') {
	} else {
		currentAttribute = {
			name: '',
			value: ''
		}
		return attributeName(c)
	}
}

function attributeName(c) {
	if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
		return afterAttributeName(c)
	} else if (c === '=') {
		return beforeAttributeValue
	} else if (c === '\u0000') {
	} else if (c === '"' || c === "'" || c === '<') {
	} else {
		currentAttribute.name += c
		return attributeName
	}
}

function beforeAttributeValue(c) {
	if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
		return beforeAttributeValue
	} else if (c === '"') {
		return doubleQuotedAttributeValue
	} else if (c === "'") {
		return singleQuotedAttributeValue
	} else if (c === '>') {
		// return data
	} else {
		return UnQuotedAttributeValue(c)
	}
}

function doubleQuotedAttributeValue(c) {
	if (c === '"') {
		currentToken[currentAttribute.name] = currentAttribute.value
		return afterQuotedAttributeValue
	} else if (c === '\u0000') {
	} else if (c === EOF) {
	} else {
		currentAttribute.value += c
		return doubleQuotedAttributeValue
	}
}

function singleQuotedAttributeValue(c) {
	if (c === "'") {
		currentToken[currentAttribute.name] = currentAttribute.value
		return afterQuotedAttributeValue
	} else if (c === '\u0000') {
	} else if (c === EOF) {
	} else {
		currentAttribute.value += c
		return singleQuotedAttributeValue
	}
}

function UnQuotedAttributeValue(c) {
	if (c.match(/^[\t\n\f ]$/)) {
		currentToken[currentAttribute.name] = currentAttribute.value
		return beforeAttributeName
	} else if (c === '/') {
		currentToken[currentAttribute.name] = currentAttribute.value
		return selfClosingStartTag
	} else if (c === '>') {
		currentToken[currentAttribute.name] = currentAttribute.value
		emit(currentToken)
		return data
	} else if (c === '\u0000') {
	} else if (c === '"' || c === "'" || c === '<' || c === '=' || c === '`') {
	} else if (c === EOF) {
	} else {
		currentAttribute.value += c
		return UnQuotedAttributeValue
	}
}

function afterQuotedAttributeValue(c) {
	if (c.match(/^[\t\n\f ]$/)) {
		return beforeAttributeName
	} else if (c === '/') {
		return selfClosingStartTag
	} else if (c === '>') {
		currentToken[currentAttribute.name] = currentAttribute.value
		emit(currentToken)
		return data
	} else if (c === EOF) {
	} else {
		currentAttribute.value += c
		return doubleQuotedAttributeValue
	}
}

function afterAttributeName(c) {
	if (c.match(/^[\t\n\f ]$/)) {
		return afterAttributeName
	} else if (c === '/') {
		return selfClosingStartTag
	} else if (c === '=') {
		return beforeAttributeValue
	} else if (c === '>') {
		currentToken[currentAttribute.name] = currentAttribute.value
		emit(currentToken)
		return data
	} else if (c === EOF) {
	} else {
		currentToken[currentAttribute.name] = currentToken.value
		currentAttribute = {
			name: '',
			value: ''
		}
		return attributeName(c)
	}
}

function selfClosingStartTag(c) {
	if (c === '>') {
		currentToken.isSelfClosing = true
		emit(currentToken)
		return data
	} else if (c === 'EOF') {
	} else {
	}
}

module.exports.parseHTML = function parseHTML(html) {
	let state = data
	for (let c of html) {
		state = state(c)
	}
	state = state(EOF)
	console.log('html', html)
	console.log(stack)
	return stack[0]
}
