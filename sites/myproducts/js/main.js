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