class MyProducts {

    constructor() {

        this.container = $(`.container`);

        this.modal = {
            'sell' : $(`#sell-modal`),
            'delete' : $(`#delete-modal`)
        }

        this.products = [];

        this.status = {
            'A' : "Aktiv",
            'S' : "Sold",
            'D' : "Deleted"
        }

        this.categories = [];

        this.search_user = [];

        this.timeout;
    }


    init() {

        this.fetch_my_products(() => {

            this.fetch_category(() => {
                
                this.render();
    
                this.bind_event_handlers();

            })
        })
    }

    fetch_users(search_str ,cb) {

        let ids = this.search_user.length > 0 ? this.search_user.map(x => x.id) : "";

        let data = {'uname' : search_str};

        if(ids.length > 0) data['ids'] = ids;

        api_get("products/sell", data, (resp) => {

            this.search_user = this.search_user.concat(resp.data);

            if(typeof cb == "function") cb();
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

            this.products = resp.data;

            if(typeof cb == "function") cb();
        })
    }


    bind_event_handlers() {

        if(this.is_bound) return;

        this.container.on("click", "td.actions div.sell-product", (e) => {
            let id = Number(e.currentTarget.parentNode.parentNode.dataset.id);

            this.modal.sell.attr('data-id', id).toggleClass("hidden", false);

        });

        this.container.on("click", "td.actions div.edit-product", (e) => {
            let id = e.currentTarget.parentNode.parentNode.dataset.id;

            EditProduct.display_edit(this.products.find(x => x.id == id), this.categories);
        })


        this.container.on('click', "td.actions div.delete-product", (e) => {
            let id = Number(e.currentTarget.parentNode.parentNode.dataset.id);
            this.modal.delete.attr('data-id', id).toggleClass("hidden", false);
        })
        

        this.modal.delete.on("click", ".modal-footer .close", () => {
            this.modal.delete.removeAttr('data-id').toggleClass("hidden", true);
        });

        this.modal.delete.on("click", ".modal-footer .delete-product", () => {
            this.delete_product();
        });



        this.modal.sell.on("keyup", ".input-wrapper input", (e) => {
            let val = e.currentTarget.value;
            this.fetch_users(val, () => {
                this.handle_seach(val);
            })
        })

        this.modal.sell.on("change", ".input-wrapper input", (e) => {
            let val = e.currentTarget.value;
            this.fetch_users(val, () => {
                this.handle_seach(val);
            })
        })

        this.modal.sell.on("click", ".seach-wrapper ul li", (e) => {

            let val = e.currentTarget.innerHTML;

            this.modal.sell.find('.input-wrapper input').val(val)
        })


        this.modal.sell.on("click", ".modal-footer .close", () => {
            this.modal.sell.removeAttr("data-id").toggleClass("hidden", true);
        })

        this.modal.sell.on("click", ".modal-footer .sell-product", (e) => {
            this.sell_product(this.modal.sell.find('.input-wrapper input').val())
        })


        this.is_bound = true;
    }


    sell_product(word) {

        let data = this.search_user.find(x => x.username === word);

        if(typeof data == "undefined") return alert("Denne bruger eksistere ikke i vores system");

        data.method = "sendOrderCompletion";
        data.productId = this.modal.sell.data('id');

        api_ajax("products/sell", data, (resp) => {
            console.log(resp)

            if(resp.success == true) alert("En email er nu sendt til brugeren");
        });
    }


    handle_seach(word) {

        let ul = this.modal.sell.find(".seach-wrapper ul");

        ul.html("");

        if(this.search_user.length === 0 || word == "") return;

        let list = this.search_user.filter(x => x.username.includes(word));

        for (let i = 0, length = list.length; i < length; i++) {
            const user = list[i];
            
            let li = document.createElement("li");
            li.dataset.id = user.id;
            li.innerHTML = user.username;
            ul.append(li);
        }

    }


    delete_product() {

        let id = Number(this.modal.delete.data('id'));

        let data = {
            'id' : id,
            'method' : 'deleteproduct'
        }

        api_ajax("products/myproducts", data, (resp) => {

            if(resp.success === false) return console.error("something went wrong in the api-request", resp);

            let index = this.products.findIndex(x => x.id == resp.id);

            this.products.splice(index, 1);

            this.container.find(`table tr[data-id="${id}"]`).remove();
            
            this.modal.delete.removeAttr('data-id').toggleClass("hidden", true);
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
