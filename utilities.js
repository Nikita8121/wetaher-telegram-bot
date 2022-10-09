const defineIconByWeather = (temp) => {
    if(temp < -10) {
        return '🌡 🥶'
    }
    else if(temp < 0) {
        return '🌡 ❄'
    }
    else if(temp < 10) {
     return '🌡 🤧'
    } else if (temp < 20) {
        return '🌡 ☁'
    }
    else if (temp >= 20) {
        return '🌡 🥵'
    }
} 



module.exports = {
    defineIconByWeather
}