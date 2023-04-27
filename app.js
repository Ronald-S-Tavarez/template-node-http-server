const fs = require('fs')
const http = require('http')

const server = http.createServer((req, res) => {
    res.setHeader('Content-type', 'text/html')
    
    const write_tag = (res, element) => {
        if (element.parameters === undefined) {
            res.write(`<${element.tag}>`)
        } else {
            let buffer = `<${element.tag}`
            element.parameters.forEach(parameter => {
                buffer += ` ${parameter.name}="${parameter.value}"`
            })
            buffer += ">"
            res.write(buffer)
        }
            
        if (element.children !== undefined)
            for (index in element.children)
                if (element.children[index].tag !== undefined)
                    write_tag(res, element.children[index])
                else
                    res.write(element.children[index])

        res.write(`</${element.tag}>`)
    }

    const write_root = (res) => {
        write_tag(res, {
            "tag": "html",
            "children": [
                {"tag": "head", "children": [{"tag": "title", "children": ["Hello World"]}]},
                {"tag": "body", "children": [
                    {"tag": "h1", "children" : [ "Hello World Root!" ]},
                    {"tag": "form", "parameters": [{"name": "action", "value": "/message"}, {"name": "method", "value": "POST"},], "children": [
                        {"tag": "input", "parameters": [{"name": "type", "value": "text"}, {"name": "name", "value": "message"}]},
                        {"tag": "button", "parameters": [{"name": "type", "value": "submit"}], "children": ["Submit"]}
                    ]}
                ]}
            ]
        })
    }

    if (req.url === '/') {
        write_root(res)
        return res.end()
    }

    if (req.url === "/message" && req.method === 'POST') {
        const body = []
        req.on('data', chunk => { body.push(chunk) })
        return req.on('end', () => {
            const parsed_body = Buffer.concat(body).toString()
            const message = parsed_body.split("=")[1]
            fs.writeFile('message.txt', message, err => {
                res.statusCode = 302
                res.setHeader('Location', '/')
                return res.end()
            })
        }) 

    }
})

server.listen(3000)