$(document).ready(function () {

    /*$("#products").on("click", ".item", (product) => {

        let id = $(product).attr("data-id");

        window.location.replace(`./product?id=${id}`);
    })*/

    $("#products").on("click", ".item", (product) => {

        let id = $(product).attr("data-id");

        window.location.replace(`./product?id=${id}`);
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

            let productID = product.id //    Change this to dynamic value!!!!

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

});

function getProductFromCategori()
{
    api_get("products/get", (resp) => {

        if(typeof resp.success === "undefined" || resp.success === false || typeof resp.data === undefined || resp.data.length <= 0)
        {
            return; //  Fejl
        }
    
        let data = resp.data;
    
        for (var i = 0; i < data.length; ++i) {
            var product = data[i];
    
            var fileHtml = getPostType(product.file);
            var imgConId = `postMedia${i + 1}`
    
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
