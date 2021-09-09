const axios = require("axios");


exports.getProducts = () => {
    return axios.get("https://fakestoreapi.com/products")
}

exports.getProductById = (id) => {
    return axios.get(`https://fakestoreapi.com/products/${id}`);
}

exports.getProductsByCategory = (category) => {
    return axios.get('https://fakestoreapi.com/products/category/'+category);
}


