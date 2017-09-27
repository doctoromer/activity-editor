console.time("load")
function main() {
    m.request({url: "/langs"})
    .then((langs) => i18n.langs = langs)
    .then(() => m.mount(document.getElementById("navbar-root"), navbar))
    .then(() => {
        if(localStorage.activity)
            return JSON.parse(localStorage.activity)
        else
            return new Activity("he")
    })
    .then((activity) => {
        model.setActivity(activity)
        i18n.setLang(activity.language)
        m.mount(document.getElementById("root"), 
            {
                view: function() {
                    return m(model.editMode ? activityEdit : activityView, {obj: model.activity})
                }
            }
        )
        setInterval(() => localStorage.activity = JSON.stringify(model.activity), 3000)
        console.timeEnd("load")
    })

    m.request({
        url: "/css/printStyle.css",
        deserialize: (data) => data
    })
    .then((value) => activityActions.printCss = value)

    m.request({url: "/schema.json"})
    .then((value) => activityActions.schema = value)
}

window.onload = main