const EOF = Symbol('EOF')
let currentToken = null

function emit(token) {
    console.log(token)
}

function data(c) {
    if (c == '<') {
        return tagOpen
    } else if (c == EOF) {
        emit({
            type: 'EOF'
        })
        return
    } else {
        emit({
            type: 'text',
            content: c
        })
        return data
    }
}

function tagOpen(c) {
    if (c == '/') {
        return endTagOpen
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagOpen: ''
        }
        return tagName(c)
    } else {
        emit({
            type: 'text',
            content: c
        })
        return
    }
}

function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: ''
        }
        return tagName(c)
    } else if (c == '>') {

    } else if (c == EOF) {

    } else {

    }
}

function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    } else if (c === '/') {
        return selfClosingStartTag
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c
        return tagName
    } else if (c == '>') {
        emit(currentToken)
        return data
    } else {
        currentToken.tagOpen += c
        return tagName
    }
}

function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    } else if (c == '>' || c == '/' || c == 'EOF') {
        return afterAttributeName(c)
    } else if (c == '=') {
        
    } else {
        currentAttribute = {
            name: '',
            value: ''
        }
        return attributeName(c)
    }
}

function attributeName(c) {
    if (c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == 'EOF') {
        return beforeAttributeName
    } else if (c == '\"') {
        return doubleQuoteAttributeValue
    } else if (c == '\'') {
        return singleQuoteAttributeValue
    } else if (c == '>') {

    } else {
        return UnquotedAttributeValue(c)
    }
}

function selfClosingStartTag(c) {
    if (c == '>') {
        currentToken.isSelfClosing = true
        return data
    } else if (c == 'EOF') {

    } else {

    }
}

module.exports.parserHTML = function parserHTML(html) {
    let state = data
    for(let c of html) {
        state = state(c)
    }
    state === state(EOF)
}