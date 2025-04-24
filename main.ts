let searchBar = document.querySelector(".searchBar") as HTMLInputElement;

let cart = JSON.parse(localStorage.getItem("cart") ?? "[]");

function searchingFilter(products: Product[], event: KeyboardEvent) {
  let lookingFor = searchBar.value.toLowerCase().trim();
  if (searchBar.value.startsWith(" ")) {
    searchBar.value = "";
    return;
  }
  if (lookingFor.length > 0) {
    let searchingList: Product[] = [];
    products.forEach((product) => {
      let productTitle = product.title.toLowerCase();
      if (productTitle.match(lookingFor)) {
        searchingList.push(product);
      }
    });
    renderProducts(searchingList);
  }
}

function bringData() {
  fetch("./products.json")
    .then((response) => {
      const data = response.json();
      return data;
    })
    .then((products: Product[]) => {
      navCategoriesItems(products);
      renderProducts(products);
      ratingSystem(products);
      searchBar.addEventListener("keyup", (event) => {
        searchingFilter(products, event);
      });
    })
    .catch((Error) => {
      new Error("something wrong");
    });
}

interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number;
  discount?: number;
  rating: number;
}

interface ProductWithQuantity extends Pick<Product, "id" | "title" | "price"> {
  quantity: number;
}

function navCategoriesItems(products: Product[]) {
  const navList = document.querySelector(".navList") as HTMLUListElement;
  const allCategories: string[] = [];
  const allProductsItem = document.createElement("li");
  allProductsItem.className = "nav-item active";
  allProductsItem.innerHTML = "All Products";
  allProductsItem.setAttribute("data-name", "allProducts");
  navList.appendChild(allProductsItem);
  allProductsItem.addEventListener("click", () => {
    if (allProductsItem.classList.contains("active")) {
      return;
    }
    updateActiveCategory(allProductsItem);
    renderProducts(products);
  });
  products.forEach((product) => {
    allCategories.push(product.category);
  });
  const uniqueCategories = Array.from(new Set(allCategories));
  uniqueCategories.forEach((item: string) => {
    const navItem = document.createElement("li");
    navItem.className = "nav-item";
    navItem.innerHTML = item;
    navItem.setAttribute("data-name", item);
    navItem.addEventListener("click", () => {
      if (navItem.classList.contains("active")) {
        return;
      }
      updateActiveCategory(navItem);
      const filteredProducts = products.filter(
        (product) => product.category === item
      );
      renderProducts(filteredProducts);
    });
    navList.appendChild(navItem);
  });

  function updateActiveCategory(activeItem: HTMLLIElement) {
    const navbarItems = navList.querySelectorAll(".nav-item");
    navbarItems.forEach((item) => item.classList.remove("active"));
    activeItem.classList.add("active");
  }
}

