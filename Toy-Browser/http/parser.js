const EOF = Symbol("EOF") // end of line 结束状态
let currentToken = null // 存储当前的token 

/** 收集构造token  */
function emit(token) {
	console.log(token);
}


// <!DOCTYPE html> <html lang="en">
/** 开始处理标签 */
function data(c) {
    if(c==='<'){
        return tagOpen
		} else if (c === EOF) {
			emit({
				type:"EOF"
			})
        return
		} else {
			emit({
				type: 'text',
				content:c
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
			tagName:''
		}
		return tagName(c)
	} else {
		return 
	}
}

function endTagOpen(c) {
	if (c.match(/^[a-zA-Z]$/)) {
		currentToken = {
			tyep: 'endTag',
			tagName:''
		}
		return tagName(c)
	} else if (c === '>') {
		// 报错
	} else if (c === EOF) {
		// 报错
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
		return tagName
	}
}

/** 处理属性 <html lang="en"> */
function beforeAttributeName(c) {
		if (c.match(/^[\t\n\f ]$/)) {
			return beforeAttributeName
		} else if (c === '>'||c==='/'||c===EOF) {
			return afterAttributeName(c)
		} else if (c === '=') {
		
		} else {
			currentAttribute = {
				name: '',
				value:''
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
		
	} else if (c === "\"" || c === "'" || c === "<") {
		
	} else {
		currentAttribute.name += c
		return attributeName
	}
}

function beforeAttributeValue(c) {
	if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
		return beforeAttributeValue
	} else if (c === '\"') {
		return doubleQuotedAttributeValue
	} else if (c === '\'') {
		return singleQuotedAttributeValue
	} else if (c === '>') {
		// return data
	} else {
				return UnQuotedAttributeValue(c)
	}

}

function doubleQuotedAttributeValue(c) {
	if (c === "\"") {
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
		return doubleQuotedAttributeValue
	}
}

// todo 3:49   37
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
		
	}else if(c==="\""||c==="'"||c==="<")
}



function selfClosingStartTag(c) {
	if (c === '>') {
		currentToken.isSelfClosing = true
		return data
	} else if (c === 'EOF') {
		
	} else {
		
	}
}






module.exports.parseHTML = function parseHTML(html){
    let state =  data
    for (let c of html) {
        state = state(c)
    }
    state = state(EOF)
    console.log('html',html)
}