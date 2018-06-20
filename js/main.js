const ordersURL = 'http://localhost:3000/api/Orders/';
const productsPostfix = '/products';
const productsURL = 'http://localhost:3000/api/OrderProducts/';

let myMap;

renderOrders();

document.querySelector('.orders-list').addEventListener('click', showOrderInfo);
document.querySelector('.order-card-tabs').addEventListener('click', showDeliveryInfo);
document.querySelector('.reload').addEventListener('click', handleReloadButton);
document.querySelector('.search-products').addEventListener('search', searchProducts);
document.querySelector('.add-order .submit-btn').addEventListener('click', addOrder);
document.querySelector('.add-product .submit-btn').addEventListener('click', addProduct);
document.querySelector('.order-items table').addEventListener('click', deleteProduct);
document.querySelector('.confirm-order-del').addEventListener('click', deleteOrder);

function renderOrders() {
    serverRequestPromise("GET", ordersURL)
    .then((orders)=>{
        let ul = document.querySelector('.orders-list');

        ul.innerHTML = '';

        orders.forEach(function(order, i) {
            let li = document.createElement("li");
            li.classList.add('order');
            li.setAttribute('data-id', order.id);
                
            let divHeader = document.createElement("div");
            divHeader.className = 'flex-wrapper';
        
            let divInfo = divHeader.cloneNode();
            let pOrderHeader = document.createElement("p");
            pOrderHeader.className = 'order-header';
            pOrderHeader.innerHTML = `Order <span>${order.id}</span>`;
        
            let pCreatedAt = document.createElement("p");
            pCreatedAt.className = 'creation-date';
            pCreatedAt.innerHTML = getDate(order.summary.createdAt);
            divHeader.append(pOrderHeader, pCreatedAt);
    
            let pCustomer = document.createElement("p");
            pCustomer.innerHTML = order.summary.customer;
    
            let pStatus = document.createElement("p");
            pStatus.innerHTML = order.summary.status;
            pStatus.className = order.summary.status.toLowerCase();
            divInfo.append(pCustomer, pStatus);
    
            let pShipped = document.createElement("p");
            pShipped.innerHTML = `Shipped: ${getDate(order.summary.shippedAt)}`;
            li.append(divHeader, divInfo, pShipped);
            ul.appendChild(li);
                        
            if (i == 0) {
                li.classList.add('active');
                getOrderInfoWrapper(order.id);
            }
        });
        document.querySelector('.orders-list-container .header span').innerHTML = orders.length;   
        document.querySelector('.search').addEventListener('click', handleSearchButton(orders));
    })
    .catch(function (error) {
        console.log(error);
    });
}

function serverRequestPromise(method, url, body) {
    return new Promise(function (resolve, reject) {
        let req = new XMLHttpRequest();

        req.open(method, url, true);
        req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        req.addEventListener("load", function () {
            if (req.status < 400) {
                if(req.responseText) {
                    resolve(JSON.parse(req.responseText));
                } else {
                    resolve();
                }
            } else {
                reject(new Error("Request failed: " + req.statusText));
            }
        });

        req.addEventListener("error", function () {
            reject(new Error("Network error"));
        });

        req.send(body);
    });
}

function showOrderInfo(e) {
    let current = findElem(e.target); 

    if(current){
        removeActiveClass(this);
        current.classList.add('active');

        let id = current.getAttribute('data-id');

        getOrderInfoWrapper(id);
    }
}

function getDate(str) {
    str = (str.indexOf('T') > 0) ? str.slice(0, str.indexOf('T')) : str;
    return str.split('-').reverse().join('.');
}

