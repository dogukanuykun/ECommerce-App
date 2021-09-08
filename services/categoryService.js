const axios = require("axios");

exports.getCategories = () => {
    return axios.get("https://fakestoreapi.com/products/categories")
}