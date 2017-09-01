colors = {
    "scouting": "green-accent-2",
    "content": "rgba-red-strong text-white",
    "project": "rgba-indigo-strong text-white",
    "meeting": "rgba-blue-strong",
    "playing": "rgba-purple-strong text-white",
    "viewpoint": "rgba-yellow-strong"
}

borderColors = {
    "scouting": "green-accent-2",
    "content": "rgba-red-strong",
    "project": "rgba-indigo-strong",
    "meeting": "rgba-blue-strong",
    "playing": "rgba-purple-strong",
    "viewpoint": "rgba-yellow-strong" 
}

function stopPropagation(event) {
    event.stopPropagation()
}

function readActivity(e) {
    file = document.getElementById("fileReader").files[0]
    if(!file)
        return
    reader = new FileReader()
    reader.onload = function(e) {
        activity = null
        try {
            activity = JSON.parse(reader.result)
            valid = tv4.validate(activity, schema)
            if(!valid)
                throw "error"
        }
        catch(e) {
            this.showWarning = true
            setTimeout(function() {
                this.showWarning = false
                m.redraw()
            }.bind(this), 5000)
        }
        if(!this.showWarning) {   
            model.activity = activity
            this.setLang(activity.language)
        }
        m.redraw()
    }.bind(this)
    reader.readAsText(file)
}

function downloadActivity() {
    content = JSON.stringify(model.activity)
    downloadFile(content, model.activity.title + ".json")
}

function readActivityHelper() {
    document.getElementById("fileReader").click()
}

invalidChars = ["\\", "/", ":", "*", "?", "\"", "<", ">", "|"]
function downloadFile(content, name) {
    invalidChars.map((char) => name.replace(char, "_"))
    var blob = new Blob([content], {type: "text/plain;charset=utf-8"})
    saveAs(blob, name)
}

printCss = null
m.request({
    url: "/css/printStyle.css",
    deserialize: _.identity
}).then(function(value) {
    printCss = value
})

function renderPrint() {
    hiddenRoot = document.getElementById("hidden-root")
    doc = hiddenRoot.contentDocument
    m.render(doc.body, m(activityPrint, {obj: model.activity}))
    style = doc.createElement("style")
    style.appendChild(doc.createTextNode(printCss))
    doc.getElementsByTagName("head")[0].appendChild(style)
    return doc.body.parentElement.outerHTML
}

function sumTime(obj) {
    return obj.content.map((a) => !isNaN(a.time) ? a.time : 0).reduce((a, b) => a + b, 0)
}

schema = null
m.request({
    url: "/schema.json",
}).then(function(value) {
    schema = value
})