function resizeInput() {
    s = $("#hidden-span")
    val = $(this).val() != "" ? $(this).val() : $(this).attr("placeholder")
    s.text(val)
    $(this).width(s.width() + 60);
}

function autosizeVdom(vnode) {
    dom = $(vnode.dom)
    autosize(dom.find("textarea"))
    $(".collapse").on('shown.bs.collapse', function() {
        autosize.update($(this).find("textarea"))
    })
    dom.find(".invisible-input")
        .keydown(resizeInput)
        .each(resizeInput)
}

var methodEdit = {
    oninit: function(vnode) {
        this.dnd = vnode.attrs.dnd
        this.draggable = true
    },
    dragOn: function() {
        this.draggable = true
        console.log(this.draggable)
    },
    dragOff: function() {
        this.draggable = false
        console.log(this.draggable)
    },
    view: function(vnode) {
        mthd = vnode.attrs.obj
        index = vnode.attrs.index

        attrs = {
            ondragstart: _.partial(this.dnd.ondragstart, index),
            ondragend: _.partial(this.dnd.ondragend, index),
            ondragover: _.partial(this.dnd.ondragover, index, this.dnd),
            ondrop: _.partial(this.dnd.ondrop, index, this.dnd),
            onclick: stopPropagation,
            draggable: this.draggable,
            class: ""
        }

        if(this.dnd.srcIndex == index)
            attrs.class += "transit "

        if(this.dnd.dstIndex == index && this.dnd.dstIndex != this.dnd.srcIndex)
            attrs.class += "active"

        return m("div.list-group-item", attrs, [
            vnode.attrs.cmptType === "content" ?
            m("select.form-control.inline",
                {
                    onclick: stopPropagation,
                    onchange: m.withAttr("value", model.setTitle, mthd),
                    value: mthd.title
                },
                [
                    m("option",{value: i18n.current.contest}, i18n.current.contest),
                    m("option",{value: i18n.current.action}, i18n.current.action),
                    m("option",{value: i18n.current.representation}, i18n.current.representation),
                    m("option",{value: i18n.current.creative}, i18n.current.creative),
                    m("option",{value: i18n.current.inspiration}, i18n.current.inspiration),
                    m("option",{value: i18n.current.discussion}, i18n.current.discussion),
                    m("option",{value: i18n.current.thinking}, i18n.current.thinking),
                    m("option",{value: i18n.current.sharing}, i18n.current.sharing),
                    m("option",{value: i18n.current.simulation}, i18n.current.simulation),
                    m("option",{value: i18n.current.reflection}, i18n.current.reflection),
                    m("option",{value: i18n.current.explanation}, i18n.current.explanation),
                    m("option",{value: i18n.current.decomposition}, i18n.current.decomposition)
                ]
            ) :
            m("h4[contenteditable='true']",
                {
                    oninput: m.withAttr("innerHTML", model.setTitle, mthd),
                    placeholder: i18n.current.methodTitle
                },
                m.trust(mthd.title)
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
                        onclick: stopPropagation,
                        onfocus: this.dragOff.bind(this),
                        onblur: this.dragOn.bind(this),
                        value: mthd.time
                    }
                )
            ])
        ])
    }
}

var componentEdit = {
    oninit: function(vnode) {
        this.mthdDnd = new Dnd(vnode.attrs.obj.content)
        this.trash = new Trash(this.mthdDnd)
        this.draggable = true
    },
    onupdate: function(vnode) {
        this.mthdDnd.array = vnode.attrs.obj.content
        this.trash.dnd = this.mthdDnd
    },
    dragOn: function() {
        this.draggable = true
    },
    dragOff: function() {
        this.draggable = false
    },
    view: function(vnode) {
        cmpt = vnode.attrs.obj
        index = vnode.attrs.index
        cmptDnd = vnode.attrs.dnd
        panelAttrs = {
            class: "border-" + borderColors[cmpt.type]
        }
        headerAttrs = {
            ondragstart: _.partial(cmptDnd.ondragstart, index),
            ondragend: _.partial(cmptDnd.ondragend, index),
            ondragover: _.partial(cmptDnd.ondragover, index, cmptDnd),
            ondrop: _.partial(cmptDnd.ondrop, index, cmptDnd),
            onclick: _.identity,
            draggable: this.draggable,
            href: "#collapseView" + index,
            "data-target": "#collapseView" + index,
            class: colors[cmpt.type]
        }

        if(cmptDnd.srcIndex == index)
            headerAttrs.class += " transit"
        if(cmptDnd.dstIndex == index && cmptDnd.dstIndex != cmptDnd.srcIndex)
            panelAttrs.class += " panel-primary"

        return m("section.panel", panelAttrs, [
            m("header.panel-heading[data-toggle='collapse']", headerAttrs, [
                m("select.form-control.inline",
                    {
                        onclick: stopPropagation,
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
                        onclick: stopPropagation,
                        onfocus: this.dragOff.bind(this),
                        onblur: this.dragOn.bind(this),
                        placeholder: cmpt.content.length == 1 && cmpt.title == "" ?
                            cmpt.content[0].title :
                            i18n.current.componentTitle,
                        value: cmpt.title
                    }
                )
            ]),
            m("div#collapseView" + index + ".panel-collapse.collapse",
                m("div.panel-body",
                    m("div", [
                        m("strong", i18n.current.time + ": "),
                        sumTime(cmpt)
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
                            m(methodEdit, {obj: mthd, index: mthdIndex, cmptType: cmpt.type, dnd: this.mthdDnd})
                        ))
                    ),
                ),
                m("div.panel-footer", [
                    m("span.glyphicon.glyphicon-plus", {onclick: _.bind(model.addMethod, cmpt)}), " ",
                    m("span.glyphicon.glyphicon-trash",
                    {
                        ondragover: this.trash.ondragover,
                        ondragleave: this.trash.ondragleave,
                        ondrop: this.trash.ondrop,
                        class: this.trash.hoverIndex != null ? "trash-active" : ""
                    })
                ])
            )
        ])
    }
}

var activityEdit = {
    oninit: function(vnode) {
        this.dnd = new Dnd(vnode.attrs.obj.content)
        this.trash = new Trash(this.dnd)
    },
    onupdate: function(vnode) {
        this.dnd.array = vnode.attrs.obj.content
        this.trash.dnd = this.dnd
    },
    oncreate: autosizeVdom,
    view: function(vnode) {
        activity = vnode.attrs.obj

        selector = "article#main-container.panel.panel-default"
        selector += ".col-xs-10.col-xs-offset-1.col-md-6.col-md-offset-3"
        return m(selector, {dir: activity.direction}, [
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
                m("h3", i18n.current.time + ": " + activity.content.map(sumTime).reduce((a, b) => a + b, 0)),
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
                m("span.glyphicon.glyphicon-plus", {onclick: _.bind(model.addComponent, activity)}),
                m("span.glyphicon.glyphicon-trash",
                    trashAttrs = {
                    ondragover: this.trash.ondragover,
                    ondragleave: this.trash.ondragleave,
                    ondrop: this.trash.ondrop,
                    class: this.trash.hoverIndex != null ? "trash-active" : ""
                })
            ])
        ])
    }
}
