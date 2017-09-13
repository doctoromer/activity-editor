navbar = {
    showWarning: false,
    view: function(vnode) {

        helperFunc = () => {
            element = document.getElementById("fileReader")
            element.click()
            element.value = ""
        }

        dir = ""
        if(model.activity.direction == "rtl")
            dir = "left"
        else if(model.activity.direction == "ltr")
            dir = "right"

        return m("nav.navbar.navbar-inverse.navbar-fixed-top.nav-flat", [
            m("ul.nav.navbar-nav", [
                m("li",
                    m("a.glyphicon.glyphicon-question-sign[href='manual.pdf'][target='_blank']")
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
                    {
                        method: "post",
                        ecntype: "multipart/form-data",
                        action: "/convertPdf",
                        "accept-charset": "UTF-8",
                        onsubmit: renderPrint
                    },
                    m("input#render-input[type='hidden'][name='html']"),
                    m("a", m("button[type='submit']", m("span.glyphicon.glyphicon-export")))
                )),
                m("li.dropdown", {class: !model.editMode ? "invisible" : ""}, [
                    m("a.dropdown-toggle[data-toggle='dropdown']", [
                        i18n.current.name,
                        m("span.caret")]
                    ),

                    m("ul.dropdown-menu", Object.keys(i18n.langs).map((code) =>
                        m("li",
                            m("a",
                                {onclick: _.partial(i18n.setLang.bind(i18n), code)},
                                i18n.langs[code].name
                            )
                        )
                    ))
                ]),
                m("li", {class: !model.editMode ? "invisible" : ""},
                    m("a.glyphicon.glyphicon-triangle-" + dir,
                        {onclick: model.toggleDirection.bind(model)}
                    )
                ),
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
                m("div", m("h3", i18n.current.by + ": " + activity.author)) : 
                "",
                m("h3", i18n.current.time + ": " + activity.content.map(sumTime).reduce((a, b) => a + b, 0)),
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
    reader.onload = (e) => {
        activity = null
        try {
            activity = JSON.parse(reader.result)
            valid = tv4.validate(activity, schema)
            if(!valid)
                throw "error"
        }
        catch(e) {
            this.showWarning = true
            setTimeout(() => {
                this.showWarning = false
                m.redraw()
            }, 5000)
        }
        if(!this.showWarning) {
            model.activity = activity
            i18n.setLang(activity.language)
        }
        m.redraw()
    }

    reader.readAsText(file)
}

function downloadActivity() {
    blob = new Blob(
        [JSON.stringify(model.activity)],
        {type: "application/json"}
    )
    baseName = model.activity.title ? model.activity.title : "activity"
    saveAs(blob, baseName + ".json")
}

function renderPrint() {
    hiddenRoot = document.getElementById("hidden-root")
    doc = hiddenRoot.contentDocument
    m.render(doc.body, m(activityPrint, {obj: model.activity}))

    head = doc.getElementsByTagName("head")[0]
    meta = doc.createElement("meta")

    meta.setAttribute("charset", "utf8")
    head.appendChild(meta)

    style = doc.createElement("style")
    style.appendChild(doc.createTextNode(printCss))
    head.appendChild(style)

    input = document.getElementById("render-input")
    input.value = doc.body.parentElement.outerHTML
    return true
}

printCss = null
m.request({
    url: "/css/printStyle.css",
    deserialize: _.identity
})
.then((value) => printCss = value)

schema = null
m.request({url: "/schema.json"})
.then((value) => schema = value)