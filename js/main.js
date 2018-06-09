try {
    Orders.forEach(function(order, i) {
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
        pCreatedAt.innerHTML = order.OrderInfo.createdAt;
        divHeader.append(pOrderHeader, pCreatedAt);
    
        let pCustomer = document.createElement("p");
        pCustomer.innerHTML = order.OrderInfo.customer;
    
        let pStatus = document.createElement("p");
        pStatus.innerHTML = order.OrderInfo.status;
        pStatus.className = order.OrderInfo.status.toLowerCase();      
        divInfo.append(pCustomer, pStatus);
    
        let pShipped = document.createElement("p");
        pShipped.innerHTML = `Shipped: ${order.OrderInfo.shippedAt}`;
        li.append(divHeader, divInfo, pShipped);
        document.querySelector('.orders-list').appendChild(li);

        if(i == 0) {
            li.classList.add('active');
            orderInfo(order.id);
        }
    });

    document.querySelector('.orders-list-container .header span').innerHTML = Orders.length;

    document.querySelector('.orders-list').addEventListener('click', function(e) {
        let current = findElem(e.target); 

        removeActiveClass(this);
        current.classList.add('active');

        let id = current.getAttribute('data-id');

        orderInfo(id);
    });

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

    function orderInfo(id) {
        let [order] = Orders.filter((order) => order.id == id);

        let orderInfo = document.querySelector('.order-info');
        orderInfo.innerHTML = `<h4>Order ${id}</h4> ${orderPrice(order.products)}`;

        let customer = document.querySelector('.js-customer span');
        customer.innerHTML = order.OrderInfo.customer;

        let ordered = document.querySelector('.js-ordered span');
        ordered.innerHTML = order.OrderInfo.createdAt;

        let shipped = document.querySelector('.js-shipped span');
        shipped.innerHTML = order.OrderInfo.shippedAt;

        let deliveryName = document.querySelector('.js-del-name');
        deliveryName.innerHTML = order.ShipTo.name;
        
        let deliveryAddr = document.querySelector('.js-del-addr');
        deliveryAddr.innerHTML = order.ShipTo.Address;

        let deliveryZip = document.querySelector('.js-del-zip');
        deliveryZip.innerHTML = order.ShipTo.ZIP;

        let deliveryRegion = document.querySelector('.js-del-region');
        deliveryRegion.innerHTML = order.ShipTo.Region;

        let deliveryCountry = document.querySelector('.js-del-country');
        deliveryCountry.innerHTML = order.ShipTo.Country;

        let customerFirstName = document.querySelector('.js-cust-fname');
        customerFirstName.innerHTML = order.CustomerInfo.firstName;

        let customerLastName = document.querySelector('.js-cust-lname');
        customerLastName.innerHTML = order.CustomerInfo.lastName;

        let customerAddr = document.querySelector('.js-cust-addr');
        customerAddr.innerHTML = order.CustomerInfo.address;

        let customerPhone = document.querySelector('.js-cust-phone');
        customerPhone.innerHTML = order.CustomerInfo.phone;

        let customerEmail = document.querySelector('.js-cust-email');
        customerEmail.innerHTML = order.CustomerInfo.email;

        document.querySelector('.order-items header span').innerHTML = order.products.length;
        document.querySelector('.search-products').value = '';

        let tbody = document.querySelector('.order-items table tbody');
        let template = tbody.querySelector('.undisplayed');

        while(tbody.children.length > 1) {
            tbody.children[tbody.children.length - 1].remove();
        }

        tbody.setAttribute('data-order-id', order.id);
        order.products.forEach(function(product) {
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

    document.querySelector('.search').addEventListener('click', handleSearchButton);

    function handleSearchButton() {
        event.preventDefault();

        let input = document.querySelector('.search-field');
        let searchReq = input.value.toLowerCase();
        let ul = document.querySelector('.orders-list');
        let li = ul.getElementsByTagName('li');
        let counter = 0;

        Orders.forEach(function(order) {
            let info = order.OrderInfo;

            if(
                info.createdAt.toLowerCase().indexOf(searchReq) > -1 || 
                info.customer.toLowerCase().indexOf(searchReq) > -1 ||
                info.status.toLowerCase().indexOf(searchReq) > -1 ||
                info.shippedAt.toLowerCase().indexOf(searchReq) > -1) {
                
                    Array.prototype.forEach.call(li, function(elem) {
                        let id = elem.querySelector('.order-header span');
                
                        if(id.innerHTML === order.id) {
                            elem.style.display = '';
                            counter++;
                        }       
                    });

            } else {
                Array.prototype.forEach.call(li, function(elem) {
                    let id = elem.querySelector('.order-header span');
            
                    if(id.innerHTML === order.id) {
                        elem.style.display = 'none';
                    }
                });
            }
        });
        document.querySelector('.orders-list-container .header span').innerHTML = counter;
    }

    document.querySelector('.reload').addEventListener('click', handleReloadButton);

    function handleReloadButton() {
        let ul = document.querySelector('.orders-list');
        let li = ul.getElementsByTagName('li');

        Array.prototype.forEach.call(li, function(elem) {
            elem.style.display = '';       
        });
    }

    document.querySelector('.order-card-tabs').addEventListener('click', function(e) {   
        let current = findElem(e);
        
        removeActiveClass(this);       
        current.classList.add('active');
        current.querySelector('a').classList.add('active'); 
        
        let deliveryInfo = document.querySelectorAll('.js-delivery');
        
        deliveryInfo.forEach(function(section) {
            section.style.display = 'none';
        });
        document.querySelector('.js-delivery.' + current.classList[0]).style.display = 'block';
    });

    document.querySelector('.search-products').addEventListener('input', searchProducts);

    function searchProducts() {
        let input = document.querySelector('.search-products');
        let filter = input.value.toLowerCase();
        let tbody = document.querySelector('.order-items tbody');
        let trs = tbody.getElementsByTagName('tr');
        let counter = 0;
        let orderId = tbody.getAttribute('data-order-id');
        let [order] = Orders.filter((order) => order.id == orderId);
        
        order.products.forEach(function(product) {            
            if(
                product.id.toLowerCase().indexOf(filter) > -1 || 
                product.name.toLowerCase().indexOf(filter) > -1 ||
                product.price.toLowerCase().indexOf(filter) > -1 ||
                product.currency.toLowerCase().indexOf(filter) > -1 ||
                product.quantity.toLowerCase().indexOf(filter) > -1 ||
                product.totalPrice.toLowerCase().indexOf(filter) > -1) {

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
    }

    document.querySelector('.order-items table thead').addEventListener('click', function(e) {
        let current = findElem(e, "TH", "TR");
        let colName = current.getAttribute('data-col-name');
        let dir = current.getAttribute('data-sort-dir');
        let newDir = sortTable(colName, dir);

        current.setAttribute('data-sort-dir', newDir);
    });

    function sortTable(key, dir) {
        let tbody = document.querySelector('.order-items table tbody');
        let newDir; 
        let orderId = tbody.getAttribute('data-order-id');
        let products = Orders.filter((order) => orderId == order.id)[0].products;
        
        if(dir === 'asc') { 
            newDir = 'desc';    
            
            if(key == 'name') {
                products.sort(function(a, b) {
                    let aRow = document.getElementById(a.id);
                    let bRow = document.getElementById(b.id);

                    if(a[key] > b[key]) {
                        tbody.insertBefore(bRow, aRow);
                        return 1;
                    }
                    if(a[key] < b[key]) {
                        tbody.insertBefore(aRow, bRow);
                        return -1;
                    }
                    return 0;           
                });
            } else {
                products.sort(function(a, b) {
                    let aRow = document.getElementById(a.id);
                    let bRow = document.getElementById(b.id);

                    if(a[key] - b[key] > 0) {
                        tbody.insertBefore(bRow, aRow);
                        return 1;
                    }
                    if(a[key] - b[key] < 0) {
                        tbody.insertBefore(aRow, bRow);
                        return -1;
                    }
                    return 0;           
                });
            }                 
        } else if(dir === 'desc') {
            newDir = 'asc';

            if(key == 'name') {
                products.sort(function(a, b) {
                    let aRow = document.getElementById(a.id);
                    let bRow = document.getElementById(b.id);

                    if(a[key] < b[key]) {
                        tbody.insertBefore(bRow, aRow);
                        return 1;
                    }
                    if(a[key] > b[key]) {
                        tbody.insertBefore(aRow, bRow);
                        return -1;
                    }
                    return 0;           
                });
            } else {
                products.sort(function(a, b) {
                    let aRow = document.getElementById(a.id);
                    let bRow = document.getElementById(b.id);

                    if(a[key] - b[key] < 0) {
                        tbody.insertBefore(bRow, aRow);
                        return 1;
                    }
                    if(a[key] - b[key] > 0) {
                        tbody.insertBefore(aRow, bRow);
                        return -1;
                    }
                    return 0;           
                });
            }           
        }
        
        return newDir;
    } 

} catch(e) {
    console.log('Error: ' + e);
}
