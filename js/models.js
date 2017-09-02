i18n = {}
lang = {}

function Activity() {
    this.title = ""
    this.author = ""
    this.language = _.findKey(i18n, {name: lang.name})
    this.direction = lang.defaultDirection
    this.preface = ""
    this.content = [new Component()]
}

function Component() {
    this.type = "scouting"
    this.title = ""
    this.preface = ""
    this.content = [new Method()]
}

function Method() {
    this.title = ""
    this.content = ""
    this.equipment = ""
    this.time = 10
}

model = {
    activity: new Activity(),
    editMode: true,

    newActivity: function() {
        this.activity = new Activity()
        // console.log("newActivity: ", )
    },

    toggleEdit: function() {
        this.editMode = !this.editMode
    },
    toggleDirection: function() {
        if(this.activity.direction == "rtl")
            this.activity.direction = "ltr"
        else
            this.activity.direction = "rtl"
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
}

dataTransfer = {
    dnd: null
}

function Dnd(array) {
    this.srcIndex = null
    this.dstIndex = null
    this.array = array

    this.ondragstart = function(index, event) {
        this.srcIndex = index
        dataTransfer.dnd = this
    }.bind(this)
    this.ondragend = function(index, event) {
        this.srcIndex = null
        this.dstIndex = null
        dataTransfer.dnd = null
    }.bind(this)

    this.ondragover = function(index, dnd, event) {
        if(dataTransfer.dnd == this){
            event.preventDefault()
            if(this.dstIndex != index) {
                this.dstIndex = index
            }
        }
    }.bind(this)

    this.ondrop = function(index, dnd, event) {
        console.log("ondrop: ", this)
        this.array.splice(this.dstIndex, 0, this.array.splice(this.srcIndex, 1)[0])
    }.bind(this)
}

function Trash(dnd) {
    this.hoverIndex = null
    this.dnd = dnd

    this.ondragover = function(event) {
        if(this.dnd == dataTransfer.dnd) {
            event.preventDefault()
            this.hoverIndex = dnd.srcIndex
        }
    }.bind(this)

    this.ondragleave = function() {
        this.hoverIndex = null
    }.bind(this)

    this.ondrop = function() {
        this.dnd.array.splice(this.dnd.srcIndex, 1)
        this.hoverIndex = null
    }.bind(this)
}