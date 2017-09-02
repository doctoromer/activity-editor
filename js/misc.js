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

function stopPropagation(event) {
    event.stopPropagation()
}

function sumTime(obj) {
    return obj.content.map((a) => !isNaN(a.time) ? a.time : 0).reduce((a, b) => a + b, 0)
}