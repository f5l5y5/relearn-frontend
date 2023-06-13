const EOF = Symbol("EOF") // end of line


// <!DOCTYPE html> <html lang="en">
/** 开始处理标签 */
function data(c) {
    if(c==='<'){
        return tagOpen
    }else if(c===EOF){
        return
    }else{
        return data // 文本节点
    }
}


function tagOpen(c) {
	if (c === '/') {
		return endTagOpen
	} else if (c.match(/^[a-zA-Z]$/)) {
		return tagName(c)
	} else {
		return 
	}
}

function endTagOpen(c) {
	if (c.match(/^[a-zA-Z]$/)) {
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
		return tagName
	} else if (c === '>') { 
		return data // 普通开始标签
	} else {
		return tagName
	}
}


function beforeAttributeName(c) {
		if (c.match(/^[\t\n\f ]$/)) {
			return beforeAttributeName
		} else if (c === '>') {
			return data
		} else if (c === '=') {
			return beforeAttributeName
		} else {
			return beforeAttributeName
		}
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