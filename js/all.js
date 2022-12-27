/* eslint-disable no-unused-vars */
const productList = document.querySelector('.productList');
const selectProductBtn = document.querySelector('.selectProductBtn');
const cartList = document.querySelector('.cartList');
const cartTotal = document.querySelector('.cartTotal');
const delAllBtn = document.querySelector('.delAllBtn');
const submitOrder = document.querySelector('.submitOrder');

// 設置表單驗證規則
const constraints = {
  orderName: {
    presence: true,
    length: {
      minimum: 1,
      message: 'must be at least 1 characters',
    },
  },
  orderPhone: {
    presence: true,
    format: {
      pattern: '^09[0-9]{8}$',
    },
  },
  orderEmail: {
    presence: true,
    email: true,
  },
  orderAddress: {
    presence: true,
    length: {
      minimum: 1,
      message: 'must be at least 1 characters',
    },
  },
};

let productData = [];
let cartData = [];

// 產品相關(客戶) : 取得產品列表
const getProductList = () => {
  // eslint-disable-next-line no-undef
  axios
    .get(
      // eslint-disable-next-line no-undef
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/products`,
    )
    .then((response) => {
      productData = response.data.products;
      // eslint-disable-next-line no-console
      console.log(productData);
      // eslint-disable-next-line no-use-before-define
      renderProductList();
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });
};

const render = (item) => `<li class="w-[22%] mr-[26px] mb-7">
            <div class="bg-cover bg-center w-full h-[302px] relative"
                style="background-image: url(${item.images})">
                <div
                    class="text-xl bg-black text-white text-center px-3 py-2 w-[88px] h-[44px] absolute top-3 right-[-5px]">
                    新品</div>
            </div>
            <input type="button" href="#" class="cursor-pointer text-xl mb-2 bg-black text-white py-2 block text-center w-full hover:bg-primary" data-id="${
  item.id
}" value="加入購物車">
            <h3 class="text-xl mb-2">${item.title}</h3>
            <p class="text-xl line-through">NT$${Number(
    item.origin_price,
  ).toLocaleString()}</p>
            <p class="text-[28px]">NT$${Number(item.price).toLocaleString()}</p>
          </li>`;

// 渲染產品列表
const renderProductList = () => {
  let str = '';
  // eslint-disable-next-line array-callback-return
  productData.map((item) => {
    str += render(item);
  });
  productList.innerHTML = str;
};

// 產品篩選
selectProductBtn.addEventListener('change', (e) => {
  e.preventDefault();

  const category = e.target.value;
  if (category === '全部') {
    renderProductList();
    return;
  }

  let str = '';
  // eslint-disable-next-line array-callback-return
  productData.map((item) => {
    if (category === item.category) {
      str += render(item);
    }
  });
  productList.innerHTML = str;
});

// 加入購物車
productList.addEventListener('click', (e) => {
  e.preventDefault();
  if (e.target.type !== 'button') {
    return;
  }

  const cartId = e.target.getAttribute('data-id');
  let cartNum = 1;
  // eslint-disable-next-line array-callback-return
  cartData.map((item) => {
    if (item.product.id === cartId) {
      // eslint-disable-next-line no-multi-assign, no-param-reassign
      cartNum = item.quantity += 1;
    }
  });

  // eslint-disable-next-line no-undef
  swal({
    title: '加入購物車成功!',
    icon: 'success',
    button: '確定',
  });

  // eslint-disable-next-line no-console
  console.log(cartData);
  // eslint-disable-next-line no-use-before-define
  addCartAxios(cartId, cartNum);
});

// 購物車相關(客戶) : 加入購物車列表
const addCartAxios = (cartId, cartNum) => {
  // eslint-disable-next-line no-undef
  axios
    .post(
      // eslint-disable-next-line no-undef
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`,
      {
        data: {
          productId: cartId,
          quantity: cartNum,
        },
      },
    )
    .then((response) => {
      // eslint-disable-next-line no-use-before-define
      getCartList();
    });
};

// 購物車相關(客戶) : 取得購物車列表
const getCartList = () => {
  // eslint-disable-next-line no-undef
  axios
    .get(
      // eslint-disable-next-line no-undef
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`,
    )
    .then((response) => {
      // 成功會回傳的內容
      cartData = response.data.carts;
      // eslint-disable-next-line no-console
      console.log(cartData);
      cartTotal.textContent = Number(response.data.finalTotal).toLocaleString();
      // 渲染購物車列表
      let str = '';
      // eslint-disable-next-line array-callback-return
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
                    NT$${Number(item.product.price).toLocaleString()}
                </td>
                <td width="20%">
                ${item.quantity}
                </td>
                <td width="20%">
                    NT$${Number(
    item.product.price * item.quantity,
  ).toLocaleString()}
                </td>
                <td width="10%" class="text-center cursor-pointer hover:text-primary">  
                  <span class="material-icons" data-id="${item.id}">
                  delete
                  </span> 
                </td>
            </tr>`;
      });
      if (str === '') {
        cartList.innerHTML = ` <tr class="text-center text-[#bfbfbf] font-normal">
                                  <td colspan="5" class="py-16">購物車內目前無品項</td>
                               </tr>`;
      } else {
        cartList.innerHTML = str;
      }
    });
};

