// load laij trang web moi lan chay
window.onload = on_load;

// load databases moi lan mo trang wed
function on_load() {
    initialize_database();
    fetch_database();
    get_product();

    //kiem tra dang nhap hay chua
    var account_id = localStorage.getItem("account_id");

    //check thu xem neu account_id khac rong thi mình sẽ gọi function login_success nó co san con so 1 thì nó show ra, neu kh co = "" thì login_fail
    if (account_id != "") {
        login_success();
    } else {
        logout();
    }
}

// show ra cai san pham
// lay du lieu tu database ra cho nen phai goi db.transaction ra
function get_product() {
    db.transaction(function(tx) {
        var query = `
         SELECT p.id, p.name, p.price, c.name AS category_name
         FROM product p, category c
         WHERE p.category_id = c.id
         `;

        tx.executeSql(
            query, [],
            function(tx,
                result) {
                show_product(result.rows);
            },
            transaction_error);
    });
}

function show_product(products) {
    var product_list = document.getElementById("product-list");

    for (var product of products) {
        product_list.innerHTML += `
      <div class="col-6 col-sm-4 col-lg-3 mt-3 p-3 product">
        <div class="product-img">
         <img src="img/product.jpeg" alt="${product.name}">
        </div>
      
        <div class="product-name">${product.name}</div>
        <div class="product-category">${product.category_name} VNĐ</div>
        <div class="product-price">${product.price} VNĐ</div>
      
        <div class="text-end">
         <button onclick="add_to_cart(this.id)" id="${product.id}" class="btn btn-success btn-sm">Add to Cart</button>
        </div>
      </div>
  `;
    }
}

//chay cai envent cua cai nut btn cart.
function add_to_cart(product_id) {
    add_cart_database(product_id);
}

//them san pham vao database
function add_cart_database(product_id) {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function(tx) {
        var query = `INSERT INTO cart (account_id, product_id, quantity) VALUES (?,?,?)`;

        tx.executeSql(
            query, [account_id, product_id, 1],
            function(tx, result) {
                log(`INFO`, `Insert cart successfully.`);
            },
            transaction_error
        );
    });
}

// var frm_login= document.getElementById("frm-login");
// frm_login.onsubmit = login;
document.getElementById("frm-login").onsubmit = login;

function login(e) {
    e.preventDefault();

    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Get value from <input>.
    db.transaction(function(tx) {
        var query = `SELECT * FROM account WHERE username = ? AND password = ?`;

        tx.executeSql(query, [username, password], function(tx, result) {
                if (result.rows[0]) {
                    $("#frm_login").modal("hide");

                    //key,ket qua.id lay id
                    localStorage.setItem("account_id", result.rows[0].id);
                    localStorage.setItem("account_username", result.rows[0].username);

                    // dang nhap thanh cong
                    login_success();
                } else {
                    alert("Login failed.");

                    //neu login kh thanh cong
                    logout();
                }
            },
            transaction_error);
    });
}

// muốn điền tên lúc đăng nhập vô, no se tim trong localStorage tìm username
function login_success() {
    var username = localStorage.getItem("account_username");

    document.getElementById("account-info").innerHTML = `
     <button class="btn ms-3 disable text-light">Hello ${username} !</button>
     <button onclick="logout()" class="btn btn-outline-light ms-3">Logout</button>
    `;
}

// khi user logout thì nó sẽ show nút login này lên
function logout() {
    localStorage.setItem("account_id", "");
    localStorage.setItem("account_username", "");

    document.getElementById("account-info").innerHTML = `
    <button type="submit" class="btn btn-outline-light ms-3" data-bs-toggle="modal" data-bs-target="#frm-login">Login</button> 
    `;
}