const orderList = document.querySelector(".orderList");

let orderData = [];

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

      let str = "";
      orderData.map((item) => {
        // 判斷訂單處理狀態
        const orderStatus = item.paid == true ? '已處理' : '未處理' ;

        // 組訂單字串
        str += ` <tr>
                    <td class="border border-black">${item.createdAt}</td>
                    <td class="border border-black">${item.user.name}<br>${item.user.tel}</td>
                    <td class="border border-black">${item.user.address}</td>
                    <td class="border border-black">${item.user.email}</td>
                    <td class="border border-black">Louvre 雙人床架</td>
                    <td class="border border-black">2021/03/08</td>
                    <td class="border border-black">${orderStatus}</td>
                    <td class="border border-black text-center">
                        <input type="button" value="刪除" class="bg-[#c44021] text-white px-4 py-2">
                    </td>
                </tr>`;
      });
      orderList.innerHTML = str;
    });
};

getOrderList();
