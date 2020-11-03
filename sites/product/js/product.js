$(document).ready(function (e) {

    $("body").on("click", "#createComment", () => {
        let commentText = $(".commentFormText").val();
        console.log(commentText)
        console.log(id)
        postComment(commentText, id);
    })

    let content =  $("#content");

    let params = new URLSearchParams(location.search);
    var id = params.get('id');

    let slideindex = 1;

    

    content.on("click", ".pictureCon .pictures .btn", (e) => {

        let btn = e.currentTarget,
            pic_wrapper = $(btn).siblings('.images-wrapper')[0],
            value = slideindex + (btn.classList.contains("forward-btn") ? 1 : -1),
            pic_length = pic_wrapper.children.length;

        if(pic_length < value) 
            slideindex = 1;
        else if(value < 1) 
            slideindex = pic_length;
        else
            slideindex = value;

        show_image(slideindex);
    });


    function show_image(number) {

        number = number -1;

        $.each(content.find('.pictureCon .pictures .images-wrapper img'), (i, elm) => {

            $(elm).toggleClass("shown", i == number)

        })
    }

    
    api_get("products/get", {"id": id}, (resp) => {

        if(typeof resp.success === "undefined" || resp === false || typeof resp.data === undefined || resp.data.length <= 0)
        {
            return; //  Fejl
        }

        let data = resp.data;

        for (var i = 0; i < data.length; ++i) {
            var product = data[i];

            let productID = product.id //    Change this to dynamic value!!!!

            let imgs = product.location.split(",");

            var html = `
            <div class="titleCon">
                <p class="title">${product.title}</p>
            </div>

            <div class="pictureCon">
                <div class="pictures">
                    ${imgs.length > 0 ? `

                        <div class="btn back-btn"><i class="fas fa-arrow-left"></i></div>
                        <div class="btn forward-btn"><i class="fas fa-arrow-right"></i></div>

                    ` : ''}
                    <div class="images-wrapper">
                        ${imgs.map(x => `<img src="${x}">`).join("")}
                    </div>
                </div>
            </div>

            <div class="infoCon">
                <div class="descriptionCon">
                    <div class="descriptionTitleCon">
                        <div class="descriptionTitle"> 
                            Info om produkt:
                        </div>
                        <div class="price">
                            Pris: ${product.price}kr
                        </div>
                    </div>

                    <div class="description">
                        <p class="text">
                            ${product.description}
                        </p>
                    </div>

                    <div class="backButtonCon">
                        <button class="btn">Tilbage</button>
                    </div>
                </div>

                <div class="commentsCon">
                    <div class="commentsTitleCon">
                        <div class="commentsTitle">
                            Kommentarer:
                        </div>
                        
                    </div>
                    <div class="comments" id="commentBox">
                        
                    </div>
                    <div class="commentForm">
                        <textarea class="commentFormText" name="commentText" placeholder="Skriv kommentar her..." required></textarea>
                    </div>
                    <div class="buttonsCon" id="buttons">
                        <button class="btn">Kontakt sælger</button>
                        <button class="btn" id="createComment">Opret kommentar</button>
                    </div>
                </div>
            </div>
            `;

            content.append(html);
        }

        show_image(slideindex);

    })

    
    
    api_get("products/get", {"id": id}, (resp) => { 

        if(typeof resp.success === "undefined" || resp === false || typeof resp.data === undefined || resp.data.length <= 0)
        {
            return; //  Fejl
        }

        let data = resp.data;

        for (var i = 0; i < data.length; ++i) {
            var comment = data[i];

            var html = `
                <div class="commentBox">
                    <div class="commentName">
                        ${comment.username}
                    </div>

                    <div class="commentText">
                        ${comment.comment}
                    </div>
                </div>
            `;
            $("#commentBox").append(html);
        }
    })

   
})

function postComment (text, id)
{   
    var data = {"method": "_POST", "product_id": id, "text": text}
    console.log(data)
    api_ajax("comments", data, (resp) => {
        console.log(resp);
    })
}