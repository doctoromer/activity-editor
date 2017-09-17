// internationalization variables
i18n = {
    langs: {},
    current: {},
    setLang: function(code) {
        this.current = this.langs[code]
        model.activity.direction = this.current.defaultDirection
    }
}

// constructors for the model
class Activity {
    constructor(code) {
        if(code) {
            this.language = code
            this.direction = i18n.langs[code].defaultDirection
        }
        else {   
            this.language = i18n.current.code
            this.direction = i18n.current.defaultDirection
        }

        this.title = ""
        this.author = ""
        this.preface = ""
        this.content = [new Component()]
    }
}

class Component {    
    constructor() {
        this.type = "scouting"
        this.title = ""
        this.preface = ""
        this.content = [new Method()]
    }
}

class Method {
    constructor() {
        this.title = ""
        this.content = ""
        this.equipment = ""
        this.time = 10
    }
}

// the primary model
model = {
    activity: new Activity(),
    editMode: true,

    newActivity: function() {
        this.activity = new Activity()
    },

    toggleEdit: function() {
        this.editMode = !this.editMode
    },
    toggleDirection: function() {
        if(this.activity.direction === "rtl")
            this.activity.direction = "ltr"
        else
            this.activity.direction = "rtl"
    },
    directionName: function(withDirection) {
        return withDirection === (this.activity.direction === "rtl") ? "right" : "left"
    },
    setTitle: function(value) {
        this.title = value
    },
    setActivityAuthor: function(value) {
        this.author = value
    },
    setPreface: function(value) {
        this.preface = value
    },
    setComponentType: function(value) {
        this.type = value
    },
    addComponent: function(value) {
        this.content.push(new Component())
    },
    removeComponent: function(index) {
        console.log(this)
        this.activity.content.splice(index, 1)
    },
    setMethodContent: function(value) {
        this.content = value
    },
    setMethodEquipment: function(value) {
        this.equipment = value
    },
    setMethodTime: function(value) {
        this.time = parseInt(value)
    },
    addMethod: function(value) {
        this.content.push(new Method())
    },
    removeMethod: function(index, cmpt) {
        cmpt.content.splice(index, 1)
    },
}

// drag and drop facilities
dataTransfer = {
    dnd: null
}

class Dnd {
    constructor(array) {
        this.srcIndex = null
        this.dstIndex = null
        this.array = array
    }

    ondragstart(index, event) {
        this.srcIndex = index
        dataTransfer.dnd = this
    }

    ondragend(index, event) {
        this.srcIndex = null
        this.dstIndex = null
        dataTransfer.dnd = null
    }

    ondragover(index, dnd, event) {
        if(dataTransfer.dnd === this) {
            event.preventDefault()
            if(this.dstIndex != index)
                this.dstIndex = index
        }
    }

    ondrop(index, event) {
        this.array.splice(this.dstIndex, 0, this.array.splice(this.srcIndex, 1)[0])
    }
}