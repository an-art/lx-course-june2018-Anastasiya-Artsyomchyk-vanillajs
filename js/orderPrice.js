function orderPrice(products) {
    let sum = 0;

    for(let i = 0; i < products.length; i++) {
        sum += products[i].totalPrice - 0;
    }

    return sum;
}