function renderProducts(products: Product[]) {
  const allStatus = [
    "In Stock",
    "Available",
    "Limited Stock",
    "Ships Soon",
    "Pre-order",
    "Out of Stock",
    "Removed",
  ];

  const productsList = document.querySelector(".products") as HTMLDivElement;
  productsList.innerHTML = "";

  products.forEach((product: Product) => {
    const randomStatus =
      allStatus[Math.floor(Math.random() * allStatus.length)];
    const stateIndex = allStatus.indexOf(randomStatus);
    const productItem = document.createElement("div");
    productItem.className = "product";
    const cartItem: ProductWithQuantity = cart.find(
      (item: ProductWithQuantity) => item.id === product.id
    );
    const inCartAmount: number = cartItem ? cartItem.quantity : 0;

    productItem.innerHTML = `
      <span class="id">${product.id}</span>
      <img src="./imgs/${product.image}" alt="${product.title}"></img>
      <h3 class="title">${product.title}</h3>
      <p class="description">
      <span>${product.description}</span>
      <span class="rating"></span>
      <span class="in-cart-amount">${
        inCartAmount ? `[ <span>${inCartAmount}</span> ] In Cart` : ""
      }</span>
      </p>
      <div class="price-quantity">
        <span class="price 
        ${product.discount ? "discounted" : randomStatus}">
        $${
          product.discount
            ? `<strong class="oldPrice">${product.price}</strong>` +
              ` <strong class="newPrice">$${(
                product.price -
                (product.price * product.discount) / 100
              ).toFixed(2)}</strong>`
            : product.price
        }</span>
        <p data-id="${product.id}" class="status ${
      product.discount || stateIndex <= 4 ? "inStock" : "outStock"
    }"><i class="${
      product.discount || stateIndex <= 4
        ? "fa-solid fa-check"
        : "fa-solid fa-exclamation"
    }"></i>${product.discount ? "Discounted" : randomStatus}</p>
      </div>
      ${
        product.discount
          ? `<p class="percentage">-${product.discount}%</p>`
          : ""
      }
      <button
        data-id="${product.id}"
        data-title="${product.title}"
        data-price="${
          product.discount
            ? (
                product.price -
                (product.price * product.discount) / 100
              ).toFixed(2)
            : product.price
        }"
        data-status="${
          product.discount
            ? "discounted"
            : stateIndex <= 4
            ? "existing"
            : "notExisting"
        }"
      >${inCartAmount > 0 ? "Remove From Cart" : "Add To Cart"}</button>
    `;

    productsList.appendChild(productItem);
  });

  const addToCartButtons = document.querySelectorAll(
    "button[data-id]"
  ) as NodeListOf<HTMLButtonElement>;

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", addToCart);
  });

  updateCart();
  updateProductsCards();
}

