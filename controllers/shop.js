const productService = require('../services/productService');
const categoryService = require('../services/categoryService');

let products;
let categories;

productService.getProducts().then(response=>{products = (response.data)})
categoryService.getCategories().then(response => {categories = (response.data)})

exports.getIndex = (req, res, next) => {
  res.render("shop/index.pug", {
    categories: categories,
    products: products
  });
};

exports.getProduct = (req, res, next) => {
  let selectedProduct = products.find((obj) => obj.id == req.params.productid);
  let category = selectedProduct.category;
  let productsWithoutThis = products.filter(obj => obj.category == category && obj.id !== selectedProduct.id);
  //console.log(selectedProduct);
  res.render("shop/product-detail", {
    product: selectedProduct,
    otherProducts: productsWithoutThis,
    title: selectedProduct.title,
    path: "/products"
  });
};

exports.getProducts = (req,res,next) => {

  res.render("shop/products",{
    products:products
  })
}

exports.getByCategory = (req,res,next) => {
  let selectedCategory = req.params.categoryname
  //console.log(selectedCategory)
  
  let productsByCategory = products.filter(obj => obj.category == selectedCategory);
  res.render("shop/index",{
    products: productsByCategory,
    title: selectedCategory,
    categories:categories
  })
  next();
}
