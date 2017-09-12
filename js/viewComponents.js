methodView = {
    view: function(vnode) {
        mthd = vnode.attrs.obj
        direction = activity.direction === "rtl" ? "right" : "left"
        pullDirection = ".pull-" + direction

        return m("div.method", [
            m("h4", mthd.title),
            m("br"),
            m("div",
                m.trust(marked(mthd.content))
            ),
            mthd.equipment != "" ? m("div", [
               m("strong" + pullDirection, i18n.current.equipment + ": "),
               mthd.equipment
            ]) : "",
            m("div", [
                m("strong" + pullDirection, i18n.current.time + ": "),
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
                {class: colors[cmpt.type]}, i18n.current[cmpt.type] + " - " + cmpt.title),
            m("div",
                m("div.panel-body", [
                    m("div", [
                        m("strong.pull-" + direction, i18n.current.time + ": "),
                        sumTime(cmpt)
                    ]),
                    m("div",
                        m.trust(marked(cmpt.preface))
                    ),
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
        mthd.title = i18n.current[cmpt.type] + " - " + mthd.title

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