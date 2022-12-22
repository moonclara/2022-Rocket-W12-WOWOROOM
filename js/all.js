const productList = document.querySelector(".productList");
const selectProductBtn = document.querySelector(".selectProductBtn");
const cartList = document.querySelector(".cartList");
const cartTotal = document.querySelector(".cartTotal");
const delAllBtn = document.querySelector(".delAllBtn");
const submitOrder = document.querySelector(".submitOrder");

let productData = [];
let cartData = [];

// 產品相關(客戶) : 取得產品列表
const getProductList = () => {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then((response) => {
      // 成功會回傳的內容
      // console.log(response);
      // console.log(response.data);
      productData = response.data.products;
      console.log(productData);
      renderProductList();
    })
    .catch((error) => {
      // 失敗會回傳的內容
      console.log(error);
    });
};

const render = (item) => {
  return `<li class="w-[22%] mr-[26px] mb-7">
            <div class="bg-cover bg-center w-full h-[302px] relative"
                style="background-image: url(${item.images})">
                <div
                    class="text-xl bg-black text-white text-center px-3 py-2 w-[88px] h-[44px] absolute top-3 right-[-5px]">
                    新品</div>
            </div>
            <input type="button" href="#" class="cursor-pointer text-xl mb-2 bg-black text-white py-2 block text-center w-full hover:bg-primary" data-id="${item.id}" value="加入購物車">
            <h3 class="text-xl mb-2">${item.title}</h3>
            <p class="text-xl line-through">NT$${item.origin_price}</p>
            <p class="text-[28px]">NT$${item.price}</p>
          </li>`;
};

// 渲染產品列表
const renderProductList = () => {
  let str = "";
  productData.map((item) => {
    str += render(item);
  });
  productList.innerHTML = str;
};

// 產品篩選
selectProductBtn.addEventListener("change", (e) => {
  e.preventDefault();

  let category = e.target.value;
  if (category === "全部") {
    renderProductList();
    return;
  }

  let str = "";
  productData.map((item) => {
    if (category === item.category) {
      str += render(item);
    }
  });
  productList.innerHTML = str;
});

// 加入購物車
productList.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.type !== "button") {
    return;
  }

  let cartId = e.target.getAttribute("data-id");
  let cartNum = 1;
  cartData.map((item) => {
    if (item.product.id === cartId) {
      cartNum = item.quantity += 1;
    }
  });

  addCartAxios(cartId, cartNum);
});

// 購物車相關(客戶) : 加入購物車列表
const addCartAxios = (cartId, cartNum) => {
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: cartId,
          quantity: cartNum,
        },
      }
    )
    .then((response) => {
      alert("加入購物車成功");
      getCartList();
    });
};

// 購物車相關(客戶) : 取得購物車列表
const getCartList = () => {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      // 成功會回傳的內容
      cartData = response.data.carts;
      console.log(cartData);
      cartTotal.textContent = response.data.finalTotal;
      // 渲染購物車列表
      let str = "";
      cartData.map((item) => {
        str += `<tr class="border-b-2 border-[#bfbfbf]">
                <td width="30%">
                    <div class="flex items-center">
                        <img class="pr-4 w-[80px] h-[80px]" src="${
                          item.product.images
                        }" alt="">
                        <p class="pr-4">${item.product.title}</p>
                    </div>
                </td>
                <td width="20%">
                    NT$${item.product.price}
                </td>
                <td width="20%">
                ${item.quantity}
                </td>
                <td width="20%">
                    NT$${item.product.price * item.quantity}
                </td>
                <td width="10%" class="text-center cursor-pointer hover:text-primary">  
                  <span class="material-icons" data-id="${item.id}">
                  close
                  </span> 
                </td>
            </tr>`;
      });
      cartList.innerHTML = str;
    });
};

// 刪除購物車單一品項
cartList.addEventListener("click", (e) => {
  e.preventDefault();

  let cartId = e.target.getAttribute("data-id");
  if (cartId == null) {
    return;
  }

  delItemCartAxios(cartId);
});

// 購物車相關(客戶) : 刪除購物車單一品項列表
const delItemCartAxios = (cartId) => {
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`
    )
    .then((response) => {
      alert("單筆刪除成功");
      getCartList();
    });
};

// 刪除購物車所有品項
delAllBtn.addEventListener("click", (e) => {
  e.preventDefault();

  delAllCartAxios();
});

// 購物車相關(客戶) : 刪除購物車單一品項列表
const delAllCartAxios = () => {
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then((response) => {
      alert("刪除成功");
      getCartList();
    })
    .catch((error) => {
      alert("購物車已刪除，請勿重複點擊");
    });
};

// 送出訂單
submitOrder.addEventListener("click", (e) => {
  e.preventDefault();

  if (cartData.length == 0) {
    alert("請加入購物車");
    return;
  }

  const orderName = document.querySelector("#orderName").value;
  const orderPhone = document.querySelector("#orderPhone").value;
  const orderEmail = document.querySelector("#orderEmail").value;
  const orderAddress = document.querySelector("#orderAddress").value;
  const orderTrade = document.querySelector("#orderTrade").value;
  if (
    orderName == "" ||
    orderPhone == "" ||
    orderEmail == "" ||
    orderAddress == "" ||
    orderTrade == ""
  ) {
    alert("請確實填寫預定資料");
    return;
  }

  submitOrderAxios(orderName, orderPhone, orderEmail, orderAddress, orderTrade);
});

// 訂單相關(客戶)
const submitOrderAxios = (orderName, orderPhone, orderEmail, orderAddress, orderTrade) => {
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
      {
        data: {
          user: {
            name: orderName,
            tel: orderPhone,
            email: orderEmail,
            address: orderAddress,
            payment: orderTrade,
          },
        },
      }
    )
    .then((response) => {
      alert("訂單送出成功");
      orderName == "";
      orderPhone == "";
      orderEmail == "";
      orderAddress == "";
      orderTrade == "ATM";
      getCartList();
    });
};

getProductList();
getCartList();
