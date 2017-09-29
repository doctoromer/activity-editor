navbar = {
    showWarning: false,
    oninit: function() {
        activityActions.initShortcuts()
    },
    view: function(vnode) {
        return m("nav.navbar.navbar-inverse.navbar-fixed-top.nav-flat", [
            m("ul.nav.navbar-nav", [
                m("li",
                    m("a.glyphicon.glyphicon-question-sign[href='manual.pdf'][target='_blank']")
                ),
                m("li",
                    m("a.glyphicon.glyphicon-file",
                        {onclick: activityActions.newActivity}
                    )
                ),
                m("li",
                    m("a.glyphicon.glyphicon-" + (model.editMode ? "edit" : "check"),
                        {onclick: activityActions.toggleEdit})
                ),
                m("li",
                    m("a.glyphicon.glyphicon-save",
                        {onclick: activityActions.downloadActivity}
                    )
                ),
                m("li", [
                        m("input#fileReader.hidden[type='file']",
                            {onchange: activityActions.readActivity.bind(this)}
                        ),
                        m("a.glyphicon.glyphicon-open", {onclick: activityActions.loadActivity})
                    ]
                ),
                m("li", m("form#exportForm",
                    {
                        method: "post",
                        ecntype: "multipart/form-data",
                        action: "/convertPdf",
                        "accept-charset": "UTF-8",
                        onsubmit: activityActions.renderPrint
                    },
                    m("input#render-input[type='hidden'][name='html']"),
                    m("a",
                        m("button[type='submit']",
                            m("span.glyphicon.glyphicon-export")
                        )
                    )
                )),
                m("li.dropdown", {class: !model.editMode ? "invisible" : ""}, [
                    m("a.dropdown-toggle.glyphicon.glyphicon-globe[data-toggle='dropdown']"),
                    m("ul.dropdown-menu", Object.keys(i18n.langs).map((code) =>
                        m("li",
                            m("a",
                                {onclick: i18n.setLang.bind(i18n, code)},
                                i18n.langs[code].name
                            )
                        )
                    ))
                ]),
                m("li", {class: !model.editMode ? "invisible" : ""},
                    m("a.glyphicon.glyphicon-plus",
                        {onclick: model.addComponent}
                    )
                ),
                this.showWarning 
                    ? m("li",
                        m("a",
                            m("span.label.label-warning", "bad input")
                        )
                    )
                    : ""
            ])
        ])
    }
}

activityActions = {
    printCss: null,
    schema: null,

    initShortcuts: function() {
        Mousetrap.bind("mod+o", this.loadActivity)
        Mousetrap.bind("mod+e", this.exportActivity)
        Mousetrap.bind("mod+s", this.downloadActivity)
        document.addEventListener("keydown", function(e) {
            if (e.keyCode === 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey))
                e.preventDefault()
        }, false)
    },

    activityPrint: {
        view: function(vnode) {
            activity = vnode.attrs.obj
            return m("article#main-container.panel.panel-default", {dir: activity.direction},
                m("div.panel-body", [
                    m("h1", activity.title),
                    activity.author != ""
                        ? m("div", m("h3", i18n.current.by + ": " + activity.author)) 
                        : "",
                    m("h3", i18n.current.time + ": " + activity.content.map(sumComponentTime).reduce((a, b) => a + b, 0)),
                    m.trust(marked(activity.preface)),
                    m.trust("&nbsp;"),
                    m("div.panel-group", activity.content.map((cmpt, cmptIndex) =>
                        cmpt.content.length === 1 && cmpt.title === ""
                            ? m(componentViewSingleMethod, {obj: cmpt, index: cmptIndex})
                            : m(componentView, {obj: cmpt, index: cmptIndex})
                    ))
                ])
            )
        }
    },

    newActivity: model.setActivity.bind(model, new Activity()),
    toggleEdit: model.toggleEdit.bind(model),

    readActivity: function(e) {
        file = document.getElementById("fileReader").files[0]
        if(!file)
            return

        reader = new FileReader()
        reader.onload = (e) => {
            activity = null
            try {
                activity = JSON.parse(reader.result)
                valid = tv4.validate(activity, activityActions.schema)
                if(!valid)
                    throw "error"
            }
            catch(e) {
                console.log(e)
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
    },

    downloadActivity: function() {
        blob = new Blob(
            [JSON.stringify(model.activity)],
            {type: "application/json"}
        )
        baseName = model.activity.title ? model.activity.title : "activity"
        saveAs(blob, baseName + ".json")
    },

    loadActivity: function() {
        element = document.getElementById("fileReader")
        element.click()
        element.value = ""
    },

    exportActivity: function() {
        activityActions.renderPrint()
        document.getElementById("exportForm").submit()
    },

    toggleDirection: function() {
        model.toggleDirection.bind(model)()
    },

    renderPrint: function() {
        hiddenRoot = document.getElementById("hidden-root")
        doc = hiddenRoot.contentDocument        
        m.render(doc.body, m(activityActions.activityPrint, {obj: model.activity}))

        head = doc.getElementsByTagName("head")[0]
        meta = doc.createElement("meta")

        meta.setAttribute("charset", "utf8")
        head.appendChild(meta)

        style = doc.createElement("style")
        style.appendChild(doc.createTextNode(activityActions.printCss))
        head.appendChild(style)

        input = document.getElementById("render-input")
        result = doc.body.parentElement.outerHTML
        input.value = result
        return true
    }
}
