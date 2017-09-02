methodView = {
    view: function(vnode) {
        mthd = vnode.attrs.obj
        direction = activity.direction === "rtl" ? "right" : "left"
        return m("div.method", [
            m("h4", mthd.title),
            m("br"),
            m.trust(marked(mthd.content)),
            mthd.equipment != "" ? m("div", [
               m("strong", {style: {float: direction}}, lang.equipment + ": "),
               mthd.equipment
            ]) : "",
            m("div", [
                m("strong", {style: {float: direction}}, lang.time + ": "),
                mthd.time
            ])
        ])
    }
}



componentView = {
    view: function(vnode) {
        cmpt = vnode.attrs.obj
        index = vnode.attrs.index
        direction = activity.direction === "rtl" ? "right" : "left"

        return m("section.panel.border-" + borderColors[cmpt.type], [
            m("header.panel-heading",
                {class: colors[cmpt.type]}, lang[cmpt.type] + " - " + cmpt.title),
            m("div",
                m("div.panel-body", [
                    m("div", [
                        m("strong", {style: {float: direction}}, lang.time + ": "),
                        sumTime(cmpt)
                    ]),
                    m.trust(marked(cmpt.preface)),
                    cmpt.content.length == 1 ? 
                    m(methodView, {obj: cmpt.content[0]}) :
                    m("div", m("section.list-group", cmpt.content.map((mthd, mthdIndex) =>
                        m(methodView, {obj: mthd, index: mthdIndex})
                    )))
                ])
            )
        ])
    }
}

componentViewSingleMethod = {
    view: function(vnode) {
        cmpt = vnode.attrs.obj
        index = vnode.attrs.index
        mthd = _.cloneDeep(cmpt.content[0])
        mthd.title = lang[cmpt.type] + " - " + mthd.title

        return m("section.panel.border-" + colors[cmpt.type],
            m("div",
                {class: colors[cmpt.type]},
                m("div.panel-body", 
                    cmpt.content.length == 1 ? 
                    m(methodView, {obj: mthd}) :
                    m("div", m("section.list-group", cmpt.content.map((mthd, mthdIndex) =>
                        m(methodView, {obj: mthd, index: mthdIndex})
                    )))
                )
            )
        )
    }
}

activityView = {
    view: function(vnode) {
        activity = vnode.attrs.obj
        selector = "article#main-container.col-xs-12.col-md-6.col-md-offset-3.panel.panel-default"
        return m(selector, {dir: activity.direction}, [
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
        else if((model.activity.direction == "ltr"))
            dir = "right"

        return m("nav.navbar.navbar-inverse.navbar-fixed-top.nav-flat",[
/*            m("div.navbar-header",
                m("a.navbar-brand", lang.activityEditor)),*/
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
                    m("input[type='hidden'][name='html']", {value: renderPrint()}),
                    m("a", m("button[type='submit']", m("span.glyphicon.glyphicon-export")))
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

