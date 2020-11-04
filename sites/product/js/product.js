$(document).ready(function () {

    let body    = $("body"),
        params  = new URLSearchParams(location.search),
        id      = params.get('id'),
        content =  $("#content"),
        slideindex = 1;

    fetch_post(id, (resp) => {
        fetch_comments(resp, (data) => {
            render_post(data, content, slideindex, () => {

                let commentsCon      = body.find('.wrapper #content .infoCon .commentsCon'),
                    createCommentBtn = commentsCon.find('#buttons #createComment');

                createCommentBtn.on("click", (e) => {
                    let commentText = e.currentTarget.parentNode.previousElementSibling.firstElementChild;
                    postComment(commentText.value, id);
                    commentText.value = "";
                })
            
                commentsCon.on("click", ".edit", (elm) => {
                    let commentid = elm.currentTarget.parentNode.parentNode.dataset.id,
                        text      = document.getElementById(commentid).innerText;
            
                    document.getElementById('commentInputField').value = text;
                    createCommentBtn.hide();
                    document.getElementById("dmBtn").style.display = "none";
                    document.getElementById("saveEdit").style.display = "unset";
                    document.getElementById("cancelEdit").style.display = "unset";
                    document.getElementById("saveEdit").dataset.id = commentid;
                })

                commentsCon.on("click", "#saveEdit", (elm) => {
                    let commentText = document.getElementById("commentInputField").value;
            
                    editComment(commentText, id, elm.currentTarget.dataset.id);
            
                    createCommentBtn.show();
                    document.getElementById("dmBtn").style.display = "unset";
                    document.getElementById("saveEdit").style.display = "none";
                    document.getElementById("cancelEdit").style.display = "none";
                    document.getElementById("commentInputField").value = "";
                })
            
                commentsCon.on("click", "#cancelEdit", () => {
                    createCommentBtn.show();
                    document.getElementById("dmBtn").style.display = "unset";
                    document.getElementById("saveEdit").style.display = "none";
                    document.getElementById("cancelEdit").style.display = "none";
                    document.getElementById("commentInputField").value = "";
                })
            
                commentsCon.on("click", "#removeComment", (elm) => {
                    let commentid = elm.currentTarget.parentNode.parentNode.dataset.id;
                    deleteComment(id, commentid);
                })

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
            
                    show_image(slideindex, content);
                });
            });
        })
    })
    
   
})

function fetch_post(id, cb) {

    api_get("products/get", {"id": id}, (resp) => {

        if(typeof resp.success === "undefined" || resp === false) return console.error("api fail", resp);
        
        let data = resp.data[0];

        if(typeof cb == "function") cb(data);
    })
}

function fetch_comments(data, cb) {

    api_get("comments", {"id": data.id}, (resp) => {

        if(typeof resp.success === "undefined" || resp === false) return console.error("api fail", resp);
        
        data['comments'] = resp.data;

        if(typeof cb == "function") cb(data);
    });
}


function render_post(data, content, slideindex, cb) {

    let imgs   = data.location.split(",");
    
    let html = `
        <div class="titleCon">
            <p class="title">${data.title}</p>
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
                        Pris: ${data.price}kr
                    </div>
                </div>

                <div class="description">
                    <p class="text">
                        ${data.description}
                    </p>
                </div>
            </div>

            <div class="commentsCon">
                <div class="commentsTitleCon">
                    <div class="commentsTitle">
                        Kommentarer:
                    </div>
                    
                </div>
                <div class="comments" id="commentBox">
                    ${data.comments.length > 0 ? 
                        data.comments.map(comment => render_comment(comment)).join("")
                    : ''}
                </div>
                <div class="commentForm">
                    <textarea id="commentInputField" class="commentFormText" name="commentText" placeholder="Skriv kommentar her..."></textarea>
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

    content.html(html);
    
    show_image(slideindex, content);

    if(typeof cb == "function") cb();
}


function render_comment(comment) {

    let userid = typeof global_var.user_id == "undefined" ? -1 : global_var.user_id;

    return comment.userId == userid ? `
        <div class="commentBoxCon" data-id="${comment.id}">
            <div class="commentBox">
                <div class="commentName">
                    ${comment.username}
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
    ` : `
        <div class="commentBox">
            <div class="commentName">
                ${comment.username}
            </div>
            <div class="commentText" id="${comment.id}">
                ${comment.comment}
            </div>
        </div>
    `;
}


function show_image(number, content) {

    number = number -1;

    $.each(content.find('.pictureCon .pictures .images-wrapper img'), (i, elm) => {

        $(elm).toggleClass("shown", i == number)

    })
}


function postComment (text, id)
{   
    var data = {"product_id": id, "text": text}
    
    api_post("comments", data, (resp) => {

        if(typeof resp.success == "undefined" || resp.success === false) return console.error("failed to create comment");

        $(document.getElementById("commentBox")).append(render_comment(resp.data));
    })
}

function editComment (text, id, commentId) 
{
    var data = {
        "method" : "updateComment",
        "product_id": id,
        "comment_id": commentId,
        "text": text
    }
    api_ajax("comments", data, (resp) => {

        if(typeof resp.success == "undefined" || resp.success === false) return console.error("failed to update comment");

        document.getElementById(commentId).innerText = text;
    })
}

function deleteComment (id, commentId)
{
    var data = {
        "method" : "deleteComment",
        "product_id": id,
        "comment_id": commentId
    }
    api_ajax("comments", data, (resp) => {

        if(typeof resp.success == "undefined" || resp.success === false) return console.error("failed to delete comment");

        document.getElementById(commentId).parentNode.parentNode.remove();
    })
}