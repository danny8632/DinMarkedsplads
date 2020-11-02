$(document).ready(function () {

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
                    ${imgs.length > 1 ? `

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
                        <div class="buttonsCon">
                            <button class="btn">Kontakt sælger</button>
                            <button class="btn">Opret kommentar</button>
                        </div>
                    </div>
                    <div class="comments">
                        <div class="commentBox">
                            <div class="commentName">
                                Felix
                            </div>

                            <div class="commentText">
                                Lorem ipsum lol nice hvad koster den
                            </div>
                        </div>

                        <div class="commentBox">
                            <div class="commentName">
                                Felix
                            </div>

                            <div class="commentText">
                                Lorem ipsum heag ke awlrpa eheuawje ekawue eawueujaaiwe wearuawiloeui euaiopleu  waeualwue reuarewlweuawl  eualæ
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;

            content.append(html);
        }

        show_image(slideindex);

    })

})