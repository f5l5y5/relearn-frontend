const EOF = Symbol('EOF') // end of line 结束状态


let currentToken = null // 当前的token
let currentAttribute = null // 当前属性
let currentTextNode = null // 文本节点


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
			content:c
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
