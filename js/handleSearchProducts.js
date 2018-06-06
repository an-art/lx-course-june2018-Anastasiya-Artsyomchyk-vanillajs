document.querySelector('.search-products').addEventListener('input', searchProducts);

function searchProducts() {
    let input = document.querySelector('.search-products');
    let filter = input.value.toLowerCase();
    let table = document.querySelector('.order-items table');
    let tr = table.getElementsByTagName('tr');
  
    for(let i = 1; i < tr.length; i++) {
        let tds = tr[i].getElementsByTagName('td');
        if(tds) {
            for(let j = 0; j < tds.length; j++) {
                let td = tds[j];

                if(td) {
                    if(td.innerHTML.toLowerCase().indexOf(filter) > -1) {
                        tr[i].style.display = "";
                        break;
                    } else {
                        tr[i].style.display = "none";
                    }
                }
            }   
        } 
    }
}