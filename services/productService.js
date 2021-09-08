const axios = require("axios");


exports.getProducts = () => {
    return axios.get("https://fakestoreapi.com/products")
}

exports.getProductsByCategory = (category) => {
    return axios.get('https://fakestoreapi.com/products/category/'+category);
}

