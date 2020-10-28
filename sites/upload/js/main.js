class CreateProduct {

    constructor() {

        this.container = $(`.container`);

        this.modal = $(`.modal.upload-images-modal`);

        this.images = [];

        this.images_html = [];

        this.is_bound = false;

        this.show_upload_warning = false;
    }


    init() {

        this.modal.find('.modal-footer .upload-images').toggleClass("disabled", true);

        

        this.bind_event_handlers();
    }


    bind_event_handlers() {

        if(this.is_bound) return;

        this.container.on('click', '.form-wrapper .images-input-wrapper .upload-img', () => {
            this.modal.toggleClass("hidden", false);
        });

        this.container.on("change", "input, textarea", (e) => {

            let value = e.currentTarget.value;

            if(value != "")
            {
                $(e.currentTarget).toggleClass("invalid", false);
            }
        });



        this.modal.on('change', ".modal-body .upload-wrapper input", (e) => {
            this.handle_modal_image_upload(e.currentTarget);
        });

        this.modal.on("click", ".modal-footer .close-upload", () => {
            this.modal.toggleClass("hidden", true);
        });

        this.modal.on("click", ".modal-footer .upload-images", () => {
            this.complete_upload_modal();
        });


        this.is_bound = true;
    }


    handle_modal_image_upload(input) {

        let files = input.files;
        const ALLOWED_FILE_TYPES = ["gif", "png", "jpg", "jpeg", "bmp", "webp"];

        let image_wrapper = this.modal.find('.modal-body div.images');

        image_wrapper.html("");

        if(files.length === 0)
        {
            this.modal.find('.modal-body .warning-text').toggleClass("hidden", false);
            return;
        }

        for (let i = 0, length = files.length; i < length; i++) {
            const file = files[i];
            
            let types = file.type.split("/"),
                extension = typeof types[1] == "undefined" ? types[0] : types[1];

            if(ALLOWED_FILE_TYPES.indexOf(extension) === -1)
            {
                this.show_upload_warning = true;
                continue;
            }

            try {
                let reader = new FileReader();

                reader.onload = (readerEvent) => {
                    let image_html = document.createElement("div");

                    image_html.classList.add("image-wrapper");
                    image_html.innerHTML = `<img src="${readerEvent.target.result}" />`;
                    
                    this.images_html.push(image_html);

                    this.modal.find('.modal-footer .upload-images').removeClass("disabled");

                    image_wrapper.append(image_html);
                }
                reader.readAsDataURL(file);

                this.images.push(file);
            
            } catch (error) {
                this.show_upload_warning = true;
            }
        }

        this.modal.find('.modal-body .warning-text').toggleClass("hidden", !this.show_upload_warning);
    }


    complete_upload_modal() {

        this.modal.toggleClass("hidden", true);

        this.container.find('.images-input-wrapper .images-wrapper .images').html("");

        for (let i = 0, length = this.images_html.length; i < length; i++) {
            const elm = this.images_html[i];
            this.container.find('.images-input-wrapper .images-wrapper .images').append(elm)
        }

        this.container.find('.footer .create-product').toggleClass('disabled', this.images_html.length <= 0); 

    }


    validate_input_feilds() {

        let form = this.container.find('.form-wrapper');

        form.each("input, textarea", (i, elm) => {

            let val = $(elm).val();

            if(val === "") { $(elm).toggleClass("invalid", true); }
        })

    }


    create_product() {

        this.validate_input_feilds();

        if(this.container.find('input.invalid, textare.invalid').length > 0) return false;

        if(this.images.length <= 0) return false;

        
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



/* 

    
    var form = $(`form.uploadPost`);

    form.on( "submit", function( event ) {
        event.preventDefault();

        var form = $(`form.uploadPost`)[0];

		// Create an FormData object 
        var data = new FormData(form);

        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: "/api_v1/post",
            data: data,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            success: function (data) {

                data = JSON.parse(data);
                console.log(data);
                console.log("SUCCESS : ", data);



                data = data.trim();

                console.log(data)

                $('#myModal').find('.buttonsCon').append(`<a id="postMake" class="postmake" href="/post?id=${data}">go to post</a>`)

            },
            error: function (e) {

                console.log("ERROR : ", e);

            }
        });

    });

    

    $('#fileToUpload').on('change', (evt) => {
        console.log("event")

        $.extend(new FileReader(), {
            onload: function(e) {
                $("#img").attr("src", URL.createObjectURL(new Blob([e.target.result]))).css("display", "block")
            }
        }).readAsArrayBuffer(evt.target.files[0])
    });


    $("[type=file]").change(function() {


        if (window.File && window.FileReader && window.Blob)
        {
            console.log("hej")
        }

        $.extend(new FileReader(), {
            onload: function(e) {
                console.log(img.attr("src"))
                img.attr("src", URL.createObjectURL(new Blob([e.target.result])))
            }
        }).readAsArrayBuffer(this.files[0])
    })
    
    // Get the modal
    var modal = document.getElementById("myModal");

    // Get the button that opens the modal
    var btn = document.getElementById("openModal");
    
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal
    btn.onclick = function() {
            var title = document.forms["uploadPost"]["title"].value;
            var desc = document.forms["uploadPost"]["description"].value;
            var img = document.forms["uploadPost"]["fileToUpload"].value;
            if (title == "" || desc == "" || img == "") {
                
            }
            else {
                modal.style.display = "block"
            }
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    } */
});