function getOrderInfoWrapper(id) {
    serverRequestPromise("GET", ordersURL + id + productsPostfix)
        .then((products) => {
            let totalPrice = orderPrice(products);

            putOrderPrice(id, totalPrice);
            orderProducts(products);
        })
        .then(() => {
            return serverRequestPromise("GET", ordersURL + id);
        })
        .then((order) => {
            orderInfo(order);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function findElem(target, tag = "LI", stopTag = "UL") {
    let current = target;

    while(current.tagName != tag) {
        if(current.tagName == stopTag) {
            return;
        }
        current = current.parentNode;
    }

    return current;
}

function removeActiveClass(parent) {
    let active = parent.querySelectorAll('.active');
    
    if(active.length > 0) {
        active.forEach(function(elem) {
            elem.classList.remove('active');
        });
    }
}

function orderInfo(order) {
    let orderInfo = document.querySelector('.order-info');
    orderInfo.innerHTML = `<h4>Order ${order.id}</h4> ${order.summary.totalPrice}`;

    let customer = document.querySelector('.js-customer span');
    customer.innerHTML = order.summary.customer;

    let ordered = document.querySelector('.js-ordered span');
    ordered.innerHTML = getDate(order.summary.createdAt);

    let shipped = document.querySelector('.js-shipped span');
    shipped.innerHTML = getDate(order.summary.shippedAt);

    let deliveryName = document.querySelector('.js-del-name');
    deliveryName.setAttribute('placeholder', order.shipTo.name);
    
    let deliveryAddr = document.querySelector('.js-del-addr');
    deliveryAddr.setAttribute('placeholder', order.shipTo.address);

    let deliveryZip = document.querySelector('.js-del-zip');
    deliveryZip.setAttribute('placeholder', order.shipTo.ZIP);

    let deliveryRegion = document.querySelector('.js-del-region');
    deliveryRegion.setAttribute('placeholder', order.shipTo.region);

    let deliveryCountry = document.querySelector('.js-del-country');
    deliveryCountry.setAttribute('placeholder', order.shipTo.country);

    let customerFirstName = document.querySelector('.js-cust-fname');
    customerFirstName.setAttribute('placeholder', order.customerInfo.firstName);

    let customerLastName = document.querySelector('.js-cust-lname');
    customerLastName.setAttribute('placeholder', order.customerInfo.lastName);

    let customerAddr = document.querySelector('.js-cust-addr');
    customerAddr.setAttribute('placeholder', order.customerInfo.address);

    let customerPhone = document.querySelector('.js-cust-phone');
    customerPhone.setAttribute('placeholder', order.customerInfo.phone);

    let customerEmail = document.querySelector('.js-cust-email');
    customerEmail.setAttribute('placeholder', order.customerInfo.email);
    
    document.querySelector('.order-items table tbody').setAttribute('data-order-id', order.id); 

    let address = order.shipTo.country + ', ' + order.shipTo.region + ', ' + order.shipTo.address;       
    ymaps.ready(init);	

    function init() {            
        if(myMap) {
            myMap.destroy();
            myMap = null;
        }
    
        myMap = new ymaps.Map('map', {
            center: [55.776952, 37.389405],
            zoom: 9
        }, {
            searchControlProvider: 'yandex#search'
        });
    
        ymaps.geocode(address, {
            results: 1
        }).then(function (res) {
            let firstGeoObject = res.geoObjects.get(0);
            let	coords = firstGeoObject.geometry.getCoordinates();
            let	bounds = firstGeoObject.properties.get('boundedBy');
    
            firstGeoObject.options.set('preset', 'islands#darkBlueDotIconWithCaption');
    
            firstGeoObject.properties.set('iconCaption', firstGeoObject.getAddressLine());
    
            myMap.geoObjects.add(firstGeoObject);
    
            myMap.setBounds(bounds, {
                checkZoomRange: true
            });
        });
    }          
}

function orderProducts(products) {
    document.querySelector('.order-items header span').innerHTML = products.length;
    document.querySelector('.search-products').value = '';


    let tbody = document.querySelector('.order-items table tbody');
    let template = tbody.querySelector('.undisplayed');

    while (tbody.children.length > 1) {
        tbody.removeChild(tbody.lastChild);
    }

    products.forEach(function(product) {
            let tr = template.cloneNode(true);
            tr.id = product.id;

            tr.classList.remove('undisplayed');
            tr.children[0].innerHTML = `<b>${product.name}</b><p>${product.id}</p>`;
            tr.children[1].innerHTML = `<b>${product.price}</b> ${product.currency}`;
            tr.children[2].innerHTML = product.quantity;
            tr.children[3].innerHTML = `<b>${product.totalPrice}</b> ${product.currency}`;
            tbody.appendChild(tr);
    });
}

function orderPrice(products) {
    return products.reduce((a, b) => {
        return a + Number(b.totalPrice);
    }, 0);    
}

function putOrderPrice(orderId, totalPrice) {
    serverRequestPromise("GET", ordersURL + orderId + '?filter[fields][summary]=true')
        .then((orderInfo) => {
            orderInfo.summary.totalPrice = totalPrice;
            serverRequestPromise("PUT", ordersURL + orderId + '?filter[fields][summary]=true', JSON.stringify(orderInfo));
        });
}

function showDeliveryInfo(e) {
    let current = findElem(e.target);

    if(current){
        removeActiveClass(this);       
        current.classList.add('active');
        current.querySelector('a').classList.add('active'); 
        
        let deliveryInfo = document.querySelectorAll('.js-delivery');
        
        deliveryInfo.forEach(function(section) {
            section.style.display = 'none';
        });
        document.querySelector('.js-delivery.' + current.classList[0]).style.display = 'block';
    }
}

function handleSearchButton(orders) {
    return function() {
        event.preventDefault();

        let input = document.querySelector('.search-field');
        let searchReq = input.value.toLowerCase();
        let ul = document.querySelector('.orders-list');
        let li = ul.getElementsByTagName('li');
        let counter = 0;

        orders.forEach(function(order) {
            let info = order.summary;

            if(
                info.createdAt.toLowerCase().indexOf(searchReq) > -1 || 
                info.customer.toLowerCase().indexOf(searchReq) > -1 ||
                info.status.toLowerCase().indexOf(searchReq) > -1 ||
                info.shippedAt.toLowerCase().indexOf(searchReq) > -1) {
                
                    Array.prototype.forEach.call(li, function(elem) {
                        let id = elem.querySelector('.order-header span');
                
                        if(id.innerHTML == order.id) {
                            elem.style.display = '';
                            counter++;
                        }       
                    });

            } else {
                Array.prototype.forEach.call(li, function(elem) {
                    let id = elem.querySelector('.order-header span');

                    if(id.innerHTML == order.id) {
                        elem.style.display = 'none';
                    }
                });
            }
        });
        document.querySelector('.orders-list-container .header span').innerHTML = counter;
    }
}

function handleReloadButton() {
    let ul = document.querySelector('.orders-list');
    let li = ul.getElementsByTagName('li');

    Array.prototype.forEach.call(li, function(elem) {
        elem.style.display = '';       
    });
    document.querySelector('.orders-list-container .header span').innerHTML = li.length;
}

function searchProducts() {
    let input = document.querySelector('.search-products');
    let filter = input.value.toLowerCase();
    let trs = document.querySelector('.order-items tbody').getElementsByTagName('tr');
    let counter = 0;
    let orderId = getOrderId();

    serverRequestPromise("GET", ordersURL + orderId + productsPostfix)
        .then((products) => {
            products.forEach(function(product) {            
                    if(
                        product.id.toString().indexOf(filter) > -1 || 
                        product.name.toLowerCase().indexOf(filter) > -1 ||
                        product.price.toString().indexOf(filter) > -1 ||
                        product.currency.toLowerCase().indexOf(filter) > -1 ||
                        product.quantity.toString().indexOf(filter) > -1 ||
                        product.totalPrice.toString().indexOf(filter) > -1) {

                            Array.prototype.forEach.call(trs, function(tr) {
                                let id = tr.querySelector('td p').innerHTML;
                        
                                if(id == product.id) {                            
                                    tr.style.display = '';
                                    counter++;
                                }       
                            });

                    } else {
                        Array.prototype.forEach.call(trs, function(tr) {
                            let id = tr.querySelector('td p').innerHTML;
                    
                            if(id == product.id) {
                                tr.style.display = 'none';
                            }
                        });
                    }
                });
            document.querySelector('.order-items header span').innerHTML = counter;
        });   
}

document.querySelector('.order-items table thead').addEventListener('click', function(e) {
    let current = findElem(e.target, "TH", "TR");
    let colName = current.getAttribute('data-col-name');
    let dir = current.getAttribute('data-sort-dir').toUpperCase();
    let newDir = sortTable(colName, dir);

    current.setAttribute('data-sort-dir', newDir.toLowerCase());
});

function sortTable(key, dir) {
    let orderId = getOrderId();
    
    serverRequestPromise("GET", ordersURL + orderId + productsPostfix + '?filter[order]=' + key + '%20' + dir)
        .then((res) => {
            orderProducts(res);
        });
    
    if(dir == 'ASC') {
        return 'DESC';
    } else if(dir == 'DESC') {
        return 'ASC';
    }
} 

document.querySelector('.add-order-btn').addEventListener('click', function(e) {
    document.querySelector('.popup.add-order').style.display = 'block';
});

function addOrder(e) {
    e.preventDefault();

    let form = e.target.parentNode;

    if(validate(form)) {
        let customer = form.customer.value;
        let createdAt = form.createdAt.value;
        let status = form.status.value;
        let shippedAt = form.shippedAt.value;
        let order = JSON.stringify({
            "summary": {
                "createdAt": createdAt,
                "customer": customer,
                "status": status,
                "shippedAt": shippedAt       
            },
            "shipTo": {
                "name": "No information",
                "address": "No information",
                "ZIP": "No information",
                "region": "No information",
                "country": "No information"
            },
            "customerInfo": {
                "firstName": "No information",
                "lastName": "No information",
                "address": "No information",
                "phone": "No information",
                "email": "No information"
            }
        });
        form.reset();

        serverRequestPromise("POST", ordersURL, order)
            .then(() => {
                renderOrders();
            });
    } 
}

document.querySelector('.add-product-btn').addEventListener('click', function(e) {
    document.querySelector('.popup.add-product').style.display = 'block';
});

function addProduct(e) {
    e.preventDefault();

    let form = e.target.parentNode;

    if(validate(form)) {
        let name = form.name.value;
        let price = form.price.value;
        let currency = form.currency.value;
        let quantity = form.quantity.value;       
        let totalPrice = price * quantity;        
        let orderId = getOrderId();
        let product = JSON.stringify({
            "name": name,
            "price": price,
            "currency": currency,
            "quantity": quantity,
            "totalPrice": totalPrice,
            "orderId": orderId  
        });
        form.reset();

        serverRequestPromise("POST", productsURL, product)
            .then(() => {
                getOrderInfoWrapper(orderId);
            });
    }
}

document.querySelector('.delete-order-btn').addEventListener('click', function() {
    document.querySelector('.popup.delete-order').style.display = 'block';
});

function deleteOrder() {
    let orderId = getOrderId();

    serverRequestPromise("DELETE", ordersURL + orderId)
        .then(() => {
            renderOrders();
        });
}

function deleteProduct(e) {
    if(e.target.classList.contains('delete-product-btn')) {
        document.querySelector('.popup.delete-product').style.display = 'block';

        let productId;

        if(e.target.parentNode.tagName == "TR"){
            productId = e.target.parentNode.id;
        } else {
            productId = e.target.parentNode.parentNode.id;
        }

        document.querySelector('.confirm-product-del').addEventListener('click', function() {
            let orderId = getOrderId();
        
            serverRequestPromise("DELETE", ordersURL + orderId + productsPostfix + '/' + productId)
                .then(() => {
                    getOrderInfoWrapper(orderId);
                });
        });
    }
}

window.addEventListener('click', function(e) {
    if(e.target.classList.contains('popup')) {
        e.target.style.display = 'none';
    }
    if(e.target.classList.contains('close-btn')) {
        e.target.parentNode.parentNode.style.display = 'none';
    }
    if(e.target.classList.contains('submit-btn')) {
        e.target.parentNode.parentNode.parentNode.style.display = 'none';
    }
});

document.querySelector('.delivery-info-container').addEventListener('click', function(e) {
    if(e.target.classList.contains('edit-info-btn')) {
        let parent = e.target.parentNode.parentNode;
        let inputs = parent.getElementsByTagName("input");

        Array.prototype.map.call(inputs, function(input) {
            input.removeAttribute('readonly');
        });

        let hiddenBtns = parent.querySelectorAll('.undisplayed');

        hiddenBtns.forEach(function(btn) {
            btn.classList.remove('undisplayed');
        });
    }
    if(e.target.classList.contains('cancel-btn')) {
        let parent = e.target.parentNode;
        let inputs = parent.getElementsByTagName("input");

        Array.prototype.map.call(inputs, function(input) {
            resetError(input.parentNode);
        });
        
        blockInput(parent);
    }
    if(e.target.classList.contains('save-btn')) {        
        e.preventDefault();

        let parent = e.target.parentNode;
        let orderId = getOrderId();

        if(validate(parent)) {

            if(parent.parentNode.classList.contains('shipping-info')) {
                let shipTo = JSON.stringify({
                    "shipTo": {
                        "name": parent.delName.value,
                        "address": parent.delAddr.value,
                        "ZIP": parent.delZip.value,
                        "region": parent.delRegion.value,
                        "country": parent.delCountry.value
                    }
                });

                serverRequestPromise("PUT", ordersURL + orderId + '?filter[fields][shipTo]=true', shipTo);
                
            } else if(parent.parentNode.classList.contains('customer-info')) {
                let customerInfo = JSON.stringify({
                    "customerInfo": {
                        "firstName": parent.custFName.value,
                        "lastName": parent.custLName.value,
                        "address": parent.custAddr.value,
                        "phone": parent.custPhone.value,
                        "email": parent.custEmail.value
                    }
                });

                serverRequestPromise("PUT", ordersURL + orderId + '?filter[fields][customerInfo]=true', customerInfo);
            }
            blockInput(parent);
        }
    }
});

function getOrderId() {
    return document.querySelector('.order-items table tbody').getAttribute('data-order-id');
}

function blockInput(form) {
    let inputs = form.getElementsByTagName("input");

    Array.prototype.map.call(inputs, function(input) {
        input.setAttribute('readonly', '');
    });

    let btns = form.querySelectorAll('button');

    btns.forEach(function(btn) {
        btn.classList.add('undisplayed');
    });
}

function showError(container) {
    container.className = 'error';

    let msgElem = document.createElement('span');

    msgElem.className = "error-message";
    msgElem.innerHTML = 'The field can\'t be empty';
    container.appendChild(msgElem);
}

function resetError(container) {
    if (container.lastChild.className == "error-message") {
      container.removeChild(container.lastChild);
    }
}

function validate(form) {
    let elems = form.elements;
    let errors = 0;

    Array.prototype.forEach.call(elems, (elem) => {
        if(elem.tagName != "BUTTON") {
            resetError(elem.parentNode);
            if(!elem.value) {
                errors++;
                showError(elem.parentNode);
            }
        }
    });
    return (errors > 0) ? false : true;
}
