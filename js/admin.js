const orderList = document.querySelector(".orderList");
const delOrderBtn = document.querySelector(".delOrderBtn");

let orderData = [];

// 全產品類別營收比重圖表
const renderProductCategory = () => {
  // 把物件資料整理成陣列資料
  // 取得產品類別及收入
  let productCategoryObj = {};
  orderData.map((item) => {
    item.products.map((productItem) => {
      if (productCategoryObj[productItem.category] === undefined) {
        productCategoryObj[productItem.category] =
          productItem.price * productItem.quantity;
      } else {
        productCategoryObj[productItem.category] +=
          productItem.price * productItem.quantity;
      }
    });
  });
  // console.log(productCategoryObj);

  // 做資料關聯
  let categoryKeys = Object.keys(productCategoryObj);
  let newProductCategory = [];
  categoryKeys.map((item) => {
    let ary = [];
    ary.push(item);
    ary.push(productCategoryObj[item]);
    newProductCategory.push(ary);
  });

  let productCategoryChart = c3.generate({
    bindto: "#productCategory",
    data: {
      columns: newProductCategory,
      type: "pie",
    },
    color: {
      pattern: ["#deb64c", "#02b7f4", "#8565cc"],
    },
  });
};

// 全品項營收比重圖表
const product = () => {
  // 把物件資料整理成陣列資料
  // 取得產品品項及收入
  let productObj = {};
  orderData.map((item) => {
    item.products.map((item) => {
      if (productObj[item.title] === undefined) {
        productObj[item.title] = item.price * item.quantity;
      } else {
        productObj[item.title] += item.price * item.quantity;
      }
    });
  });
  // console.log(productObj);

  // 做資料關聯
  let productKeys = Object.keys(productObj);
  let newProduct = [];
  productKeys.map((item) => {
    let ary = [];
    ary.push(item);
    ary.push(productObj[item]);
    newProduct.push(ary);
  });

  // 比大小 : 降冪排列
  newProduct.sort((a, b) => {
    return b[1] - a[1];
  });
  // console.log(newProduct);

  // 營收前 3 名 + 其餘類別統整為其他
  if (newProduct.length > 3) {
    let otherRevenue = 0;
    newProduct.map((item, index) => {
      if (index > 2) {
        otherRevenue += newProduct[index][1];
      }
    });
    newProduct.splice(3, newProduct.length - 1);
    newProduct.push(["其他", otherRevenue]);
    // console.log(newProduct);
  }

  let productChart = c3.generate({
    bindto: "#product",
    data: {
      columns: newProduct,
      type: "pie",
    },
    color: {
      pattern: ["#f4cf00", "#7bb001", "#07b6f5", "#f54ea9"],
    },
  });
};

// 訂單相關(管理者) : 取得訂單列表
const getOrderList = () => {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then((response) => {
      orderData = response.data.orders;
      console.log(orderData);
      let str = "";
      orderData.map((item) => {
        // 組時間字串
        const turnTime = new Date(item.createdAt * 1000);
        const orderTime = `${turnTime.getFullYear()}/${
          turnTime.getMonth() + 1
        }/${turnTime.getDate()}`;

        // 組產品字串
        let productStr = "";
        item.products.map((productItem) => {
          productStr += `<p>${productItem.title}*${productItem.quantity}</p>`;
        });

        // 判斷訂單處理狀態
        const orderStatus = item.paid == true ? "已處理" : "未處理";

        // 組訂單字串
        str += ` <tr>
                    <td class="border border-black">${item.createdAt}</td>
                    <td class="border border-black">${item.user.name}<br>${item.user.tel}</td>
                    <td class="border border-black">${item.user.address}</td>
                    <td class="border border-black">${item.user.email}</td>
                    <td class="border border-black">${productStr}</td>
                    <td class="border border-black">${orderTime}</td>
                    <td class="border border-black text-info underline cursor-pointer">
                      <a href="#" class="orderStatus" data-id="${item.id}" data-status="${item.paid}"> ${orderStatus} </a>
                    </td>
                    <td class="border border-black text-center">
                        <input type="button" value="刪除" class="delOrderBtn bg-warn text-white px-4 py-2 cursor-pointer rounded" data-id="${item.id}">
                    </td>
                </tr>`;
      });

      if (str === "") {
        orderList.innerHTML = ` <tr class="text-center text-[#bfbfbf]">
                                  <td colspan="8" class="py-16">目前無訂單</td>
                               </tr>`;
      } else {
        orderList.innerHTML = str;
      }

      
      // orderList.innerHTML = str;
      renderProductCategory();
      product();
    });
};

getOrderList();

// 監聽 : 訂單狀態處理 & 刪除單筆訂單
orderList.addEventListener("click", (e) => {
  e.preventDefault();
  let targetClass = e.target.getAttribute("class");
  let id = e.target.getAttribute("data-id");
  let targetType = e.target.type;

  // 修改訂單狀態
  if (targetClass === "orderStatus") {
    let status = e.target.getAttribute("data-status");
    modifyOrderStatus(status, id);
    return;
  }

  // 刪除單筆訂單
  if (targetType === "button") {
    delOrderItem(id);
    return;
  }
});

// 監聽 : 刪除全部訂單
delOrderBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let targetType = e.target.type;

  if (targetType === "button") {
    delOrder();
    return;
  }
});

// 訂單相關(管理者) : 修改訂單狀態
const modifyOrderStatus = (status, id) => {
  let newStatus = status === true ? false : true;

  axios
    .put(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        data: {
          id: id,
          paid: newStatus,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then((response) => {
      swal({
        title: "訂單修改成功!",
        icon: "success",
        button: "確定",
      });
      getOrderList();
    });
};

// 訂單相關(管理者) : 刪除單筆訂單
const delOrderItem = (id) => {
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then((response) => {
      swal({
        title: "訂單修改成功!",
        icon: "success",
        button: "確定",
      });
      getOrderList();
    });
};

// 訂單相關(管理者) : 刪除全部訂單
const delOrder = () => {
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then((response) => {
      swal({
        title: "訂單已被全部刪除!",
        icon: "success",
        button: "確定",
      });
      getOrderList();
    })
    .catch((error) => {
      swal({
        title: "目前無訂單，請勿重複點擊!",
        icon: "success",
        button: "確定",
      });
    });
};
