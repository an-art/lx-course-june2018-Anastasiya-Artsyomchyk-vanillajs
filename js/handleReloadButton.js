document.querySelector('.reload').addEventListener('click', handleReloadButton);

function handleReloadButton() {
    let ul = document.querySelector('.orders-list');
    let li = ul.getElementsByTagName('li');

    for(let i = 0; i < li.length; i++) {
        li[i].style.display = '';       
    }
}