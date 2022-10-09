const axios = require("axios");

const token = process.env.weatherbit_token

const api = axios.create({
  baseURL: "http://api.weatherbit.io/v2.0/",
  timeout: 5000,
  params: {
    key: token,
  },
});




const getWeatherByCity = async (city) =>  {
    const data = await api.get('/current', {
        params: {
            city
        }
    })

    return data.data.data[0]
}

const getForecastByCity = async (city) =>  {
    const data = await api.get('/forecast/daily', {
        params: {
            city
        }
    })

    return data.data.data
}

module.exports = {
    getWeatherByCity,
    getForecastByCity
}