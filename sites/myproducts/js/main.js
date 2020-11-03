class MyProducts {

    constructor() {

        this.container = $(`.container`);

        this.modal = {
            'sell' : $(`#sell-modal`)
        }

        this.products = [];

        this.status = {
            'A' : "Aktiv",
            'S' : "Sold",
            'D' : "Deleted"
        }

        this.categories = [];
    }


    init() {

        this.fetch_my_products(() => {

            this.fetch_category(() => {
                
                this.render();
    
                this.bind_event_handlers();

            })
        })
    }


    fetch_category(cb) {

        api_get("categories", (resp) => {

            if(typeof resp.data == "undefined") return typeof cb == "function" ? cb() : true;

            this.categories = resp.data;

            if(typeof cb == "function") cb();
        })
        
    }


    fetch_my_products(cb) {

        api_get("products/myproducts", (resp) => {

            console.log(resp)

            this.products = resp.data;

            if(typeof cb == "function") cb();
        })
    }


    bind_event_handlers() {

        if(this.is_bound) return;

        this.container.on("click", "td.actions div.sell-product", (e) => {

            this.modal.sell.toggleClass("hidden", false);

        });

        this.container.on("click", "td.actions div.edit-product", (e) => {
            let id = e.currentTarget.parentNode.parentNode.dataset.id

            EditProduct.display_edit(this.products.find(x => x.id == id), this.categories);
        })
        

        this.modal.sell.on("click", ".modal-footer .close", () => {
            this.modal.sell.toggleClass("hidden", true);
        })

        this.is_bound = true;
    }


    autocomplete(inp, arr) {
        /*the autocomplete function takes two arguments,
        the text field element and an array of possible autocompleted values:*/
        var currentFocus;

        /*execute a function when someone writes in the text field:*/
        inp.addEventListener("input", function(e) {
            var a, b, i, val = this.value;
            /*close any already open lists of autocompleted values*/
            closeAllLists();
            if (!val) { return false;}
            currentFocus = -1;
            /*create a DIV element that will contain the items (values):*/
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            /*append the DIV element as a child of the autocomplete container:*/
            this.parentNode.appendChild(a);
            /*for each item in the array...*/
            for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
            }
        });

        /*execute a function presses a key on the keyboard:*/
        inp.addEventListener("keydown", function(e) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
                /*If the arrow DOWN key is pressed,
                increase the currentFocus variable:*/
                currentFocus++;
                /*and and make the current item more visible:*/
                addActive(x);
            } 
            else if (e.keyCode == 38) 
            { //up
                /*If the arrow UP key is pressed,
                decrease the currentFocus variable:*/
                currentFocus--;
                /*and and make the current item more visible:*/
                addActive(x);
            } 
            else if (e.keyCode == 13) 
            {
                /*If the ENTER key is pressed, prevent the form from being submitted,*/
                e.preventDefault();
                if (currentFocus > -1) {
                    /*and simulate a click on the "active" item:*/
                    if (x) x[currentFocus].click();
                }
            }
        });

        function addActive(x) {
            /*a function to classify an item as "active":*/
            if (!x) return false;
            /*start by removing the "active" class on all items:*/
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            /*add class "autocomplete-active":*/
            x[currentFocus].classList.add("autocomplete-active");
        }

        function removeActive(x) {
            /*a function to remove the "active" class from all autocomplete items:*/
            for (var i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
            }
        }

        function closeAllLists(elmnt) {
            /*close all autocomplete lists in the document,
            except the one passed as an argument:*/
            var x = document.getElementsByClassName("autocomplete-items");
            for (var i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
                }
            }
        }

        /*execute a function when someone clicks in the document:*/
        document.addEventListener("click", function (e) {
            closeAllLists(e.target);
        });
    }




    formdate(date) {

        const months = ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"];

        if(typeof date === "string") date = new Date(date);

        let month = months[date.getMonth()],
            day   = date.getDate(),
            year  = date.getFullYear();

        return `${day}. ${month} ${year}`;
    }


    update_tr_data(id, data) {

        if(typeof id == "object") { data = id; id = 0};

        if(id === 0)
        {
            if(typeof data.id == "undefined") return console.error("update_tr_data needs product id");
            id = data.id;
        }

        let prod_data = this.products.find(x => x.id == id);

        Object.assign(prod_data, data);

        prod_data.assets = data.assets;

        this.container.find(`table tr[data-id="${id}"]`).html(this.render_tr_data(prod_data)).addClass("blink");

        setTimeout(() => {
            this.container.find(`table tr[data-id="${id}"]`).removeClass("blink")
        }, 1000)
    }


    render_tr_data(prod) {

        const created = this.formdate(prod.created);

        return `<td class="images"><img src="${prod.assets[0].location}"></td>
            <td class="info">
                <div class="title"><b>titel:</b> ${prod.title}</div>
                <div class="description"><b>Beskrivelse:</b> ${prod.description}</div>
                <div class="price"><b>Pris:</b> ${prod.price}</div>
                <div class="status"><b>Status:</b> ${this.status[prod.status]}</div>
                <div class="adress"><b>Addresse:</b> ${prod.address}</div>
                <div class="zipcode"><b>Post nr:</b> ${prod.zipcode}</div>
                <div class="region"><b>Region:</b> ${prod.region}</div>
                <div class="created"><b>Oprettet:</b> ${created}</div>
            </td>
            <td class="actions">
                <div class="btn sell-product">Sælg vare</div>
                <div class="btn edit-product">Rediger vare</div>
                <div class="btn delete-product">Slet vare</div>
            </td>
        `;
    }


    render() {

        let table   = this.container.children("table"),
            no_prod = table.find('tr.no-products'),
            tr      = [];

        for (let i = 0, length = this.products.length; i < length; i++) {
            const prod = this.products[i];

            if(i > 0)
            {
                tr[i-1].css("border-bottom", "1px solid #000");
            }

            tr.push($(`<tr data-id="${prod.id}">${this.render_tr_data(prod)}</tr>`));
        }

        if(tr.length > 0)
        {
            no_prod.remove();
            table.append(tr);
        }
    }
}



$( document ).ready(function() {

    if(typeof window.myProducts == "undefined")
    {
        window.myProducts = new MyProducts;
    }

    window.myProducts.init();

    /* let cp = new MyProducts;
    cp.init(); */

});
