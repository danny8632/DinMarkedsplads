$(document).ready(function () {

    let params = new URLSearchParams(location.search);
    var id = params.get('id');

    console.log(id);
    api_get("products/get", {"id": id}, (resp) => {

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
            <div class="titleCon">
                <p class="title">${product.title}</p>
            </div>

            <div class="pictureCon">
                <div class="pictures">
                    ${product.location}
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

            $("#content").append(html);
        }

    })

})