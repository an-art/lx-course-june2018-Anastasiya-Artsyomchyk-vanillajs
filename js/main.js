/**
 * Model class. Knows everything about API endpoint and data structure. Can format/map data to any structure.
 *
 * @constructor
 */
function Model() {
    /**
	 * URL for getting the orders from OData service.
	 * @type {string}
	 *
	 * @public
	 */
    this.ordersURL = 'http://localhost:3000/api/Orders/';

    /**
	 * URL for getting the products from OData service.
	 * @type {string}
	 *
	 * @public
	 */
    this.productsURL = 'http://localhost:3000/api/OrderProducts/';

    /**
	 * URL postfix for getting the products of order from OData service.
	 * @type {string}
	 *
	 * @public
	 */
    this.productsPostfix = '/products';

    /**
	 * Common method to make 'promisified' requests to server.
	 *
	 * @param {string} method the request method.
     * @param {string} url the request url.
     * @param {object} [body] the request body.
     * 
     * @return {Promise} the promise object will be resolved once XHR gets loaded/failed.
	 *
	 * @public
	 */
    this.serverRequestPromise = function(method, url, body) {
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

    /**
	 * Put the recalculated total price of the order to oData server.
	 *
	 * @param {Number} orderId the id of the order.
     * @param {Number} totalPrice a total price of the order.
	 *
	 * @public
	 */
    this.putOrderPrice = function(orderId, totalPrice) {
        this.serverRequestPromise("GET", this.ordersURL + orderId + '?filter[fields][summary]=true')
            .then((orderInfo) => {
                orderInfo.summary.totalPrice = totalPrice;
                this.serverRequestPromise("PUT", this.ordersURL + orderId + '?filter[fields][summary]=true', JSON.stringify(orderInfo));
            });
    }
}

/**
 * View class. Knows everything about dom & manipulation and a little bit about data structure, which should be
 * filled into UI element.
 *
 * @constructor
 */
function View() {
    /**
	 * Initialize view.
	 *
	 * @public
	 */
    this.init = function() {
        document.querySelector('.order-card-tabs').addEventListener('click', this._showDeliveryInfo.bind(this));
        document.querySelector('.reload').addEventListener('click', this._handleReloadButton);
        document.querySelector('.add-order-btn').addEventListener('click', function(e) {
            document.querySelector('.popup.add-order').style.display = 'block';
        });
        document.querySelector('.add-product-btn').addEventListener('click', function(e) {
            document.querySelector('.popup.add-product').style.display = 'block';
        });
        document.querySelector('.delete-order-btn').addEventListener('click', function() {
            document.querySelector('.popup.delete-order').style.display = 'block';
        });
        window.addEventListener('click', function(e) {
            if(e.target.classList.contains('popup')) {
                e.target.style.display = 'none';
            }
            if(e.target.classList.contains('close-btn')) {
                e.target.parentNode.parentNode.style.display = 'none';
            }
        });
    }
    
    /**
	 * Common method to find an element inside other element.
	 *
	 * @param {HTMLElement} target an event target element.
     * @param {string} [tag=LI] a tag name of a wanted element.
     * @param {string} [stopTag=UL] a parent tag name of a wanted element (to stop searching).
     * 
     * @return {HTMLElement} a wanted element.
	 *
	 * @public
	 */
    this.findElem = function(target, tag = "LI", stopTag = "UL") {
        let current = target;
    
        while(current.tagName != tag) {
            if(current.tagName == stopTag) {
                return;
            }
            current = current.parentNode;
        }
    
        return current;
    }

    /**
	 * Fill the data into orders list (dynamically create the list items to represent an order).
	 *
	 * @param {Array} orders an array of orders data.
	 *
	 * @public
	 */
    this.renderOrders = function(orders) {
        let ul = document.querySelector('.orders-list');
        let that = this;

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
            pCreatedAt.innerHTML = that._getDate(order.summary.createdAt);
            divHeader.append(pOrderHeader, pCreatedAt);
    
            let pCustomer = document.createElement("p");
            pCustomer.innerHTML = order.summary.customer;
    
            let pStatus = document.createElement("p");
            pStatus.innerHTML = order.summary.status;
            pStatus.className = order.summary.status.toLowerCase();
            divInfo.append(pCustomer, pStatus);
    
            let pShipped = document.createElement("p");
            pShipped.innerHTML = `Shipped: ${that._getDate(order.summary.shippedAt)}`;
            li.append(divHeader, divInfo, pShipped);
            ul.appendChild(li); 
            
            if (i == 0) {
                li.classList.add('active');
            }
        });
    }

    /**
	 * Convert a date string to the proper view.
	 *
	 * @param {string} str a date string.
     * 
     * @return {string} beautiful date string.
	 *
	 * @private
	 */
    this._getDate = function(str) {
        str = (str.indexOf('T') > 0) ? str.slice(0, str.indexOf('T')) : str;
        return str.split('-').reverse().join('.');
    }

    /**
	 * Add 'active' class to order.
	 *
	 * @param {Event} e the DOM event object.
     * 
     * @return {Number} order id
	 *
	 * @public
	 */
    this.showOrderInfo = function(e) {
        let current = this.findElem(e.target); 
    
        if(current){
            this._removeActiveClass(e.currentTarget);
            current.classList.add('active');
    
            return current.getAttribute('data-id');
        }
    }

    /**
	 * Remove active class from all elements inside a parent element.
	 *
	 * @param {HTMLElement} parent an element with 'active' children.
	 *
	 * @private
	 */
    this._removeActiveClass = function(parent) {
        let active = parent.querySelectorAll('.active');
        
        if(active.length > 0) {
            active.forEach(function(elem) {
                elem.classList.remove('active');
            });
        }
    }

    /**
	 * Fill the data into order info page.
	 *
	 * @param {Array} order an order data array.
	 *
	 * @public
	 */
    this.orderInfo = function(order) {
        let orderInfo = document.querySelector('.order-info');
        orderInfo.innerHTML = `<h4>Order ${order.id}</h4> ${order.summary.totalPrice}`;

        let customer = document.querySelector('.js-customer span');
        customer.innerHTML = order.summary.customer;
    
        let ordered = document.querySelector('.js-ordered span');
        ordered.innerHTML = this._getDate(order.summary.createdAt);
    
        let shipped = document.querySelector('.js-shipped span');
        shipped.innerHTML = this._getDate(order.summary.shippedAt);
    
        let deliveryName = document.querySelector('.js-del-name');
        deliveryName.setAttribute('placeholder', order.shipTo.name);
        deliveryName.setAttribute('readonly', '');

        document.querySelector('.shipping-info form').reset();
        document.querySelector('.customer-info form').reset();
        
        let deliveryAddr = document.querySelector('.js-del-addr');
        deliveryAddr.setAttribute('placeholder', order.shipTo.address);
        deliveryAddr.setAttribute('readonly', '');
    
        let deliveryZip = document.querySelector('.js-del-zip');
        deliveryZip.setAttribute('placeholder', order.shipTo.ZIP);
        deliveryZip.setAttribute('readonly', '');
    
        let deliveryRegion = document.querySelector('.js-del-region');
        deliveryRegion.setAttribute('placeholder', order.shipTo.region);
        deliveryRegion.setAttribute('readonly', '');
    
        let deliveryCountry = document.querySelector('.js-del-country');
        deliveryCountry.setAttribute('placeholder', order.shipTo.country);
        deliveryCountry.setAttribute('readonly', '');
    
        let customerFirstName = document.querySelector('.js-cust-fname');
        customerFirstName.setAttribute('placeholder', order.customerInfo.firstName);
        customerFirstName.setAttribute('readonly', '');
    
        let customerLastName = document.querySelector('.js-cust-lname');
        customerLastName.setAttribute('placeholder', order.customerInfo.lastName);
        customerLastName.setAttribute('readonly', '');
    
        let customerAddr = document.querySelector('.js-cust-addr');
        customerAddr.setAttribute('placeholder', order.customerInfo.address);
        customerAddr.setAttribute('readonly', '');
    
        let customerPhone = document.querySelector('.js-cust-phone');
        customerPhone.setAttribute('placeholder', order.customerInfo.phone);
        customerPhone.setAttribute('readonly', '');
    
        let customerEmail = document.querySelector('.js-cust-email');
        customerEmail.setAttribute('placeholder', order.customerInfo.email);
        customerEmail.setAttribute('readonly', '');

        document.querySelector('.js-delivery .save-btn').classList.add('undisplayed');
        document.querySelector('.js-delivery .cancel-btn').classList.add('undisplayed');
        
        document.querySelector('.order-items table tbody').setAttribute('data-order-id', order.id);            
    }

    /**
	 * Fill the data into order products table (dynamically create table rows).
	 *
	 * @param {Array} products a products data array.
	 *
	 * @public
	 */
    this.orderProducts = function(products) {
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

    /**
	 * Delivery info tab bar click event handler.
	 *
	 * @param {Event} e the DOM event object.
	 *
	 * @private
	 */
    this._showDeliveryInfo = function(e) {
        let current = this.findElem(e.target);
    
        if(current){
            this._removeActiveClass(e.currentTarget);       
            current.classList.add('active');
            current.querySelector('a').classList.add('active'); 
            
            let deliveryInfo = document.querySelectorAll('.js-delivery');
            
            deliveryInfo.forEach(function(section) {
                section.style.display = 'none';
            });
            document.querySelector('.js-delivery.' + current.classList[0]).style.display = 'block';
        }
    }

    /**
	 * Orders search field reload button click event handler.
	 *
	 * @private
	 */
    this._handleReloadButton = function() {
        let ul = document.querySelector('.orders-list');
        let li = ul.getElementsByTagName('li');
    
        Array.prototype.forEach.call(li, function(elem) {
            elem.style.display = '';       
        });
        document.querySelector('.orders-list-container .header span').innerHTML = li.length;
    }

    /**
	 * Return order id.
     * 
     * @return {Number} order id.
	 *
	 * @public
	 */
    this.getOrderId = function() {
        return document.querySelector('.order-items table tbody').getAttribute('data-order-id');
    }

    /**
	 * Block input fields inside form element.
	 *
	 * @param {HTMLFormElement} form the form element.
	 *
	 * @private
	 */
    this._blockInput = function(form) {
        let inputs = form.getElementsByTagName("input");
        
        
        Array.prototype.map.call(inputs, function(input) {
            input.setAttribute('readonly', '');
        });
    
        let btns = form.querySelectorAll('button');
    
        btns.forEach(function(btn) {
            btn.classList.add('undisplayed');
        });
    }

    /**
	 * Add element with error message.
	 *
	 * @param {HTMLElement} container form element container.
	 *
	 * @private
	 */
    this._showError = function(container) {
        container.className = 'error';
    
        let msgElem = document.createElement('span');
    
        msgElem.className = "error-message";
        msgElem.innerHTML = 'The field can\'t be empty';
        container.appendChild(msgElem);
    }
    
    /**
	 * Remove element with error message.
	 *
	 * @param {HTMLElement} container form element container.
	 *
	 * @private
	 */
    this._resetError = function(container) {
        container.classList.remove('error');
        if (container.lastChild.className == "error-message") {
          container.removeChild(container.lastChild);
        }
    }
    
    /**
	 * Validate form.
	 *
	 * @param {HTMLFormElement} form the form element.
     * 
     * @return {boolean} whether the form passed validation or no
	 *
	 * @private
	 */
    this._validate = function(form) {
        let elems = form.elements;
        let errors = 0;
    
        Array.prototype.forEach.call(elems, (elem) => {
            if(elem.tagName != "BUTTON") {
                this._resetError(elem.parentNode);
                if(!elem.value) {
                    errors++;
                    this._showError(elem.parentNode);
                }
            }
        });
        return (errors > 0) ? false : true;
    }

    /**
	 * Return element that match the selector.
	 *
	 * @param {string} selector css-like selector string.
     * @param {HTMLElement} [parent=document] parent element.
     * 
     * @return {Element} the first Element within the document that matches the specified selector.
	 *
	 * @public
	 */
    this.getElement = function(selector, parent) {
        if(!parent) {
            return document.querySelector(selector);
        } else {
            return parent.querySelector(selector);
        }
    }

    /**
     * Reset display property of the element.
     * 
     * @param {HTMLElement} elem element
     * 
     * @public
     */
    this.resetElemDisplay = function(elem) {
        elem.style.display = '';
    }

    /**
     * Set display property of the element to 'none'.
     * 
     * @param {HTMLElement} elem element
     * 
     * @public
     */
    this.elemDisplayNone = function(elem) {
        elem.style.display = 'none';
    }

    /**
	 * Return value of the element that match the selector.
	 *
	 * @param {string} selector css-like selector string.
     * 
     * @return {string} value of the element.
	 *
	 * @public
	 */
    this.getElemValue = function(selector) {
        return document.querySelector(selector).value;
    }

    /**
     * Return a live collection of matched elements.
     * 
     * @param {HTMLElement} parent parent element
     * @param {string} tag tag of the wanted elements
     * 
     * @return {HTMLCollection} elements that match 'tag'.
	 *
	 * @public
     */
    this.getElemsByTag = function(parent, tag) {
        return parent.getElementsByTagName(tag);
    }

    /**
     * Return attribute value.
     * 
     * @param {string} attr attribute.
     * @param {HTMLElement} elem element.
     * 
     * @return {string} attribute value.
	 *
	 * @public
     */
    this.getDataAttr = function(attr, elem) {
        return elem.getAttribute(attr);
    }

    /**
     * Set attribute new value.
     * 
     * @param {string} attr attribute.
     * @param {string} value attribute value.
     * @param {HTMLElement} elem element.
	 *
	 * @public
     */
    this.setDataAttr = function(attr, value, elem) {
        elem.setAttribute(attr, value);
    }

    /**
     * Get values from the new order form.
     * 
     * @param {Event} e the DOM event object.
     * 
     * @return {object} new order data.
     * 
     * @public
     */
    this.getOrderFormValues = function(e) {
        let form = e.target.parentNode;

        if(this._validate(form)) {
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
            return order;
        }        
    }

    /**
     * Get values from the new product form.
     * 
     * @param {Event} e the DOM event object.
     * 
     * @return {object} new product data.
     * 
     * @public
     */
    this.getProductFormValues = function(e) {
        let form = e.target.parentNode;

        if(this._validate(form)) {
            let name = form.name.value;
            let price = form.price.value;
            let currency = form.currency.value;
            let quantity = form.quantity.value;       
            let totalPrice = price * quantity; 
            let orderId = this.getOrderId();       
            let product = JSON.stringify({
                "name": name,
                "price": price,
                "currency": currency,
                "quantity": quantity,
                "totalPrice": totalPrice,
                "orderId": orderId  
            });
            form.reset();
            return product;
        }
    }

    /**
     * Check if the element contains the given class name.
     * 
     * @param {HTMLElement} element element.
     * @param {string} classname class name.
     * 
     * @return {boolean} whethere element contains the given class name or no.
     * 
     * @public
     */
    this.checkIfContainClass = function(element, classname) {
        return element.classList.contains(classname);
    }

    /**
     * Show delete product popup and get the id of the product to delete.
     * 
     * @param {Event} e the DOM event object.
     * 
     * @return {boolean} product id to delete.
     * 
     * @public
     */
    this.getProductToDelete = function(e) {
        document.querySelector('.popup.delete-product').style.display = 'block';

        let productId;

        if(e.target.parentNode.tagName == "TR"){
            productId = e.target.parentNode.id;
        } else {
            productId = e.target.parentNode.parentNode.id;
        }
        return productId;
    }

    /**
     * Delivery info section edit button click event handler.
     * 
     * @param {Event} e the DOM event object.
     * 
     * @public
     */
    this.editButtonHandler = function(e) {
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

    /**
     * Delivery info section cancel button click event handler.
     * 
     * @param {Event} e the DOM event object.
     * 
     * @public
     */
    this.cancelButtonHandler = function(e) {
        let parent = e.target.parentNode;
        let inputs = parent.getElementsByTagName("input");

        Array.prototype.map.call(inputs, (input) => {
            this._resetError(input.parentNode);
        });
        
        this._blockInput(parent);
    }

    /**
     * Get values from the 'ship to' form.
     * 
     * @param {Event} e the DOM event object.
     * 
     * @return {object} new shipping data.
     * 
     * @public
     */
    this.getShipFormValues = function(e) {
        let parent = e.target.parentNode;

        if(this._validate(parent)) {
            let shipTo = JSON.stringify({
                "shipTo": {
                    "name": parent.delName.value,
                    "address": parent.delAddr.value,
                    "ZIP": parent.delZip.value,
                    "region": parent.delRegion.value,
                    "country": parent.delCountry.value
                }
            });

            this._blockInput(parent);
            return shipTo;
        }
    }

    /**
     * Get values from the 'customer' form.
     * 
     * @param {Event} e the DOM event object.
     * 
     * @return {object} new customer data.
     * 
     * @public
     */
    this.getCustomerFormValues = function(e) {
        let parent = e.target.parentNode;

        if(this._validate(parent)) {
            let customerInfo = JSON.stringify({
                "customerInfo": {
                    "firstName": parent.custFName.value,
                    "lastName": parent.custLName.value,
                    "address": parent.custAddr.value,
                    "phone": parent.custPhone.value,
                    "email": parent.custEmail.value
                }
            });

            this._blockInput(parent);
            return customerInfo;
        }
    }
}

/**
 * Controller class. Orchestrates the model and view objects. A "glue" between them.
 *
 * @param {View} view view instance.
 * @param {Model} model model instance.
 *
 * @constructor
 */
function Controller(view, model) {
	/**
	 * Initialize controller.
	 *
	 * @public
	 */
    this.init = function() {
        view.init();
        this._renderOrdersWrapper();

        view.getElement('.orders-list').addEventListener('click', this._showOrderInfoWrapper.bind(this));
        view.getElement('.search-products').addEventListener('search', this._searchProducts.bind(this));
        view.getElement('.order-items table thead').addEventListener('click', this._sortTableHandler.bind(this));
        view.getElement('.add-order .submit-btn').addEventListener('click', this._addOrder.bind(this));
        view.getElement('.add-product .submit-btn').addEventListener('click', this._addProduct.bind(this));
        view.getElement('.order-items table').addEventListener('click', this._deleteProduct.bind(this));
        view.getElement('.confirm-order-del').addEventListener('click', this._deleteOrder.bind(this));
        view.getElement('.delivery-info-container').addEventListener('click', this._deliveryInfoFormHandler.bind(this));
    }

    /**
	 * Instance of a map.
	 * @type {object}
	 *
	 * @private
	 */
    let myMap;

    /**
	 * Get orders data from oData server and render it.
	 *
	 * @private
	 */
    this._renderOrdersWrapper = function() {
        let that = this;
        model.serverRequestPromise("GET", model.ordersURL)
            .then((orders)=>{
                view.renderOrders(orders);
                that._getOrderInfoWrapper(orders[0].id);

                view.getElement('.orders-list-container .header span').innerHTML = orders.length;   
                view.getElement('.search').addEventListener('click', that._handleSearchButton(orders));
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /**
	 * Get order and products data from oData server and render it.
	 *
	 * @param {Number} id the order id.
	 *
	 * @private
	 */
    this._getOrderInfoWrapper = function(id) {
        model.serverRequestPromise("GET", model.ordersURL + id + model.productsPostfix)
            .then((products) => {
                let totalPrice = this._orderPrice(products);
                
                model.putOrderPrice(id, totalPrice);
                view.orderProducts(products);
            })
            .then(() => {
                return model.serverRequestPromise("GET", model.ordersURL + id);
            })
            .then((order) => {
                view.orderInfo(order);
               
                let address = order.shipTo.country + ', ' + order.shipTo.region + ', ' + order.shipTo.address;
                ymaps.ready(this._ymapsInit(address));
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /**
	 * Count total order price.
	 *
	 * @param {array} products the array of products.
     * 
     * @return {Number} total price of the order.
	 *
	 * @private
	 */
    this._orderPrice = function(products) {
        return products.reduce((a, b) => {
            return a + Number(b.totalPrice);
        }, 0);    
    }

    /**
     * Orders search button click event handler.
     * 
     * @param {array} orders array of orders.
     * 
     * @private
     */
    this._handleSearchButton = function(orders) {
        return function() {
            event.preventDefault();
    
            let searchReq = view.getElemValue('.search-field').toLowerCase(); 
            let ul = view.getElement('.orders-list');
            let li = view.getElemsByTag(ul, 'li');
            let counter = 0;
    
            orders.forEach(function(order) {
                let info = order.summary;
    
                if(
                    info.createdAt.toLowerCase().indexOf(searchReq) > -1 || 
                    info.customer.toLowerCase().indexOf(searchReq) > -1 ||
                    info.status.toLowerCase().indexOf(searchReq) > -1 ||
                    info.shippedAt.toLowerCase().indexOf(searchReq) > -1) {
                    
                        Array.prototype.forEach.call(li, function(elem) {
                            let id = view.getElement('.order-header span', elem);

                            if(id.innerHTML == order.id) {
                                view.resetElemDisplay(elem);
                                counter++;
                            }       
                        });
    
                } else {
                    Array.prototype.forEach.call(li, function(elem) {
                        let id = view.getElement('.order-header span', elem);
    
                        if(id.innerHTML == order.id) {
                            view.elemDisplayNone(elem);
                        }
                    });
                }
            });
            view.getElement('.orders-list-container .header span').innerHTML = counter;
        }
    }

    /**
	 * Delete order button click event handler.
	 *
	 * @private
	 */
    this._deleteOrder = function() {
        let orderId = view.getOrderId();
    
        model.serverRequestPromise("DELETE", model.ordersURL + orderId)
            .then(() => {
                this._renderOrdersWrapper();
            });
    }

    /**
     * Callback for ymaps.ready(). 
     * 
     * @param {string} address 
     * 
     * @return a map created by 'address' parameter.
     * 
     * @private
     */
    this._ymapsInit = function(address) {            
        return function() {
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

    /**
     * Order click event handler.
     * 
     * @param {Event} e the DOM event object.
     * 
     * @private
     */
    this._showOrderInfoWrapper = function(e) {
        let id = view.showOrderInfo(e);

        this._getOrderInfoWrapper(id);
    }

    /**
     * Products search click event handler.
     * 
     * @private
     */
    this._searchProducts = function() {
        let filter = view.getElemValue('.search-products').toLowerCase();
        let trs = view.getElemsByTag(view.getElement('.order-items tbody'), 'tr');
        let counter = 0;
        let orderId = view.getOrderId();
    
        model.serverRequestPromise("GET", model.ordersURL + orderId + model.productsPostfix)
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
                                    let id = view.getElement('td p', tr).innerHTML;
                            
                                    if(id == product.id) {                            
                                        view.resetElemDisplay(tr);
                                        counter++;
                                    }       
                                });
    
                        } else {
                            Array.prototype.forEach.call(trs, function(tr) {
                                let id = view.getElement('td p', tr).innerHTML;
                        
                                if(id == product.id) {
                                    view.elemDisplayNone(tr);
                                }
                            });
                        }
                    });
                view.getElement('.order-items header span').innerHTML = counter;
            });   
    }

    /**
     * Sort table.
     * 
     * @param {string} key a property to sort by.
     * @param {string} dir sort direction.
     * 
     * @return {string} opposite sort direction.
     * 
     * @private
     */
    this._sortTable = function(key, dir) {
        let orderId = view.getOrderId();
        
        model.serverRequestPromise("GET", model.ordersURL + orderId + model.productsPostfix + '?filter[order]=' + key + '%20' + dir)
            .then((res) => {
                view.orderProducts(res);
            });
        
        if(dir == 'ASC') {
            return 'DESC';
        } else if(dir == 'DESC') {
            return 'ASC';
        }
    }

    /**
     * Sort table click event handler.
     * 
     * @param {Event} e the DOM event object.
     * 
     * @private
     */
    this._sortTableHandler = function(e) {
        let current = view.findElem(e.target, "TH", "TR");
        let colName = view.getDataAttr('data-col-name', current);
        let dir = view.getDataAttr('data-sort-dir', current).toUpperCase();
        let newDir = this._sortTable(colName, dir);

        view.setDataAttr('data-sort-dir', newDir.toLowerCase(), current);
    }

    /**
     * Add order button click event handler.
     * 
     * @param {Event} e the DOM event object.
     * 
     * @private
     */
    this._addOrder = function(e) {
        e.preventDefault();
        let order = view.getOrderFormValues(e);
        if(order) {
            model.serverRequestPromise("POST", model.ordersURL, order)
                .then(() => {
                    this._renderOrdersWrapper();
                }); 
        }
    }

    /**
     * Add product button click event handler.
     * 
     * @param {Event} e the DOM event object.
     * 
     * @private
     */
    this._addProduct = function(e) {
        e.preventDefault();
    
        let orderId = view.getOrderId();
        let product = view.getProductFormValues(e);
        if(product) {
            model.serverRequestPromise("POST", model.productsURL, product)
                .then(() => {
                    this._getOrderInfoWrapper(orderId);
                });
        }
        
    }

    /**
     * Delete product button click event handler.
     * 
     * @param {Event} e the DOM event object.
     * 
     * @private
     */
    this._deleteProduct = function(e) {
        if(view.checkIfContainClass(e.target, 'delete-product-btn')) {
            let productId = view.getProductToDelete(e);
            let that = this;
    
            view.getElement('.confirm-product-del').addEventListener('click', function() {
                let orderId = view.getOrderId();
            
                model.serverRequestPromise("DELETE", model.ordersURL + orderId + model.productsPostfix + '/' + productId)
                    .then(() => {
                        that._getOrderInfoWrapper(orderId);
                    });
            });
        }
    }

    /**
     * Delivery info buttons click event handler.
     * 
     * @param {Event} e the DOM event object.
     * 
     * @private
     */
    this._deliveryInfoFormHandler = function(e) {
        if(view.checkIfContainClass(e.target, 'edit-info-btn')) {
            view.editButtonHandler(e);
        }
        if(view.checkIfContainClass(e.target, 'cancel-btn')) {
            view.cancelButtonHandler(e);
        }
        if(view.checkIfContainClass(e.target, 'save-btn')) {        
            e.preventDefault();
    
            let orderId = view.getOrderId();
    
            if(view.checkIfContainClass(e.target.parentNode.parentNode, 'shipping-info')) {
                let shipTo = view.getShipFormValues(e);
                if(shipTo) {
                    model.serverRequestPromise("PUT", model.ordersURL + orderId + '?filter[fields][shipTo]=true', shipTo);
                } 
            } else if(view.checkIfContainClass(e.target.parentNode.parentNode, 'customer-info')) {
                let customerInfo = view.getCustomerFormValues(e);
                if(customerInfo) {
                    model.serverRequestPromise("PUT", model.ordersURL + orderId + '?filter[fields][customerInfo]=true', customerInfo);
                }
            }
        }
    }

}

(new Controller(new View, new Model)).init();
