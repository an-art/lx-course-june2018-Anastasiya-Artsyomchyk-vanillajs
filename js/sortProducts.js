let thead = document.querySelectorAll('.order-items table th');

for(let i = 0; i < thead.length; i++) {
    thead[i].addEventListener('click', () => sortTable(i));
}

function sortTable(n) {
    let table = document.querySelector('.order-items table');
    let switching = true;
    let dir = 'asc'; 
    let rows;
    let shouldSwitch;
    let switchcount = 0;
    let i;

    while(switching) {
        switching = false;
        rows = table.getElementsByTagName('tr');

        for(i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            let x = rows[i].getElementsByTagName('td')[n];
            let y = rows[i + 1].getElementsByTagName('td')[n];

            if(dir == 'asc') {
                if(n === 0) {
                    if(x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                } else if(n % 2 != 0) {
                    if(parseFloat(x.getElementsByTagName('b')[0].innerHTML) > parseFloat(y.getElementsByTagName('b')[0].innerHTML)) {
                        shouldSwitch = true;
                        break;
                    }
                } else {
                    if (Number(x.innerHTML) > Number(y.innerHTML)) {
                        shouldSwitch = true;
                        break;
                    }
                }
            } else if(dir == 'desc') {
                if(n === 0) {
                    if(x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                } else if(n % 2 != 0) {
                    if(parseFloat(x.getElementsByTagName('b')[0].innerHTML) < parseFloat(y.getElementsByTagName('b')[0].innerHTML)) {
                        shouldSwitch = true;
                        break;
                    }
                } else {
                    if (Number(x.innerHTML) < Number(y.innerHTML)) {
                        shouldSwitch = true;
                        break;
                    }
                }
            }
        }
        if(shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++; 
        } else {
                if(switchcount == 0 && dir == "asc") {
                    dir = "desc";
                    switching = true;
                }
            }
    }
}