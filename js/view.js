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
 
activityRootSelector = "article#main-container.panel.panel-default"
activityRootSelector += ".col-xs-12.col-sm-8.col-sm-offset-2.col-md-6.col-md-offset-3"

function sumComponentTime(cmpt) {
    return cmpt.content.map((a) => !isNaN(a.time) ? a.time : 0).reduce((a, b) => a + b, 0)
}

function sumActivityTime(activity) {
    return activity.content.map(sumComponentTime).reduce((a, b) => a + b, 0)
}``

class methodView {
    view(vnode) {
        var mthd = vnode.attrs.obj
        var pullDirection = ".pull-" + model.directionName(true)

        return m("div.method", [
            m("h4", mthd.title),
            m("br"),
            m("div",
                m.trust(marked(mthd.content))
            ),
            mthd.equipment != ""
                ? m("div", [
                   m("strong" + pullDirection, i18n.current.equipment + ": "),
                   mthd.equipment
                ])
                : "",
            m("div", [
                m("strong" + pullDirection, i18n.current.time + ": "),
                mthd.time
            ])
        ])
    }
}

class componentView {
    view(vnode) {
        var cmpt = vnode.attrs.obj
        var index = vnode.attrs.index

        return m("section.panel.border-" + borderColors[cmpt.type], [
            m("header.panel-heading",
                {class: colors[cmpt.type]}, i18n.current[cmpt.type] + " - " + cmpt.title),
            m("div",
                m("div.panel-body", [
                    m("div", [
                        m("strong.pull-" + model.directionName(true), i18n.current.time + ": "),
                        sumComponentTime(cmpt)
                    ]),
                    m("div",
                        m.trust(marked(cmpt.preface))
                    ),
                    cmpt.content.length === 1
                        ? m(methodView, {obj: cmpt.content[0]})
                        : m("div", m("section.list-group", cmpt.content.map((mthd, mthdIndex) =>
                            m(methodView, {obj: mthd, index: mthdIndex})
                        )))
                ])
            )
        ])
    }
}

class componentViewSingleMethod {
    view(vnode) {
        var cmpt = vnode.attrs.obj
        var index = vnode.attrs.index
        var mthd = JSON.parse(JSON.stringify(cmpt.content[0]))
        mthd.title = i18n.current[cmpt.type] + " - " + mthd.title

        return m("section.panel.border-" + colors[cmpt.type],
            m("div",
                {class: colors[cmpt.type]},
                m("div.panel-body", 
                    cmpt.content.length === 1 
                        ? m(methodView, {obj: mthd})
                        : m("div", m("section.list-group", cmpt.content.map(
                            (mthd, mthdIndex) => m(methodView, {obj: mthd, index: mthdIndex})
                        )))
                )
            )
        )
    }
}

class activityView {
    view(vnode) {
        var activity = vnode.attrs.obj
        return m(activityRootSelector, {dir: activity.direction}, [
            m("div.panel-body", [
                m("h1", activity.title),
                activity.author != ""
                    ? m("div", m("h3", i18n.current.by + ": " + activity.author))
                    : "",
                m("h3", i18n.current.time + ": " + sumActivityTime(activity)),
                m.trust(marked(activity.preface)),
                m.trust("&nbsp;"),
                m("div.panel-group", activity.content.map((cmpt, cmptIndex) =>
                    cmpt.content.length === 1 && cmpt.title === ""
                        ? m(componentViewSingleMethod, {obj: cmpt, index: cmptIndex})
                        : m(componentView, {obj: cmpt, index: cmptIndex})
                ))
             ])
        ])
    }
}

class methodEdit {
    oninit(vnode) {
        this.dnd = vnode.attrs.dnd
        this.draggable = true
    }

    dragOn() {
        this.draggable = true
    }

    dragOff() {
        this.draggable = false
    }

    methodFamilies() {
        return ["contest", "action", "representation",
               "creative", "inspiration", "discussion",
               "thinking", "sharing", "simulation",
               "reflection", "explanation", "decomposition"]
    }

