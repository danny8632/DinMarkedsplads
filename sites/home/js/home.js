$(document).ready(function () {

    $("#categories").on("click", ".categori", (categori) => {

        let id = $(categori.currentTarget).attr("data-id");
        $("#products").find(".item").remove();
        getProductFromCategori(id);
    })

    $("#products").on("click", ".item", (product) => {

        let id = $(product.currentTarget).attr("data-id");

        window.location.replace(`./product?id=${id}`);
    })

    api_get("categories", (resp) => {

        if(typeof resp.success === "undefined" || resp === false || typeof resp.data === undefined || resp.data.length <= 0)
        {
            return; //  Fejl
        }

		console.log(resp.data);
        let data = resp.data;

        for (var i = 0; i < data.length; ++i) {
            var categori = data[i];

            let categoriID = categori.id 

            var html = `
                <li class="categori" id="categori" data-id="${categoriID}">${categori.name}</li>
            `;

            $("#categories").append(html);
        }

    })

    api_get("products/get", (resp) => {

        if(typeof resp.success === "undefined" || resp === false || typeof resp.data === undefined || resp.data.length <= 0)
        {
            return; //  Fejl
        }

		console.log(resp.data);
        let data = resp.data;

        for (var i = 0; i < data.length; ++i) {
            var product = data[i];

            let productID = product.id;

            let imgs = product.location.split(",");

            var html = `
                <div class="item" data-id="${productID}">
                    <div class="itemContentCon">
                        <div class="itemTitleCon">
                            <div class="itemTitle" >${product.title}</div>
                        </div>

                        <div class="itemImgCon">
                            <img src="${imgs[0]}">
                        </div>

                        <div class="itemInfoCon">
                            <p class="itemPrice">Pris: ${product.price}kr</p>
                        </div>
                    </div>
                </div>
            `;

            $("#products").append(html);
        }

    })

});

function getProductFromCategori(categoriID)
{
    console.log("hey");
    api_get("categories", {"categoryId": categoriID},  (resp) => {
        console.log("hey");
        if(typeof resp.success === "undefined" || resp.success === false || typeof resp.data === undefined || resp.data.length <= 0)
        {
            return; //  Fejl
        }
        
        console.log(resp.data);
        let data = resp.data;
    
        for (var i = 0; i < data.length; ++i) {
            var product = data[i];
    
            let productID = 1 //    Change this to dynamic value!!!!
    
            var html = `
                <div class="item" data-id="${productID}">
                    <div class="itemContentCon">
                        <div class="itemTitleCon">
                            <div class="itemTitle" >${product.title}</div>
                        </div>
    
                        <div class="itemImgCon">
                            <img src="${product.location}">
                        </div>
    
                        <div class="itemInfoCon">
                            <p class="itemPrice">Pris: ${product.price}kr</p>
                        </div>
                    </div>
                </div>
            `;
    
            $("#products").append(html);
        }
    })
}
