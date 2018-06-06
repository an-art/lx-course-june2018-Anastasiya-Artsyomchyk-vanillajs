if(Orders) {
    let countOrders = 0;

    for(let p in Orders) {
        countOrders++;
        let li = document.createElement('li');
        li.className = 'order';
        li.addEventListener('click', orderInfo(Orders[p].id));
        li.addEventListener("click", function() {
            let current = document.querySelector('.order.active');
            if(current)
                current.classList.remove('active');
            this.classList.add('active');
        });
    
        let div = document.createElement('div');
        div.className = 'flex-wrapper';
    
        let div2 = div.cloneNode();
        let pOrderHeader = document.createElement('p');
        pOrderHeader.className = 'order-header';
        pOrderHeader.innerHTML = `Order <span>${Orders[p].id}</span>`;
    
        let pCreatedAt = document.createElement('p');
        pCreatedAt.className = 'creation-date';
        pCreatedAt.innerHTML = Orders[p].OrderInfo.createdAt;
        div.append(pOrderHeader, pCreatedAt);
    
        let pCustomer = document.createElement('p');
        pCustomer.innerHTML = Orders[p].OrderInfo.customer;
    
        let pStatus = document.createElement('p');
        pStatus.innerHTML = Orders[p].OrderInfo.status;
        pStatus.className = Orders[p].OrderInfo.status.toLowerCase();      
        div2.append(pCustomer, pStatus);
    
        let pShipped = document.createElement('p');
        pShipped.innerHTML = `Shipped: ${Orders[p].OrderInfo.shippedAt}`;
        li.append(div, div2, pShipped);
        document.querySelector('.orders-list').appendChild(li);
    }

    document.querySelector('.orders-list-container .header span').innerHTML = countOrders;
}
