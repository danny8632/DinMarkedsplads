$(document).ready(function () {

    $.ajax({
        type: "GET",
        url: "/api/categories",
        timeout: 600000,
        success: function (data) {

            var response = JSON.parse(data)

            console.log(response)

            for (var i = 0; i < response.length; ++i) {
                var post = response[i];

                var fileHtml = getPostType(post.file);
                var imgConId = `postMedia${i + 1}`

                var html = `
                <div class="item" onclick="window.location.replace("./product?id=$post.id");">
                    <div class="itemContentCon">
                        <div class="itemTitleCon">
                            <div class="itemTitle" >${post.title}</div>
                        </div>

                        <div class="itemImgCon">
                            <img src="${post.location}">
                        </div>

                        <div class="itemInfoCon">
                            <p class="itemPrice">Pris: ${post.price}kr</p>
                        </div>
                    </div>
                </div>
                `

                $("#products").append(html);
            }

        },
        error: function (e) {

            console.log("ERROR : ", e);

        }
    });

});