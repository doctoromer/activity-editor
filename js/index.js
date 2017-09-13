function main() {
    m.request({url: "/langs"})
    .then((langs) => i18n.langs = langs)
    .then(() => m.mount(document.getElementById("navbar-root"), navbar))
    .then(() => {
        if(localStorage.activity)
            return JSON.parse(localStorage.activity)
        else
            return m.request({url: "template.json"})
    })
    .then((activity) => {
        model.activity = activity
        i18n.setLang(activity.language)
        m.mount(document.getElementById("root"), 
            {
                view: function() {
                    return m(model.editMode ? activityEdit : activityView, {obj: model.activity})
                }
            }
        )
        setInterval(() => localStorage.activity = JSON.stringify(model.activity), 3000)
    })
}

window.onload = main