var _a;
var searchBar = document.querySelector(".searchBar");
var cart = JSON.parse((_a = localStorage.getItem("cart")) !== null && _a !== void 0 ? _a : "[]");
function searchingFilter(products, event) {
    var lookingFor = searchBar.value.toLowerCase().trim();
    if (searchBar.value.startsWith(" ")) {
        searchBar.value = "";
        return;
    }
    if (lookingFor.length > 0) {
        var searchingList_1 = [];
        products.forEach(function (product) {
            var productTitle = product.title.toLowerCase();
            if (productTitle.match(lookingFor)) {
                searchingList_1.push(product);
            }
        });
        renderProducts(searchingList_1);
    }
}
function bringData() {
    fetch("./products.json")
        .then(function (response) {
        var data = response.json();
        return data;
    })
        .then(function (products) {
        navCategoriesItems(products);
        renderProducts(products);
        ratingSystem(products);
        searchBar.addEventListener("keyup", function (event) {
            searchingFilter(products, event);
        });
    })
        .catch(function (Error) {
        new Error("something wrong");
    });
}
function navCategoriesItems(products) {
    var navList = document.querySelector(".navList");
    var allCategories = [];
    var allProductsItem = document.createElement("li");
    allProductsItem.className = "nav-item active";
    allProductsItem.innerHTML = "All Products";
    allProductsItem.setAttribute("data-name", "allProducts");
    navList.appendChild(allProductsItem);
    allProductsItem.addEventListener("click", function () {
        if (allProductsItem.classList.contains("active")) {
            return;
        }
        updateActiveCategory(allProductsItem);
        renderProducts(products);
    });
    products.forEach(function (product) {
        allCategories.push(product.category);
    });
    var uniqueCategories = Array.from(new Set(allCategories));
    uniqueCategories.forEach(function (item) {
        var navItem = document.createElement("li");
        navItem.className = "nav-item";
        navItem.innerHTML = item;
        navItem.setAttribute("data-name", item);
        navItem.addEventListener("click", function () {
            if (navItem.classList.contains("active")) {
                return;
            }
            updateActiveCategory(navItem);
            var filteredProducts = products.filter(function (product) { return product.category === item; });
            renderProducts(filteredProducts);
        });
        navList.appendChild(navItem);
    });
    function updateActiveCategory(activeItem) {
        var navbarItems = navList.querySelectorAll(".nav-item");
        navbarItems.forEach(function (item) { return item.classList.remove("active"); });
        activeItem.classList.add("active");
    }
}
function renderProducts(products) {
    var allStatus = [
        "In Stock",
        "Available",
        "Limited Stock",
        "Ships Soon",
        "Pre-order",
        "Out of Stock",
        "Removed",
    ];
    var productsList = document.querySelector(".products");
    productsList.innerHTML = "";
    products.forEach(function (product) {
        var randomStatus = allStatus[Math.floor(Math.random() * allStatus.length)];
        var stateIndex = allStatus.indexOf(randomStatus);
        var productItem = document.createElement("div");
        productItem.className = "product";
        var cartItem = cart.find(function (item) { return item.id === product.id; });
        var inCartAmount = cartItem ? cartItem.quantity : 0;
        productItem.innerHTML = "\n      <span class=\"id\">".concat(product.id, "</span>\n      <img src=\"./imgs/").concat(product.image, "\" alt=\"").concat(product.title, "\"></img>\n      <h3 class=\"title\">").concat(product.title, "</h3>\n      <p class=\"description\">\n      <span>").concat(product.description, "</span>\n      <span class=\"rating\"></span>\n      <span class=\"in-cart-amount\">").concat(inCartAmount ? "[ <span>".concat(inCartAmount, "</span> ] In Cart") : "", "</span>\n      </p>\n      <div class=\"price-quantity\">\n        <span class=\"price \n        ").concat(product.discount ? "discounted" : randomStatus, "\">\n        $").concat(product.discount
            ? "<strong class=\"oldPrice\">".concat(product.price, "</strong>") +
                " <strong class=\"newPrice\">$".concat((product.price -
                    (product.price * product.discount) / 100).toFixed(2), "</strong>")
            : product.price, "</span>\n        <p data-id=\"").concat(product.id, "\" class=\"status ").concat(product.discount || stateIndex <= 4 ? "inStock" : "outStock", "\"><i class=\"").concat(product.discount || stateIndex <= 4
            ? "fa-solid fa-check"
            : "fa-solid fa-exclamation", "\"></i>").concat(product.discount ? "Discounted" : randomStatus, "</p>\n      </div>\n      ").concat(product.discount
            ? "<p class=\"percentage\">-".concat(product.discount, "%</p>")
            : "", "\n      <button\n        data-id=\"").concat(product.id, "\"\n        data-title=\"").concat(product.title, "\"\n        data-price=\"").concat(product.discount
            ? (product.price -
                (product.price * product.discount) / 100).toFixed(2)
            : product.price, "\"\n        data-status=\"").concat(product.discount
            ? "discounted"
            : stateIndex <= 4
                ? "existing"
                : "notExisting", "\"\n      >").concat(inCartAmount > 0 ? "Remove From Cart" : "Add To Cart", "</button>\n    ");
        productsList.appendChild(productItem);
    });
    var addToCartButtons = document.querySelectorAll("button[data-id]");
    addToCartButtons.forEach(function (button) {
        button.addEventListener("click", addToCart);
    });
    updateCart();
    updateProductsCards();
}
function addToCart(event) {
    var button = event.target;
    var id = button.getAttribute("data-id");
    var title = button.getAttribute("data-title");
    var isPrice = button.getAttribute("data-price");
    var price;
    if (isPrice)
        price = parseFloat(isPrice);
    if (button.getAttribute("data-status") === "notExisting") {
        return;
    }
    var existingItem = cart.find(function (item) { return item.id === id; });
    var quantityItems = document.querySelectorAll("span[data-id]");
    if (existingItem) {
        existingItem.quantity++;
        quantityItems.forEach(function (span) {
            if (span.getAttribute("data-id") === id) {
                span.innerHTML = existingItem.quantity;
            }
        });
    }
    else {
        cart.push({ id: id, title: title, price: price, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart)); // update!!
    updateCart();
    updateProductsCards();
}
function updateCart() {
    var cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = "";
    cart.forEach(function (item) {
        var listItem = document.createElement("li");
        listItem.innerHTML = "\n      <div>\n        <h4>".concat(item.title, "</h4>\n        <span>").concat(item.price, " x <strong data-id=\"").concat(item.id, "\" class=\"").concat(item.quantity <= 5 ? "normal" : item.quantity <= 10 ? "medium" : "high", "\">").concat(item.quantity, " pcs</strong></span>\n      </div>\n      <button class=\"delete-btn\" data-id=\"").concat(item.id, "\">Delete</button>\n      <button onclick=\"oneProductAction(event, 'add')\" class=\"add\" data-id=\"").concat(item.id, "\">+</button>\n      <button onclick=\"oneProductAction(event, 'reduce')\" class=\"remove\" data-id=\"").concat(item.id, "\">-</button>\n    ");
        cartItems.appendChild(listItem);
    });
    var deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach(function (button) {
        button.addEventListener("click", removeFromCart);
    });
    calculateTotal();
}
function removeFromCart(event) {
    var button = event.target;
    var id = button.getAttribute("data-id");
    cart = cart.filter(function (item) { return item.id !== id; });
    localStorage.setItem("cart", JSON.stringify(cart));
    updateProductsCards();
    updateCart();
}
function oneProductAction(event, action) {
    var targeted = event.target;
    var targetedProduct = cart.find(function (item) { return item.id === targeted.getAttribute("data-id"); });
    action === "add" ? targetedProduct.quantity++ : targetedProduct.quantity--;
    if (targetedProduct.quantity === 0) {
        var button = event.target;
        var id_1 = button.getAttribute("data-id");
        cart = cart.filter(function (item) { return item.id !== id_1; });
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCart();
    }
    var strong = document.querySelector("strong[data-id=\"".concat(targeted.getAttribute("data-id"), "\"]"));
    if (strong) {
        strong.className =
            targetedProduct.quantity <= 5
                ? "normal"
                : targetedProduct.quantity <= 10
                    ? "medium"
                    : "high";
        strong.innerHTML = "".concat(targetedProduct.quantity, " pcs");
    }
    calculateTotal();
    localStorage.setItem("cart", JSON.stringify(cart));
    updateProductsCards();
}
function calculateTotal() {
    var cartTotal = document.querySelector(".totalAmount");
    var total = cart.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
    }, 0);
    cartTotal.innerHTML = "$" + total.toFixed(2);
}
function ratingSystem(products) {
    var ratingSpans = document.querySelectorAll(".rating");
    products.forEach(function (product, index) {
        var starsNumber = Math.trunc(product.rating);
        var starIcon = "<i class=\"fa-regular fa-star\"></i>\n";
        var fullNumberStars = starIcon.repeat(starsNumber);
        if (product.rating - starsNumber > 0) {
            fullNumberStars += "<i class=\"fa-regular fa-star-half\"></i>";
        }
        ratingSpans[index].innerHTML = fullNumberStars;
    });
}
function updateProductsCards() {
    var productCards = document.querySelectorAll(".product");
    productCards.forEach(function (card) {
        var _a;
        var id = (_a = card.querySelector("button")) === null || _a === void 0 ? void 0 : _a.getAttribute("data-id");
        var inCartAmountElement = card.querySelector(".in-cart-amount");
        var cartItem = cart.find(function (item) { return item.id === id; });
        inCartAmountElement.innerHTML = cartItem
            ? "[ <span>".concat(cartItem.quantity, "</span> ] In Cart")
            : "";
    });
}
var themeIcon = document.querySelector(".theme-icon");
var theme = document.querySelector(".navigator");
var lightTheme = document.querySelector(".lightTheme");
var darkTheme = document.querySelector(".darkTheme");
themeIcon.addEventListener("click", function () {
    if (lightTheme.classList.contains("active"))
        setDark();
    else
        setLight();
});
setTheme();
function setLight() {
    darkTheme.classList.remove("active");
    theme.style.left = "3px";
    theme.style.backgroundColor = "#ff9800c9";
    lightTheme.classList.add("active");
    document.body.classList.remove("dark-theme");
    localStorage.setItem("theme", "light");
}
function setDark() {
    lightTheme.classList.remove("active");
    theme.style.left = "42px";
    theme.style.backgroundColor = "#78909cb8";
    darkTheme.classList.add("active");
    document.body.classList.add("dark-theme");
    localStorage.setItem("theme", "dark");
    document.querySelector(".cart").style.border =
        "2px solid #FFF";
}
function setTheme() {
    var themeColor = localStorage.getItem("theme");
    if (themeColor === "dark")
        setDark();
    else
        setLight();
}
var calcScroll = function () {
    var scrollProgress = document.querySelector(".scroll-icon");
    var scrollValue = document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
    var scroll = Math.round((scrollValue * 100) / height);
    if (scrollValue > 100) {
        scrollProgress.style.display = "block";
    }
    else {
        scrollProgress.style.display = "none";
    }
    scrollProgress.addEventListener("click", function () {
        document.documentElement.scrollTop = 0;
    });
    scrollProgress.style.background = "conic-gradient(#007bff ".concat(scroll, "%, #DDD ").concat(scroll, "%)");
};
window.onscroll = calcScroll;
window.onload = calcScroll;
var cartDiv = document.querySelector(".cart");
var cartIcon = document.querySelector(".cart-icon");
cartIcon.addEventListener("click", function () {
    cartDiv.classList.toggle("cartToLeft");
});
window.addEventListener("DOMContentLoaded", bringData);