    view(vnode) {
        var mthd = vnode.attrs.obj
        var index = vnode.attrs.index
        var dnd = this.dnd
        var src = dnd.srcIndex
        var dst = dnd.dstIndex

        var attrs = {
            ondragstart: dnd.ondragstart.bind(dnd, index),
            ondragend: dnd.ondragend.bind(dnd, index),
            ondragover: dnd.ondragend.bind(dnd, index, dnd),
            ondrop: dnd.ondrop.bind(dnd, index),
            onclick: (e) => e.stopPropagation(),
            draggable: this.draggable,
            class: ""
        }

        if(src === index)
            attrs.class += "transit "

        if(dst === index && dst != src)
            attrs.class += "active"

        return m("div.list-group-item", attrs, [
            vnode.attrs.cmpt.type === "content"
                ? m("select.form-control.inline",
                    {
                        onclick: (e) => e.stopPropagation(),
                        onchange: m.withAttr("value", model.setTitle, mthd),
                        value: mthd.title
                    },
                    this.methodFamilies().map(
                        (family) => m("option",{value: i18n.current[family]}, i18n.current[family])
                    )
                )
                : m("h4[contenteditable='true']",
                    {
                        oninput: m.withAttr("innerHTML", model.setTitle, mthd),
                        placeholder: i18n.current.methodTitle
                    },
                    m.trust(mthd.title)
                ),
            m("span.glyphicon.glyphicon-remove.pull-" + model.directionName(false),
                {
                    onclick: (e) => {
                        e.stopPropagation()
                        model.removeMethod(index, vnode.attrs.cmpt)
                    }
                }
            ),
            m("textarea",
                {
                    oninput: m.withAttr("value", model.setMethodContent, mthd),
                    placeholder: i18n.current.methodContent
                },
                mthd.content
            ),
            m("div", [
               m("strong", i18n.current.equipment + ": "),
               m("input.invisible-input",
                    {
                        oninput: m.withAttr("value", model.setMethodEquipment, mthd),
                        onfocus: this.dragOff.bind(this),
                        onblur: this.dragOn.bind(this),
                        placeholder: i18n.current.equipment,
                        value: mthd.equipment
                    }
                )
            ]),
            m("div", [
                m("strong", i18n.current.time + ": "),
                m("input.invisible-input[type='number']",
                    {
                        oninput: m.withAttr("value", model.setMethodTime, mthd),
                        onclick: (e) => e.stopPropagation(),
                        onfocus: this.dragOff.bind(this),
                        onblur: this.dragOn.bind(this),
                        value: mthd.time
                    }
                )
            ])
        ])
    }
}

class componentEdit {
    oninit(vnode) {
        this.mthdDnd = new Dnd(vnode.attrs.obj.content)
        this.draggable = true
    }

    onupdate(vnode) {
        this.mthdDnd.array = vnode.attrs.obj.content
    }

    dragOn() {
        this.draggable = true
    }

    dragOff() {
        this.draggable = false
    }

