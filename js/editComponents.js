function resizeInput() {
    s = $("#hidden-span")
    s.text($(this).val())
    $(this).width(s.width() + 30);
}
function autosizeVdom(vnode) {
    autosize(vnode.dom.getElementsByTagName("textarea"))
    $('input.invisible-input')
        .keydown(resizeInput)
        .each(resizeInput)
}

var methodEdit = {
    oninit: function(vnode) {
        this.dnd = vnode.attrs.dnd
        this.draggable = true
    },
    oncreate: autosizeVdom,
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
            draggable: this.draggable
        }
        classes = ""
        if(this.dnd.srcIndex == index)
            classes += ".transit"

        if(this.dnd.dstIndex == index && this.dnd.dstIndex != this.dnd.srcIndex)
                classes += ".active"

        return m("div.list-group-item" + classes, attrs, [
            vnode.attrs.cmptType === "content" ?
                m("select.form-control.inline",
                    {
                        onclick: stopPropagation,
                        onchange: m.withAttr("value", model.setTitle, mthd),
                        value: mthd.title
                    },
                    [
                        m("option",{value: lang.contest}, lang.contest),
                        m("option",{value: lang.action}, lang.action),
                        m("option",{value: lang.representation}, lang.representation),
                        m("option",{value: lang.creative}, lang.creative),
                        m("option",{value: lang.inspiration}, lang.inspiration),
                        m("option",{value: lang.discussion}, lang.discussion),
                        m("option",{value: lang.thinking}, lang.thinking),
                        m("option",{value: lang.sharing}, lang.sharing),
                        m("option",{value: lang.simulation}, lang.simulation),
                        m("option",{value: lang.reflection}, lang.reflection),
                        m("option",{value: lang.explanation}, lang.explanation),
                        m("option",{value: lang.decomposition}, lang.decomposition)
                    ]
                ) :
                m("h4[contenteditable='true']",
                    {oninput: m.withAttr("innerHTML", model.setTitle, mthd)},
                    m.trust(mthd.title
                )
            ),
            m("textarea",
                {oninput: m.withAttr("value", model.setMethodContent, mthd)},
                mthd.content
            ),
            m("div", [
               m("strong", lang.equipment + ": "),
               m("input.invisible-input",
                    {
                        oninput: m.withAttr("value", model.setMethodEquipment, mthd),
                        onfocus: this.dragOff.bind(this),
                        onblur: this.dragOn.bind(this),
                        value: mthd.equipment
                    }
                )
            ]),
            m("div", [
                m("strong", lang.time + ": "),
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
    oncreate: autosizeVdom,
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
        isRight = model.activity.direction == "ltr"
        direction = isRight ? "right" : "left"

        headerAttrs = {
            ondragstart: _.partial(cmptDnd.ondragstart, index),
            ondragend: _.partial(cmptDnd.ondragend, index),
            ondragover: _.partial(cmptDnd.ondragover, index, cmptDnd),
            ondrop: _.partial(cmptDnd.ondrop, index, cmptDnd),
            draggable: this.draggable,
            href: "#collapseView" + index,
            class: colors[cmpt.type]
        }

        selectElement = m("select.form-control.inline",
            {
                onclick: stopPropagation,
                onchange: m.withAttr("value", model.setComponentType, cmpt),
                value: cmpt.type
            },
            [
                m("option[value='scouting']", lang.scouting),
                m("option[value='content']", lang.content),
                m("option[value='project']", lang.project),
                m("option[value='meeting']", lang.meeting),
                m("option[value='playing']", lang.playing),
                m("option[value='viewpoint']", lang.viewpoint)
            ]
        )

        trashAttrs = {
            ondragover: this.trash.ondragover,
            ondragleave: this.trash.ondragleave,
            ondrop: this.trash.ondrop
        }
        trashClass = ""
        if(this.trash.hoverIndex != null)
            trashClass = ".trash-active"

        headingInput = m("input.heading-input.invisible-input",
            {
                oninput: m.withAttr("value", model.setTitle, cmpt),
                onclick: stopPropagation,
                onfocus: this.dragOff.bind(this),
                onblur: this.dragOn.bind(this),
                value: cmpt.title
            }
        ),
        classes = ""
        if(cmptDnd.srcIndex == index)
                classes += ".transit"
        

        return m("section.panel.border-" + borderColors[cmpt.type] + classes, [
            m("header.panel-heading.row[data-toggle='collapse']", headerAttrs, [
                selectElement,
                m("div.inline",{style: {whiteSpace: "pre"}}, " - "),
                headingInput
            ]),
            m("div#collapseView" + index + ".panel-collapse.collapse",
                m("div.panel-body",
                    m("div", [
                        m("strong", lang.time + ": "),
                        sumTime(cmpt)
                    ]),
                    m("textarea",
                        {
                            oninput: m.withAttr("value", model.setPreface, cmpt),
                            placeholder: lang["additionalInfo"]
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
                    m("span.glyphicon.glyphicon-trash" + trashClass, trashAttrs)
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

        trashAttrs = {
            ondragover: this.trash.ondragover,
            ondragleave: this.trash.ondragleave,
            ondrop: this.trash.ondrop
        }

        trashClass = ""
        if(this.trash.hoverIndex != null)
            trashClass = ".trash-active"

        selector = "article#main-container.col-xs-12.col-md-6.col-md-offset-3.panel.panel-default"
        return m(selector, {dir: activity.direction}, [
            m("div.panel-body", [
                m("h1[contenteditable='true']",
                    {oninput: m.withAttr("innerHTML", model.setTitle, activity)},
                    m.trust(activity.title)),
                m("h3.inline", lang.by + ": "),
                m("h3.inline[contenteditable='true']",
                    {oninput: m.withAttr("innerHTML", model.setActivityAuthor, activity)},
                    m.trust(activity.author)
                ),
                m("h3", lang.time + ": " + activity.content.map(sumTime).reduce((a, b) => a + b, 0)),
                m("textarea",
                    {
                        oninput: m.withAttr("value", model.setPreface, activity),
                        placeholder: lang["additionalInfo"]
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
                    m("span.glyphicon.glyphicon-trash" + trashClass, trashAttrs)
            ])
        ])
    }
}
