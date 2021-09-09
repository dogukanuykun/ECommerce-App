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

exports.getCart = (req, res, next) => {
  req.user
      .populate('cart.items.productId')
      .execPopulate()
      .then(user => {
          res.render('shop/cart', {
              title: 'Cart',
              path: '/cart',
              products: user.cart.items
          });
      }).catch(err => {
          next(err);
      });
}

exports.postCart = (req, res, next) => {

  const productId = req.body.productId;

  

  // Product.findById(productId)
  //     .then(product => {
  //         return req.user.addToCart(product);
  //     })
  //     .then(() => {
  //         res.redirect('/cart');
  //     })
  //     .catch(err => next(err));
}

exports.postCartItemDelete = (req, res, next) => {
  const productid = req.body.productid;
  req.user
      .deleteCartItem(productid)
      .then(() => {
          res.redirect('/cart');
      });
}

exports.getOrders = (req, res, next) => {

  Order
      .find({ 'user.userId': req.user._id })
      .then(orders => {
          console.log(orders);
          res.render('shop/orders', {
              title: 'Orders',
              path: '/orders',
              orders: orders
          });

      })
      .catch(err => next(err));
}

exports.postOrder = (req, res, next) => {

  req.user
      .populate('cart.items.productId')
      .execPopulate()
      .then(user => {
          const order = new Order({
              user: {
                  userId: req.user._id,
                  name: req.user.name,
                  email: req.user.email
              },
              items: user.cart.items.map(p => {
                  return {
                      product: {
                          _id: p.productId._id,
                          name: p.productId.name,
                          price: p.productId.price,
                          imageUrl: p.productId.imageUrl
                      },
                      quantity: p.quantity
                  };
              })
          });
          return order.save();
      })
      .then(() => {
          return req.user.clearCart();
      })
      .then(() => {
          res.redirect('/orders');
      })
      .catch(err => {
          next(err);
      });
}