    view(vnode) {
        var cmpt = vnode.attrs.obj
        var index = vnode.attrs.index
        var cmptDnd = vnode.attrs.dnd
        var src = cmptDnd.srcIndex
        var dst = cmptDnd.dstIndex

        var panelAttrs = {
            class: "border-" + borderColors[cmpt.type]
        }

        var headerAttrs = {
            ondragstart: cmptDnd.ondragstart.bind(cmptDnd, index),
            ondragend: cmptDnd.ondragend.bind(cmptDnd, cmptDnd, index),
            ondragover: cmptDnd.ondragover.bind(cmptDnd, index, cmptDnd),
            ondrop: cmptDnd.ondrop.bind(cmptDnd, index),
            draggable: this.draggable,
            href: "#collapseView" + index,
            "data-target": "#collapseView" + index,
            class: colors[cmpt.type]
        }

        if(src === index)
            headerAttrs.class += " transit"
        if(dst === index && dst != src)
            panelAttrs.class += " panel-primary"

        return m("section.panel", panelAttrs, [
            m("header.panel-heading[data-toggle='collapse']", headerAttrs, [
                m("select.form-control.inline",
                    {
                        onclick: (e) => e.stopPropagation(),
                        onchange: m.withAttr("value", model.setComponentType, cmpt),
                        value: cmpt.type
                    },
                    [
                        m("option[value='scouting']", i18n.current.scouting),
                        m("option[value='content']", i18n.current.content),
                        m("option[value='project']", i18n.current.project),
                        m("option[value='meeting']", i18n.current.meeting),
                        m("option[value='playing']", i18n.current.playing),
                        m("option[value='viewpoint']", i18n.current.viewpoint)
                    ]
                ),
                m("div.inline",{style: {whiteSpace: "pre"}}, " - "),
                m("input.heading-input.invisible-input",
                    {
                        oninput: m.withAttr("value", model.setTitle, cmpt),
                        onclick: (e) => e.stopPropagation(),
                        onfocus: this.dragOff.bind(this),
                        onblur: this.dragOn.bind(this),
                        placeholder: i18n.current.componentTitle,
                        value: cmpt.title
                    }
                ),
                m("span.glyphicon.glyphicon-remove.pull-" + model.directionName(false),
                    {
                        onclick: (e) => {
                            e.stopPropagation()
                            model.removeComponent(index)
                        }
                    }
                )
            ]),
            m("div#collapseView" + index + ".panel-collapse.collapse",
                m("div.panel-body",
                    m("div", [
                        m("strong", i18n.current.time + ": "),
                        sumComponentTime(cmpt)
                    ]),
                    m("textarea",
                        {
                            oninput: m.withAttr("value", model.setPreface, cmpt),
                            placeholder: i18n.current["additionalInfo"]
                        },
                        cmpt.preface
                    ),
                    m.trust("&nbsp;"),
                    m("div",
                        m("section#methodList" + index + ".list-group", cmpt.content.map((mthd, mthdIndex) =>
                            m(methodEdit, {obj: mthd, index: mthdIndex, cmpt: cmpt, dnd: this.mthdDnd})
                        ))
                    ),
                ),
                m("div.panel-footer", [
                    m("span.glyphicon.glyphicon-plus",
                        {onclick: model.addMethod.bind(cmpt)}
                    ),
                    " "
                ])
            )
        ])
    }
}

class activityEdit {
    oninit(vnode) {
        this.dnd = new Dnd(vnode.attrs.obj.content)
    }

    onupdate(vnode) {
        this.dnd.array = vnode.attrs.obj.content
    }

    resizeInput(e) {
        var span = $("#hidden-span")
        var value = $(this).val()
        var placeholder = $(this).attr("placeholder")
        var text = null
        if(value != "")
            text = value
        else if(placeholder)
            text = placeholder
        else
            text = i18n.current.componentTitle
        span.text(text)
        $(this).width(span.width() + 30)
        m.redraw()
    }

    oncreate(vnode) {
        var dom = $(vnode.dom)
        autosize(dom.find("textarea"))
        $(".collapse").on('shown.bs.collapse', function() {
            autosize.update($(this).find("textarea"))
        })
        dom.find(".invisible-input")
            .keydown(this.resizeInput)
            .each(this.resizeInput)
    }

    view(vnode) {
        var activity = vnode.attrs.obj

        return m(activityRootSelector, {dir: activity.direction}, [
            m("div.panel-body", [
                m("h1[contenteditable='true']",
                    {
                        oninput: m.withAttr("innerHTML", model.setTitle, activity),
                        placeholder: i18n.current.activityTitle
                    },
                    m.trust(activity.title)),
                m("h3.inline", i18n.current.by + ": "),
                m("h3.inline[contenteditable='true']",
                    {
                        oninput: m.withAttr("innerHTML", model.setActivityAuthor, activity),
                        placeholder: i18n.current.author
                    },
                    m.trust(activity.author)
                ),
                m("h3", i18n.current.time + ": " + sumActivityTime(activity)),
                m("textarea",
                    {
                        oninput: m.withAttr("value", model.setPreface, activity),
                        placeholder: i18n.current["additionalInfo"]
                    },
                    activity.preface
                ),
                m.trust("&nbsp;"),
                m("div#components.panel-group", activity.content.map((cmpt, cmptIndex) =>
                    m(componentEdit, {obj: cmpt, index: cmptIndex, dnd: this.dnd})
                    )
                )
            ]),
            m("div.panel-footer", [
                m("span.glyphicon.glyphicon-plus",
                    {onclick: model.addComponent.bind(activity)}
                ),
            ])
        ])
    }
}
