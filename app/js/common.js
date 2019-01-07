'use strict';

let url = '../data/db.json',
    productList,
    preloader = document.getElementById("preloader");

let getData = new Promise( (resolve, reject) => {
    let x = new XMLHttpRequest();

    x.open('GET', url, true);
    x.send();
    x.onreadystatechange = () => {
        if (x.readyState === XMLHttpRequest.DONE && x.status === 200){
            resolve(JSON.parse(x.responseText))
        }
        else if (x.status !== 200){
            reject(new Error(x.statusText))
        }
    };
});

getData.then((response) => {
   productList = response;
   setTableHeadings();
   initTableFromData();
   preloader.style.display = "none";
}, (reject) => {
    console.log(reject);
});

function setTableHeadings() {
    for (let key in productList[0]) {
        let th = document.createElement("th");
        th.classList.add("product-list__th");
        th.dataset.sort = key;
        th.innerHTML = `<span class="th-text">${key}</span>`;
        document.getElementById("table-headings-row").appendChild(th);
    }
}

function initTableFromData() {
    let productsOnPage = 20,
        currentPage = 1,
        productsToShow,
        productListFiltered = [...productList],
        productListSorted = [...productListFiltered],
        searchString = document.getElementById('search-string'),
        tableBody = document.getElementById('product-list__body'),
        tableHeadings = Array.from(document.getElementsByClassName('product-list__th')),
        tableHeadingsClickCounter = 0,
        tableHeadingsPrevClickTarget,
        pagination = document.getElementById('pagination');

    refreshProductList();
    initPagination();

    tableHeadings.forEach( (item) => {
        let sortMethod = item.dataset.sort;

        item.onclick = (e) => {
            e.preventDefault();

            tableHeadings.forEach((item) =>
                item.classList.remove('asc', 'desc')
            );

            tableHeadingsPrevClickTarget !== e.target.closest('th') ? tableHeadingsClickCounter = 0 : null;
            tableHeadingsPrevClickTarget = e.target.closest('th');
            tableHeadingsClickCounter === 3 ? tableHeadingsClickCounter = 1 : tableHeadingsClickCounter++;

            switch (tableHeadingsClickCounter) {
                case 1 :
                    item.classList.add('desc');
                    productListSorted = productListSorted.sort((a, b) => {
                        if(sortMethod === 'price') {
                            return +a[sortMethod] - +b[sortMethod]
                        }
                        else {
                            if (a[sortMethod] > b[sortMethod]) return 1;
                            if (a[sortMethod] < b[sortMethod]) return -1;
                        }
                    });
                    refreshProductList();
                    break;
                case 2 :
                    item.classList.add('asc');
                    productListSorted = productListSorted.reverse();
                    refreshProductList();
                    break;
                case 3 :
                    productListSorted = [...productListFiltered];
                    refreshProductList();
                    break;
            }
        }
    });

    searchString.onkeyup = () => {
        let productListFilteredNew = [];

        productList.forEach((product) =>
            product.title.toLowerCase().indexOf(searchString.value.toLowerCase()) !== -1 ? productListFilteredNew.push(product) : null
        );

        productListFiltered = [...productListFilteredNew];
        productListSorted = [...productListFiltered];
        currentPage = 1;
        refreshProductList();
        initPagination();
    };

    function initPagination() {
        pagination.innerHTML = '';
        for(let i = 0; i < (productListFiltered.length / productsOnPage); i++) {
            let paginationItem = document.createElement('li');

            paginationItem.classList.add('page-item');
            i + 1 === currentPage ? paginationItem.classList.add('active') : null;
            paginationItem.innerHTML = `<a class="page-link" href="#">${i+1}</a>`;
            pagination.appendChild(paginationItem);
        }

        let pageLinks = Array.from(document.getElementsByClassName('page-link'));

        pageLinks.forEach((item, index) => {
            item.onclick = (e) => {
                e.preventDefault();
                currentPage = index + 1;
                refreshProductList();
                refreshPagination();
            }
        });
    }

    function refreshPagination() {
        let paginationItems = Array.from(document.getElementsByClassName('page-item'));
        paginationItems.forEach((item, index) =>
            index + 1 === currentPage ? item.classList.add('active') : item.classList.remove('active')
        );
    }

    function refreshProductList() {

        tableBody.innerHTML = '';
        productsToShow = [];

        for (let i = (currentPage - 1) * productsOnPage; i < currentPage * productsOnPage && i < productListSorted.length; i++) {
            productsToShow.push(productListSorted[i]);
        }

        productsToShow.map((product) => {
            let tr = document.createElement('tr'),
                trHTML = '';

            for (let key in product) {
                let td = `<td>${product[key]}</td>`;
                trHTML += td;
            }

            tr.innerHTML = trHTML;
            tableBody.appendChild(tr);
        });
    }
}
