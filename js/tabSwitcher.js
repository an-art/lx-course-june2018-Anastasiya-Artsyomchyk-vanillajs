let tabs = document.querySelector('.order-card-tabs');

let tab = tabs.getElementsByTagName("li");

for (let i = 0; i < tab.length; i++) {
    tab[i].addEventListener("click", function() {
        let current = tabs.querySelectorAll('.active');
        
        if(current.length > 0) {
            current[0].classList.remove('active');
            current[1].classList.remove('active');
        }        
        this.classList.add('active');
        this.querySelector('a').classList.add('active');
        
        let deliveryInfo = document.querySelectorAll('.js-delivery');
        for(let i = 0; i < deliveryInfo.length; i++) {
            deliveryInfo[i].style.display = 'none';
        }
        document.querySelector('.js-delivery.' + this.classList[0]).style.display = 'block';
    });
}
