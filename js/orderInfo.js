function orderInfo(id) {
    if(Orders) {
        let order;
        for(let p in Orders) {
            if(Orders[p].id === id)
                order = Orders[p];
        }
        return function() {
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

            let tbody = document.querySelector('.order-items table tbody');
            while(tbody.children.length > order.products.length) {
                tbody.children[order.products.length].remove();
            }
            for(let i = 0; i < order.products.length; i++) {
                if(tbody.children[i]) {
                    let tr = tbody.children[i];
                    tr.children[0].innerHTML = `<b>${order.products[i].name}</b><br>${order.products[i].id}`;
                    tr.children[1].innerHTML = `<b>${order.products[i].price}</b> ${order.products[i].currency}`;
                    tr.children[2].innerHTML = order.products[i].quantity;
                    tr.children[3].innerHTML = `<b>${order.products[i].totalPrice}</b> ${order.products[i].currency}`;
                } else {
                    let tr = document.createElement('tr');
                    let td1 = document.createElement('td');
                    td1.className = 't-al-l';
                    td1.innerHTML = `<b>${order.products[i].name}</b><br>${order.products[i].id}`;

                    let td2 = document.createElement('td');
                    td2.className = 't-al-c';
                    td2.innerHTML = `<b>${order.products[i].price}</b> ${order.products[i].currency}`;
                    
                    let td3 = td2.cloneNode();
                    td3.innerHTML = order.products[i].quantity;

                    let td4 = document.createElement('td');
                    td4.className = 't-al-r';
                    td4.innerHTML = `<b>${order.products[i].totalPrice}</b> ${order.products[i].currency}`;
                    tr.append(td1, td2, td3, td4);
                    tbody.appendChild(tr);
                }
            }
        }
    }
}