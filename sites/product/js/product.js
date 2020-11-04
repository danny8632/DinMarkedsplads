$(document).ready(function (e) {

    $("body").on("click", "#createComment", () => {
        let commentText = $(".commentFormText").val();

        postComment(commentText, id);
    })

    $("body").on("click", ".edit", (element) => {
        let commentid = $(element.currentTarget).parent().parent().attr("data-id");
        var newElement = "#"+commentid;
        let text = $(newElement).text().trim();

        $("#commentInputField").text(text);

        $("#createComment").hide();
        $("#dmBtn").hide();
        $("#saveEdit").show();
        $("#cancelEdit").show();

        $("#saveEdit").attr("data-id", commentid);
        //change comment field to input
    })

    $("body").on("click", "#saveEdit", (element) => {
        let commentId = $(element.currentTarget).attr("data-id");
        let commentText = $("#commentInputField").val();

        editComment(commentText, id, commentId);

        $("#createComment").show();
        $("#dmBtn").show();
        $("#saveEdit").hide();
        $("#cancelEdit").hide();

        $("#commentInputField").val("");
    })

    $("body").on("click", "#cancelEdit", () => {
        $("#createComment").show();
        $("#dmBtn").show();
        $("#saveEdit").hide();
        $("#cancelEdit").hide();

        $("#commentInputField").val("");
    })

    $("body").on("click", "#removeComment", (element) => {
        let commentid = $(element.currentTarget).parent().parent().attr("data-id");

        deleteComment(id, commentid);
    })

    let userid = $("#userid").val();

    console.log(userid);
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
                        <textarea id="commentInputField" class="commentFormText" name="commentText" placeholder="Skriv kommentar her..." required></textarea>
                    </div>
                    <div class="buttonsCon" id="buttons">
                        <button class="btn" id="createComment">Opret kommentar</button>
                        <button class="btn" id="saveEdit" data-id="" style="display: none;">Gem</button>
                        <button class="btn" id="cancelEdit" style="display: none;">Annuller</button>
                        <button class="btn" id="dmBtn">Kontakt sælger</button>
                    </div>
                </div>
            </div>
            `;

            content.append(html);
        }

        show_image(slideindex);

    })

    
    
    api_get("comments", {"id": id}, (resp) => { 

        if(typeof resp.success === "undefined" || resp === false || typeof resp.data === undefined || resp.data.length <= 0)
        {
            return; //  Fejl
        }

        let data = resp.data;
        

        for (var i = 0; i < data.length; ++i) {
            var comment = data[i];
            var html = "";

            //Convert first letter of username to uppercase
            let username = comment.username
            username = username.charAt(0).toUpperCase() + username.slice(1);

            if(comment.userId == userid)
            {
                html = `
                <div class="commentBoxCon" data-id="${comment.id}">
                    <div class="commentBox">
                        <div class="commentName">
                            ${username}
                        </div>
                        <div class="commentText" id="${comment.id}">
                            ${comment.comment}
                        </div>
                    </div>
                    <div class="buttonsCon2">
                        <div class="btn edit">Rediger kommentar</div>
                        <div class="btn" id="removeComment">Slet kommentar</div>
                    </div>
                </div>
            `;
            }else {
                html = `
                <div class="commentBox">
                    <div class="commentName">
                        ${username}
                    </div>
                    <div class="commentText" id="${comment.id}">
                        ${comment.comment}
                    </div>
                </div>
            `;
            } 
            $("#commentBox").append(html);
        }
    })

   
})

function postComment (text, id)
{   
    var data = {"product_id": id, "text": text}
    
    api_post("comments", data, (resp) => {})
}

function editComment (text, id, commentId) 
{
    var data = {
        "method" : "updateComment",
        "product_id": id,
        "comment_id": commentId,
        "text": text
    }
    api_ajax("comments", data, (resp) => {})
}

function deleteComment (id, commentId)
{
    var data = {
        "method" : "deleteComment",
        "product_id": id,
        "comment_id": commentId
    }
    api_ajax("comments", data, (resp) => {})
}