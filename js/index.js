function loadActivity(data) {
    model.activity = data
    
    m.request({url: "langs/" + data.language + ".json"})
    .then(function(value) {
        lang = value
    })

    m.request({url: "/langs"})
    .then(function(langs) { 
        m.mount(document.getElementById("navbar-root"),
            {
                view: function() {
                return m(navbar, {langs: langs})
                }
            })
        m.mount(document.getElementById("root"), 
            {
                view: function() {
                    return m(model.editMode ? activityEdit : activityView, {obj: model.activity})
                }
            }
        )
    })
}

function main() {
    m.request({url: "template.json"})
    .then(loadActivity)
}

window.onload = main