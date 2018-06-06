document.querySelector('.search').addEventListener('click', handleSearchButton);

function handleSearchButton() {
    event.preventDefault();

    let input = document.querySelector('.search-field');
    let searchReq = input.value.toLowerCase();
    let ul = document.querySelector('.orders-list');
    let li = ul.getElementsByTagName('li');

    for(let p in Orders) {
        let info = Orders[p].OrderInfo;

        if(
            info.createdAt.toLowerCase().indexOf(searchReq) > -1 || 
            info.customer.toLowerCase().indexOf(searchReq) > -1 ||
            info.status.toLowerCase().indexOf(searchReq) > -1 ||
            info.shippedAt.toLowerCase().indexOf(searchReq) > -1) {
            
                for(let i = 0; i < li.length; i++) {
                    let id = li[i].querySelector('.order-header span');
            
                    if(id.innerHTML === Orders[p].id) 
                        li[i].style.display = '';       
                }

        } else {
            for(let i = 0; i < li.length; i++) {
                let id = li[i].querySelector('.order-header span');
        
                if(id.innerHTML === Orders[p].id) 
                    li[i].style.display = 'none';
            }
        }
    }
}