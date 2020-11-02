class CreateProduct {

    constructor() {

        this.container = $(`.container`);

        this.products = [];

        this.status = {
            'A' : "Aktiv",
            'S' : "Sold",
            'D' : "Deleted"
        }
    }


    init() {

        this.fetch_my_products(() => {

            this.render();

            this.bind_event_handlers();
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

    render() {

        let table   = this.container.children("table"),
            no_prod = table.find('tr.no-products'),
            tr      = [];

        for (let i = 0, length = this.products.length; i < length; i++) {
            const prod = this.products[i];
            const img = prod.location.split(",");
            const created = this.formdate(prod.created);


            tr.push(`
                <tr data-id="${prod.id}">
                    <td class="images"><img src="${img[0]}"></td>
                    <td class="info">
                        <div class="title">${prod.title}</div>
                        <div class="description">${prod.description}</div>
                        <div class="price">${prod.price}</div>
                        <div class="status">${this.status[prod.status]}</div>
                        <div class="adress">${prod.address}</div>
                        <div class="zipcode">${prod.zipcode}</div>
                        <div class="region">${prod.region}</div>
                        <div class="created">${created}</div>
                    </td>
                    <td class="stats">Next itteration</td>
                    <td class="actions">TODO Create some actions</td>
                </tr>
            `);
        }

        if(tr.length > 0)
        {
            no_prod.remove();
            table.append(tr.join(""));
        }
    }

}



$( document ).ready(function() {

    if(window.File && window.FileList && window.FileReader)
    {
        let cp = new CreateProduct;
        cp.init();
    }
    else
    {
        alert("Din browser er desværre for gammel");
    }
});