function addToCart(event: MouseEvent) {
  const button = event.target as HTMLButtonElement;
  const id = button.getAttribute("data-id");
  const title = button.getAttribute("data-title");
  const isPrice = button.getAttribute("data-price");
  let price;
  if (isPrice) price = parseFloat(isPrice);

  if (button.getAttribute("data-status") === "notExisting") {
    return;
  }
  const existingItem = cart.find((item: ProductWithQuantity) => item.id === id);
  const quantityItems = document.querySelectorAll(
    "span[data-id]"
  ) as NodeListOf<HTMLSpanElement>;

  if (existingItem) {
    existingItem.quantity++;
    quantityItems.forEach((span) => {
      if (span.getAttribute("data-id") === id) {
        span.innerHTML = existingItem.quantity;
      }
    });
  } else {
    cart.push({ id, title, price, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart)); // update!!
  updateCart();
  updateProductsCards();
}

function updateCart() {
  const cartItems = document.getElementById("cart-items") as HTMLUListElement;

  cartItems.innerHTML = "";

  cart.forEach((item: ProductWithQuantity) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <div>
        <h4>${item.title}</h4>
        <span>${item.price} x <strong data-id="${item.id}" class="${
      item.quantity <= 5 ? "normal" : item.quantity <= 10 ? "medium" : "high"
    }">${item.quantity} pcs</strong></span>
      </div>
      <button class="delete-btn" data-id="${item.id}">Delete</button>
      <button onclick="oneProductAction(event, 'add')" class="add" data-id="${
        item.id
      }">+</button>
      <button onclick="oneProductAction(event, 'reduce')" class="remove" data-id="${
        item.id
      }">-</button>
    `;

    cartItems.appendChild(listItem);
  });

  const deleteButtons = document.querySelectorAll(
    ".delete-btn"
  ) as NodeListOf<HTMLButtonElement>;
  deleteButtons.forEach((button) => {
    button.addEventListener("click", removeFromCart);
  });

  calculateTotal();
}

function removeFromCart(event: MouseEvent) {
  const button = event.target as HTMLButtonElement;
  const id = button.getAttribute("data-id");
  cart = cart.filter((item: ProductWithQuantity) => item.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateProductsCards();
  updateCart();
}

function oneProductAction(event: MouseEvent, action: string) {
  const targeted = event.target as HTMLButtonElement;
  const targetedProduct = cart.find(
    (item: ProductWithQuantity) => item.id === targeted.getAttribute("data-id")
  );
  action === "add" ? targetedProduct.quantity++ : targetedProduct.quantity--;
  if (targetedProduct.quantity === 0) {
    const button = event.target as HTMLButtonElement;
    const id = button.getAttribute("data-id");
    cart = cart.filter((item: ProductWithQuantity) => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
  }
  const strong = document.querySelector(
    `strong[data-id="${targeted.getAttribute("data-id")}"]`
  ) as HTMLElement;
  if (strong) {
    strong.className =
      targetedProduct.quantity <= 5
        ? "normal"
        : targetedProduct.quantity <= 10
        ? "medium"
        : "high";
    strong.innerHTML = `${targetedProduct.quantity} pcs`;
  }
  calculateTotal();
  localStorage.setItem("cart", JSON.stringify(cart));
  updateProductsCards();
}

function calculateTotal() {
  const cartTotal = document.querySelector(".totalAmount") as HTMLSpanElement;
  const total = cart.reduce(
    (sum: number, item: ProductWithQuantity) =>
      sum + item.price * item.quantity,
    0
  );

  cartTotal.innerHTML = "$" + total.toFixed(2);
}

function ratingSystem(products: Product[]) {
  const ratingSpans = document.querySelectorAll(
    ".rating"
  ) as NodeListOf<HTMLSpanElement>;

  products.forEach((product, index) => {
    const starsNumber: number = Math.trunc(product.rating);
    const starIcon = `<i class="fa-regular fa-star"></i>\n`;
    let fullNumberStars = starIcon.repeat(starsNumber);
    if (product.rating - starsNumber > 0) {
      fullNumberStars += `<i class="fa-regular fa-star-half"></i>`;
    }
    ratingSpans[index].innerHTML = fullNumberStars;
  });
}

function updateProductsCards() {
  const productCards = document.querySelectorAll(".product");
  productCards.forEach((card) => {
    const id = card.querySelector("button")?.getAttribute("data-id");
    const inCartAmountElement = card.querySelector(
      ".in-cart-amount"
    ) as HTMLSpanElement;
    const cartItem = cart.find((item: ProductWithQuantity) => item.id === id);

    inCartAmountElement.innerHTML = cartItem
      ? `[ <span>${cartItem.quantity}</span> ] In Cart`
      : "";
  });
}

const themeIcon = document.querySelector(".theme-icon") as HTMLDivElement;
const theme = document.querySelector(".navigator") as HTMLDivElement;
const lightTheme = document.querySelector(".lightTheme") as HTMLElement;
const darkTheme = document.querySelector(".darkTheme") as HTMLElement;

themeIcon.addEventListener("click", () => {
  if (lightTheme.classList.contains("active")) setDark();
  else setLight();
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
  (document.querySelector(".cart") as HTMLDivElement).style.border =
    "2px solid #FFF";
}

function setTheme() {
  let themeColor = localStorage.getItem("theme");
  if (themeColor === "dark") setDark();
  else setLight();
}

let calcScroll = () => {
  let scrollProgress = document.querySelector(".scroll-icon") as HTMLDivElement;
  let scrollValue = document.documentElement.scrollTop;

  let height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  let scroll: number = Math.round((scrollValue * 100) / height);

  if (scrollValue > 100) {
    scrollProgress.style.display = "block";
  } else {
    scrollProgress.style.display = "none";
  }
  scrollProgress.addEventListener("click", () => {
    document.documentElement.scrollTop = 0;
  });

  scrollProgress.style.background = `conic-gradient(#007bff ${scroll}%, #DDD ${scroll}%)`;
};

window.onscroll = calcScroll;
window.onload = calcScroll;

const cartDiv = document.querySelector(".cart") as HTMLDivElement;
const cartIcon = document.querySelector(".cart-icon") as HTMLDivElement;

cartIcon.addEventListener("click", () => {
  cartDiv.classList.toggle("cartToLeft");
});

window.addEventListener("DOMContentLoaded", bringData);