// 刪除購物車單一品項
cartList.addEventListener('click', (e) => {
  e.preventDefault();

  // eslint-disable-next-line no-console
  console.log(e.target);
  const cartId = e.target.getAttribute('data-id');
  if (cartId == null) {
    return;
  }

  // eslint-disable-next-line no-undef
  swal({
    title: '刪除商品',
    text: '確定要刪除此筆購物車商品?',
    icon: 'warning',
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      // eslint-disable-next-line no-undef
      swal('您的購物車商品已刪除', {
        icon: 'success',
      });
      // eslint-disable-next-line no-use-before-define
      delItemCartAxios(cartId);
    }
  });
});

// 購物車相關(客戶) : 刪除購物車單一品項列表
const delItemCartAxios = (cartId) => {
  // eslint-disable-next-line no-undef
  axios
    .delete(
      // eslint-disable-next-line no-undef
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts/${cartId}`,
    )
    .then((response) => {
      getCartList();
    });
};

// 刪除購物車所有品項
delAllBtn.addEventListener('click', (e) => {
  e.preventDefault();

  if (cartData.length !== 0) {
    // eslint-disable-next-line no-undef
    swal({
      title: '刪除商品',
      text: '確定要刪除購物車內的所有商品?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        // eslint-disable-next-line no-undef
        swal('您的購物車商品已全部刪除', {
          icon: 'success',
        });
        // eslint-disable-next-line no-use-before-define
        delAllCartAxios();
      }
    });
  } else {
    // eslint-disable-next-line no-undef
    swal({
      title: '已全部刪除',
      text: '購物車商品已全數刪除，請勿重複點擊!',
      icon: 'success',
      button: '確定',
    });
  }
});

// 購物車相關(客戶) : 刪除購物車單一品項列表
const delAllCartAxios = () => {
  // eslint-disable-next-line no-undef
  axios
    .delete(
      // eslint-disable-next-line no-undef
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`,
    )
    .then((response) => {
      getCartList();
    });
};

// 送出訂單
submitOrder.addEventListener('click', (e) => {
  e.preventDefault();

  if (cartData.length === 0) {
    // eslint-disable-next-line no-undef
    swal({
      title: '請加入購物車',
      icon: 'success',
      button: '確定',
    });
    return;
  }

  // 表單驗證
  const orderName = document.querySelector('#orderName').value;
  const orderPhone = document.querySelector('#orderPhone').value;
  const orderEmail = document.querySelector('#orderEmail').value;
  const orderAddress = document.querySelector('#orderAddress').value;
  const orderTrade = document.querySelector('#orderTrade').value;
  const orderError = document.querySelectorAll('.orderError');
  const inputs = document.querySelectorAll('input[id]');

  // 出現必填提示
  inputs.forEach((item, index) => {
    // console.log(orderError);
    if (item.value === '') {
      orderError[index].innerHTML = `${orderError[index].dataset.message}必填`;
    } else {
      orderError[index].innerHTML = '　';
    }
  });

  // eslint-disable-next-line no-use-before-define
  submitOrderAxios(orderName, orderPhone, orderEmail, orderAddress, orderTrade);
});

const submitOrderAxios = (
  orderName,
  orderPhone,
  orderEmail,
  orderAddress,
  orderTrade,
) => {
  // 表單驗證
  const orderForm = document.querySelector('#orderForm');
  // eslint-disable-next-line no-undef
  const errors = validate(orderForm, constraints);
  if (errors === undefined) {
    // eslint-disable-next-line no-undef
    axios
      .post(
        // eslint-disable-next-line no-undef
        `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/orders`,
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
        },
      )
      .then((response) => {
        orderForm.reset();
        // eslint-disable-next-line no-undef
        swal({
          title: '訂單送出成功!',
          icon: 'success',
          button: '確定',
        });
        getCartList();
      })
      .catch((error) => {
        // eslint-disable-next-line no-undef
        swal('Oops!', `${error.response.data.message}`, 'error');
      });
  } else {
    // eslint-disable-next-line no-undef
    swal('請確實填寫預訂資料!', `${Object.values(errors)}`, 'error');
  }
};

getProductList();
getCartList();

// 好評推薦 swiper
// eslint-disable-next-line no-undef
const swiper = new Swiper('.mySwiper', {
  slidesPerView: 3,
  spaceBetween: 30,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
});
