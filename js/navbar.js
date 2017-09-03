navbar = {
    showWarning: false,
    oninit: function(vnode) {
        this.langs = vnode.attrs.langs
        _.mapKeys(this.langs, (name, code) => {
            m.request({url: '/langs/' + code + '.json'})
            .then(function(current_lang) {
                i18n[code] = current_lang
                m.redraw()
            })
        })
    },
    setLang: function(code) {
        lang = i18n[code]
        model.activity.direction = lang.defaultDirection
    },
    view: function(vnode) {
        dir = ""
        helperFunc = function() {document.getElementById("fileReader").click()}
        if(model.activity.direction == "rtl")
            dir = "left"
        else if(model.activity.direction == "ltr")
            dir = "right"

        return m("nav.navbar.navbar-inverse.navbar-fixed-top.nav-flat", [
            m("ul.nav.navbar-nav", [
                m("li",
                    m("a.glyphicon.glyphicon-question-sign[data-toggle='modal'][data-target='#help']")
                ),
                m("li",
                    m("a.glyphicon.glyphicon-file",
                        {onclick: model.newActivity.bind(model)}
                    )
                ),
                m("li",
                    m("a.glyphicon.glyphicon-" + (model.editMode ? "edit" : "check"),
                        {onclick: model.toggleEdit.bind(model)})
                ),
                m("li",
                    m("a.glyphicon.glyphicon-save", {onclick: downloadActivity})
                ),
                m("li", [
                        m("input#fileReader.hidden[type='file']", {onchange: readActivity.bind(this)}),
                        m("a.glyphicon.glyphicon-open", {onclick: helperFunc})
                    ]
                ),
                m("li", m("form",
                    {method: "post", ecntype: "multipart/form-data", action: "/convertPdf"},
                    m("input#render-input[type='hidden'][name='html']"),
                    m("a", m("button[type='submit']",{onsubmit: renderPrint}, m("span.glyphicon.glyphicon-export")))
                )),
                model.editMode ? m("li.dropdown", [
                    m("a.dropdown-toggle[data-toggle='dropdown']", [
                        lang.name,
                        m("span.caret")]
                    ),
                    m("ul.dropdown-menu", Object.keys(this.langs).map((code) =>
                        m("li", m("a", {onclick: _.partial(this.setLang, code)}, this.langs[code]))
                    ))
                ]) : "",
                model.editMode ? m("li",
                    m("a.glyphicon.glyphicon-triangle-" + dir,
                        {onclick: model.toggleDirection.bind(model)}
                    )
                ) : "",
                this.showWarning ? m("li",
                    m("a",
                        m("span.label.label-warning", "bad input")
                    )
                ) : ""
            ])
        ])
    }
}

activityPrint = {
    view: function(vnode) {
        activity = vnode.attrs.obj
        return m("article#main-container.panel.panel-default", {dir: activity.direction}, [
            m("div.panel-body", [
                m("h1", activity.title),
                activity.author != "" ? 
                m("div", m("h3", lang.by + ": " + activity.author)) : 
                "",
                m("h3", lang.time + ": " + activity.content.map(sumTime).reduce((a, b) => a + b, 0)),
                m.trust(marked(activity.preface)),
                m.trust("&nbsp;"),
                m("div.panel-group", activity.content.map((cmpt, cmptIndex) =>
                    cmpt.content.length == 1 && cmpt.title == ""
                    ? m(componentViewSingleMethod, {obj: cmpt, index: cmptIndex})
                    : m(componentView, {obj: cmpt, index: cmptIndex})
                ))
             ])
        ])
    }
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

invalidChars = ["\\", "/", ":", "*", "?", "\"", "<", ">", "|"]
function downloadFile(content, name) {
    invalidChars.map((char) => name.replace(char, "_"))
    var blob = new Blob([content], {type: "text/plain;charset=utf-8"})
    saveAs(blob, name)
}

function renderPrint() {
    hiddenRoot = document.getElementById("hidden-root")
    doc = hiddenRoot.contentDocument
    m.render(doc.body, m(activityPrint, {obj: model.activity}))
    style = doc.createElement("style")
    style.appendChild(doc.createTextNode(printCss))
    doc.getElementsByTagName("head")[0].appendChild(style)

    input = document.getElementById("render-input")
    input.value = doc.body.parentElement.outerHTML
    return true
}

printCss = null
m.request({
    url: "/css/printStyle.css",
    deserialize: _.identity
}).then(function(value) {
    printCss = value
})

schema = null
m.request({
    url: "/schema.json",
}).then(function(value) {
    schema = value
})